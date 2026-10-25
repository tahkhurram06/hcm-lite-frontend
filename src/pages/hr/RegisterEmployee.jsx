import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as employeeApi from "../../api/employees";
import * as orgApi from "../../api/org";
import Field from "../../components/Field";

const EMPTY_FORM = {
  code: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  department: "",
  designation: "",
  dateOfJoining: "",
  basicSalary: "",
};

export default function RegisterEmployee() {
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null); // { employee, temporaryPassword }

  const { data: deptData } = useQuery({
    queryKey: ["departments"],
    queryFn: orgApi.listDepartments,
  });
  const { data: desigData } = useQuery({
    queryKey: ["designations"],
    queryFn: orgApi.listDesignations,
  });

  const mutation = useMutation({
    mutationFn: employeeApi.registerEmployee,
    onSuccess: (data) => {
      setResult(data);
      setError("");
    },
    onError: (err) => setError(err.response?.data?.message || "Could not register employee"),
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (Number(form.basicSalary) <= 0) {
      setError("Basic salary must be greater than 0");
      return;
    }
    mutation.mutate({ ...form, basicSalary: Number(form.basicSalary) });
  }

  function handleRegisterAnother() {
    setForm(EMPTY_FORM);
    setResult(null);
  }

  // Success state: show the temp password once (never retrievable again).
  if (result) {
    return (
      <div className="p-8 max-w-lg">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-green-600 text-sm font-medium mb-2">Employee registered</div>
          <h1 className="text-xl font-semibold text-gray-800 mb-4">{result.employee.name}</h1>

          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
            <div className="text-sm text-amber-800 font-medium mb-1">Temporary password</div>
            <div className="font-mono text-lg text-amber-900">{result.temporaryPassword}</div>
            <div className="text-xs text-amber-700 mt-2">
              Share this with {result.employee.name} now — it won't be shown again. They'll be asked
              to change it on first login.
            </div>
          </div>

          <div className="text-sm text-gray-500 space-y-1 mb-6">
            <div>
              Code: <span className="text-gray-700">{result.employee.code}</span>
            </div>
            <div>
              Email: <span className="text-gray-700">{result.employee.email}</span>
            </div>
            <div>
              Department: <span className="text-gray-700">{result.employee.department}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleRegisterAnother} className="btn-primary">
              Register another
            </button>
            <button onClick={() => navigate("/hr/employees")} className="btn-secondary">
              Back to directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Register Employee</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5">
        {error && <div className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</div>}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Employee code">
            <input name="code" className="input" value={form.code} onChange={handleChange} required />
          </Field>
          <Field label="Full name">
            <input name="name" className="input" value={form.name} onChange={handleChange} required />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Email">
            <input
              type="email"
              name="email"
              className="input"
              value={form.email}
              onChange={handleChange}
              required
            />
          </Field>
          <Field label="Phone">
            <input name="phone" className="input" value={form.phone} onChange={handleChange} />
          </Field>
        </div>

        <Field label="Address">
          <input name="address" className="input" value={form.address} onChange={handleChange} />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Department">
            <select name="department" className="input" value={form.department} onChange={handleChange} required>
              <option value="">Select department</option>
              {(deptData?.departments || []).map((d) => (
                <option key={d._id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Designation">
            <select name="designation" className="input" value={form.designation} onChange={handleChange} required>
              <option value="">Select designation</option>
              {(desigData?.designations || []).map((d) => (
                <option key={d._id} value={d.title}>
                  {d.title}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date of joining">
            <input
              type="date"
              name="dateOfJoining"
              className="input"
              value={form.dateOfJoining}
              onChange={handleChange}
              required
            />
          </Field>
          <Field label="Basic salary">
            <input
              type="number"
              min="1"
              name="basicSalary"
              className="input"
              value={form.basicSalary}
              onChange={handleChange}
              required
            />
          </Field>
        </div>

        <p className="text-xs text-gray-400">
          Registering creates this employee's login with a temporary password. Gross salary is
          computed automatically as 1.5x basic (40% HRA + 10% medical).
        </p>

        <button type="submit" disabled={mutation.isPending} className="btn-primary">
          {mutation.isPending ? "Registering..." : "Register employee"}
        </button>
      </form>
    </div>
  );
}