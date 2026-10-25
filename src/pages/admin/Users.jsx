import { useState, Fragment } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as authApi from "../../api/auth";
import Field from "../../components/Field";
import PageState from "../../components/PageState";

const EMPTY_FORM = { name: "", email: "" };

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [role, setRole] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [newCred, setNewCred] = useState(null); // { user, temporaryPassword } — shown once
  const [rowCred, setRowCred] = useState(null); // { userId, email, temporaryPassword } — from reset
  const [rowError, setRowError] = useState({}); // { [userId]: message }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", role],
    queryFn: () => authApi.listUsers(role ? { role } : {}),
  });

  const createMutation = useMutation({
    mutationFn: authApi.createHrUser,
    onSuccess: (res) => {
      setNewCred(res);
      setForm(EMPTY_FORM);
      setFormError("");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err) => setFormError(err.response?.data?.message || "Could not create HR login"),
  });

  const deactivateMutation = useMutation({
    mutationFn: authApi.deactivateUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (err, id) => setRowError((e) => ({ ...e, [id]: err.response?.data?.message || "Could not deactivate" })),
  });

  const reactivateMutation = useMutation({
    mutationFn: authApi.reactivateUser,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    onError: (err, id) => setRowError((e) => ({ ...e, [id]: err.response?.data?.message || "Could not reactivate" })),
  });

  const resetMutation = useMutation({
    mutationFn: authApi.resetUserPassword,
    onSuccess: (res, userId) => {
      setRowCred({ userId, email: res.user.email, temporaryPassword: res.temporaryPassword });
      setRowError((e) => ({ ...e, [userId]: "" }));
    },
    onError: (err, id) => setRowError((e) => ({ ...e, [id]: err.response?.data?.message || "Could not reset password" })),
  });

  function handleCreate(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    createMutation.mutate({ name: form.name.trim(), email: form.email.trim() });
  }

  const users = data?.users || [];

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-xl font-semibold text-gray-800">HR & Employee Logins</h1>

      {/* Create HR login */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-sm font-semibold text-gray-700 mb-4">Create HR login</div>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <Field label="Name">
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </Field>
          <button type="submit" disabled={createMutation.isPending} className="btn-primary h-fit">
            {createMutation.isPending ? "Creating..." : "Create HR login"}
          </button>
        </form>
        {formError && <div className="mt-3 text-sm text-red-600 bg-red-50 rounded px-3 py-2">{formError}</div>}

        {newCred && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-4">
            <div className="text-sm text-amber-800 font-medium mb-1">Temporary password</div>
            <div className="text-sm text-amber-900">
              {newCred.user.name} ({newCred.user.email})
            </div>
            <div className="font-mono text-lg text-amber-900 mt-1">{newCred.temporaryPassword}</div>
            <div className="text-xs text-amber-700 mt-2">
              Share this now — it won't be shown again. They'll be asked to change it on first login.
            </div>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <select className="input w-auto" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All (HR + Employee)</option>
          <option value="hr">HR only</option>
          <option value="employee">Employee only</option>
        </select>
      </div>

      {isLoading && <PageState text="Loading users..." />}
      {isError && <PageState text="Could not load users." error />}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No users found.
                  </td>
                </tr>
              )}
              {users.map((u) => (
                <Fragment key={u._id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{u.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {u.isActive ? "active" : "deactivated"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-3">
                      {u.isActive ? (
                        <button
                          onClick={() => deactivateMutation.mutate(u._id)}
                          disabled={deactivateMutation.isPending}
                          className="text-xs text-red-600 hover:underline"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => reactivateMutation.mutate(u._id)}
                          disabled={reactivateMutation.isPending}
                          className="text-xs text-green-700 hover:underline"
                        >
                          Reactivate
                        </button>
                      )}
                      <button
                        onClick={() => resetMutation.mutate(u._id)}
                        disabled={resetMutation.isPending}
                        className="text-xs text-slate-700 hover:underline"
                      >
                        Reset password
                      </button>
                    </td>
                  </tr>
                  {rowError[u._id] && (
                    <tr>
                      <td colSpan={5} className="px-4 pb-3">
                        <div className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{rowError[u._id]}</div>
                      </td>
                    </tr>
                  )}
                  {rowCred?.userId === u._id && (
                    <tr>
                      <td colSpan={5} className="px-4 pb-3">
                        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center justify-between text-sm">
                          <span className="text-amber-900">New temporary password for {rowCred.email}</span>
                          <span className="font-mono text-amber-900">{rowCred.temporaryPassword}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}