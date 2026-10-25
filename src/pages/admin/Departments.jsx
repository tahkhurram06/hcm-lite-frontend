import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as orgApi from "../../api/org";
import PageState from "../../components/PageState";

export default function Departments() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["departments"],
    queryFn: orgApi.listDepartments,
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState(null);

  const createMutation = useMutation({
    mutationFn: orgApi.createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setName("");
      setDescription("");
      setFormError("");
    },
    onError: (err) => setFormError(err.response?.data?.message || "Could not create department"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) => orgApi.updateDepartment(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });

  function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name: name.trim(), description: description.trim() || undefined });
  }

  if (isLoading) return <PageState text="Loading departments..." />;
  if (isError) return <PageState text="Could not load departments." error />;

  const departments = data?.departments || [];

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Departments</h1>

      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-5 mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="Department name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        {formError && <div className="text-sm text-red-600">{formError}</div>}
        <button type="submit" disabled={createMutation.isPending} className="btn-primary">
          {createMutation.isPending ? "Adding..." : "Add department"}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow divide-y">
        {departments.length === 0 && (
          <div className="p-5 text-sm text-gray-500">No departments yet — add one above.</div>
        )}
        {departments.map((dept) => (
          <div key={dept._id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800">{dept.name}</div>
              {dept.description && <div className="text-sm text-gray-500">{dept.description}</div>}
            </div>
            <button
              onClick={() => toggleActiveMutation.mutate({ id: dept._id, isActive: !dept.isActive })}
              className="btn-secondary text-xs"
            >
              {dept.isActive ? "Deactivate" : "Activate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}