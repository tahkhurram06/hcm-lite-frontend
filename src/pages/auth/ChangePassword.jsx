import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authApi from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

export default function ChangePassword() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      updateUser({ mustChangePassword: false });
      navigate(`/${user.role}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Could not change password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-slate-100">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-xl shadow-xl p-6 space-y-4 animate-slide-up">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Set a new password</h1>
          <p className="text-sm text-gray-500 mt-1">
            You're using a temporary password. Set your own before continuing.
          </p>
        </div>

        {error && <div className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</div>}

        <label className="block">
          <span className="text-sm font-medium text-gray-700">Temporary password</span>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            className="input mt-1"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-gray-700">New password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            className="input mt-1"
          />
        </label>

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "Saving..." : "Set password & continue"}
        </button>
      </form>
    </div>
  );
}