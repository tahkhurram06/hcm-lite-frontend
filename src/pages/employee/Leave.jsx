import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as leaveApi from "../../api/leave";
import * as orgApi from "../../api/org";
import * as aiApi from "../../api/ai";
import PageState from "../../components/PageState";
import Field from "../../components/Field";

const EMPTY_FORM = { leaveType: "", startDate: "", endDate: "", reason: "" };

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function EmployeeLeave() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [smartText, setSmartText] = useState("");
  const [smartError, setSmartError] = useState("");
  const [smartNote, setSmartNote] = useState("");

  const { data: typesData } = useQuery({ queryKey: ["leave-types"], queryFn: orgApi.listLeaveTypes });
  const { data: balanceData, isLoading: balanceLoading } = useQuery({
    queryKey: ["leave-balance"],
    queryFn: () => leaveApi.getBalance({}),
  });
  const { data: historyData, isLoading: historyLoading, isError: historyError } = useQuery({
    queryKey: ["my-leaves"],
    queryFn: leaveApi.getMyLeaves,
  });

  const applyMutation = useMutation({
    mutationFn: leaveApi.applyLeave,
    onSuccess: () => {
      setForm(EMPTY_FORM);
      setFormError("");
      setSmartNote("");
      queryClient.invalidateQueries({ queryKey: ["my-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balance"] });
    },
    onError: (err) => setFormError(err.response?.data?.message || "Could not submit leave request"),
  });

  const cancelMutation = useMutation({
    mutationFn: leaveApi.cancelLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-leaves"] });
      queryClient.invalidateQueries({ queryKey: ["leave-balance"] });
    },
  });

  const smartMutation = useMutation({
    mutationFn: aiApi.smartLeave,
    onSuccess: (res) => {
      setForm({
        leaveType: res.leave.type,
        startDate: res.leave.startDate,
        endDate: res.leave.endDate,
        reason: res.leave.reason || "",
      });
      setSmartNote("Pre-filled from your message — review before submitting.");
      setSmartError("");
    },
    onError: (err) =>
      setSmartError(err.response?.data?.message || "Couldn't understand that — please use the form below."),
  });

  function handleFormChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    applyMutation.mutate({ ...form, source: smartNote ? "smart" : "manual" });
  }

  function handleSmartSubmit(e) {
    e.preventDefault();
    if (!smartText.trim()) return;
    setSmartError("");
    smartMutation.mutate(smartText.trim());
  }

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <h1 className="text-xl font-semibold text-gray-800">My Leave</h1>

      {/* Balance */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="text-sm font-semibold text-gray-700 mb-4">Balance this year</div>
        {balanceLoading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(balanceData?.balance || []).map((b) => (
              <div key={b.leaveType} className="border rounded-md p-3">
                <div className="text-xs text-gray-500 capitalize">{b.leaveType}</div>
                <div className="text-lg font-semibold text-gray-800">
                  {b.remaining === null ? "Unlimited" : b.remaining}
                </div>
                {b.remaining !== null && <div className="text-xs text-gray-400">of {b.quota} days</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Smart leave */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="text-sm font-semibold text-gray-700 mb-1">Smart leave</div>
        <p className="text-xs text-gray-400 mb-3">
          Describe your leave in plain words — e.g. "Need next Monday and Tuesday off for a wedding".
        </p>
        <form onSubmit={handleSmartSubmit} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Type your leave request..."
            value={smartText}
            onChange={(e) => setSmartText(e.target.value)}
          />
          <button type="submit" disabled={smartMutation.isPending} className="btn-secondary whitespace-nowrap">
            {smartMutation.isPending ? "Thinking..." : "Fill form"}
          </button>
        </form>
        {smartError && <div className="mt-2 text-sm text-red-600">{smartError}</div>}
      </div>

      {/* Apply form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 space-y-4">
        <div className="text-sm font-semibold text-gray-700">Apply for leave</div>
        {smartNote && <div className="text-xs text-purple-600 bg-purple-50 rounded px-3 py-2">{smartNote}</div>}
        {formError && <div className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{formError}</div>}

        <Field label="Leave type">
          <select name="leaveType" className="input" value={form.leaveType} onChange={handleFormChange} required>
            <option value="">Select type</option>
            {(typesData?.leaveTypes || []).map((t) => (
              <option key={t._id} value={t.name}>
                {t.name} {t.yearlyQuota !== null ? `(${t.yearlyQuota} days/yr)` : "(unlimited)"}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start date">
            <input
              type="date"
              name="startDate"
              className="input"
              value={form.startDate}
              onChange={handleFormChange}
              required
            />
          </Field>
          <Field label="End date">
            <input
              type="date"
              name="endDate"
              className="input"
              value={form.endDate}
              onChange={handleFormChange}
              required
            />
          </Field>
        </div>

        <Field label="Reason (optional)">
          <input name="reason" className="input" value={form.reason} onChange={handleFormChange} />
        </Field>

        <button type="submit" disabled={applyMutation.isPending} className="btn-primary">
          {applyMutation.isPending ? "Submitting..." : "Submit request"}
        </button>
      </form>

      {/* History */}
      <div className="bg-white rounded-lg shadow p-5">
        <div className="text-sm font-semibold text-gray-700 mb-4">History</div>
        {historyLoading && <div className="text-sm text-gray-400">Loading...</div>}
        {historyError && <div className="text-sm text-red-600">Could not load leave history.</div>}
        {!historyLoading && !historyError && (
          <div className="divide-y">
            {(historyData?.leaves || []).length === 0 && (
              <div className="text-sm text-gray-400 py-2">No leave requests yet.</div>
            )}
            {(historyData?.leaves || []).map((l) => (
              <div key={l._id} className="py-3 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="text-sm font-medium text-gray-800 capitalize">{l.leaveType}</div>
                  <div className="text-xs text-gray-500">
                    {fmtDate(l.startDate)} to {fmtDate(l.endDate)} · {l.days} day{l.days !== 1 ? "s" : ""}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[l.status]}`}>
                    {l.status}
                  </span>
                  {l.status === "pending" && (
                    <button
                      onClick={() => cancelMutation.mutate(l._id)}
                      disabled={cancelMutation.isPending}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}