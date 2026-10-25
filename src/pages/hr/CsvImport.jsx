import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as employeeApi from "../../api/employees";

export default function CsvImport() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dryRunResult, setDryRunResult] = useState(null); // { totalRows, validCount, errorCount, errors }
  const [importResult, setImportResult] = useState(null); // { totalRows, createdCount, errorCount, created, errors }
  const [error, setError] = useState("");

  const dryRunMutation = useMutation({
    mutationFn: employeeApi.dryRunImportEmployees,
    onSuccess: (res) => {
      setDryRunResult(res);
      setImportResult(null);
      setError("");
    },
    onError: (err) => setError(err.response?.data?.message || "Could not validate the CSV"),
  });

  const importMutation = useMutation({
    mutationFn: employeeApi.importEmployees,
    onSuccess: (res) => {
      setImportResult(res);
      setError("");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
    onError: (err) => setError(err.response?.data?.message || "Could not import the CSV"),
  });

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    setFile(f || null);
    setDryRunResult(null);
    setImportResult(null);
    setError("");
  }

  function handleDryRun() {
    if (!file) return;
    dryRunMutation.mutate(file);
  }

  function handleImport() {
    if (!file) return;
    importMutation.mutate(file);
  }

  function handleReset() {
    setFile(null);
    setDryRunResult(null);
    setImportResult(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const busy = dryRunMutation.isPending || importMutation.isPending;

  return (
    <div className="p-8 max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">CSV Import</h1>
        <Link to="/hr/employees" className="text-sm text-slate-700 hover:underline">
          Back to directory
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <div className="text-sm font-semibold text-gray-700">Upload roster</div>
          <p className="text-xs text-gray-400 mt-1">
            Expected columns: <code className="bg-gray-100 px-1 rounded">code, name, email, phone, address,
            department, designation, dateOfJoining, basicSalary</code>. Dates must be ISO (YYYY-MM-DD). Run a
            dry-run first — nothing is written to the database until you import.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:text-white file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-800"
        />

        {error && <div className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</div>}

        <div className="flex items-center gap-3">
          <button onClick={handleDryRun} disabled={!file || busy} className="btn-secondary">
            {dryRunMutation.isPending ? "Validating..." : "Dry run (validate only)"}
          </button>
          <button
            onClick={handleImport}
            disabled={!file || busy || !dryRunResult}
            className="btn-primary disabled:opacity-50"
          >
            {importMutation.isPending ? "Importing..." : "Import"}
          </button>
          {(file || dryRunResult || importResult) && (
            <button onClick={handleReset} className="text-sm text-gray-500 hover:underline">
              Reset
            </button>
          )}
        </div>
        {!dryRunResult && file && (
          <p className="text-xs text-gray-400">Run the dry-run first — import is only enabled once it has checked the file.</p>
        )}
      </div>

      {/* Dry-run report */}
      {dryRunResult && !importResult && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="text-sm font-semibold text-gray-700">Dry-run report</div>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Total rows" value={dryRunResult.totalRows} />
            <Stat label="Valid" value={dryRunResult.validCount} tone="text-green-700" />
            <Stat label="Errors" value={dryRunResult.errorCount} tone="text-red-700" />
          </div>
          <ErrorTable errors={dryRunResult.errors} />
          {dryRunResult.validCount > 0 && (
            <p className="text-xs text-gray-400">
              {dryRunResult.validCount} row(s) are ready to import. Rows with errors will be skipped and
              reported again on import.
            </p>
          )}
        </div>
      )}

      {/* Import result */}
      {importResult && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <div className="text-sm font-semibold text-gray-700">Import result</div>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Total rows" value={importResult.totalRows} />
            <Stat label="Created" value={importResult.createdCount} tone="text-green-700" />
            <Stat label="Errors" value={importResult.errorCount} tone="text-red-700" />
          </div>

          {importResult.created.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 mb-2">
                Created employees — temporary passwords (shown once, hand these out now)
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-md divide-y divide-amber-200">
                {importResult.created.map((c) => (
                  <div key={c.row} className="px-3 py-2 flex items-center justify-between text-sm">
                    <span className="text-amber-900">
                      Row {c.row} · {c.code} · {c.email}
                    </span>
                    <span className="font-mono text-amber-900">{c.temporaryPassword}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ErrorTable errors={importResult.errors} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, tone = "text-gray-800" }) {
  return (
    <div className="border rounded-md p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`text-xl font-semibold mt-1 ${tone}`}>{value}</div>
    </div>
  );
}

function ErrorTable({ errors }) {
  if (!errors || errors.length === 0) return null;
  return (
    <div>
      <div className="text-xs font-medium text-gray-500 mb-2">Errors</div>
      <div className="bg-red-50 rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-red-800 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Row</th>
              <th className="px-3 py-2 font-medium">Field</th>
              <th className="px-3 py-2 font-medium">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-red-100">
            {errors.map((e, i) => (
              <tr key={i}>
                <td className="px-3 py-2 text-red-700">{e.row}</td>
                <td className="px-3 py-2 text-red-700">{e.field}</td>
                <td className="px-3 py-2 text-red-700">{e.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}