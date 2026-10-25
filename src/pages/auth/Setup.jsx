import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function Setup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ companyName: "", name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await authApi.setupAdmin(form);
      // setupAdmin already returns a token, but reusing login() keeps the
      // "store token + user" logic in one place.
      await login(form.email, form.password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Setup failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-xl shadow-xl p-6 space-y-4 animate-slide-up">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Set up HCM Lite</h1>
          <p className="text-sm text-gray-500 mt-1">
            This runs once. Creates your company profile and the first Admin account.
          </p>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</div>}

        <Field label="Company name" name="companyName" value={form.companyName} onChange={handleChange} />
        <Field label="Your name" name="name" value={form.name} onChange={handleChange} />
        <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
        <Field label="Password" name="password" type="password" value={form.password} onChange={handleChange} />

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Creating..." : "Create company & admin account"}
        </button>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required
        className="input mt-1"
      />
    </label>
  );
}