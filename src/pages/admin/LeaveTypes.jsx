import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as orgApi from "../../api/org";
import PageState from "../../components/PageState";

export default function LeaveTypes() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["leave-types"],
    queryFn: orgApi.listLeaveTypes,
  });

  const [name, setName] = useState("");
  const [quota, setQuota] = useState("");
  const [unlimited, setUnlimited] = useState(false);
  const [formError, setFormError] = useState("");

  const upsertMutation = useMutation({
    mutationFn: orgApi.upsertLeaveType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leave-types"] });
      setName("");
      setQuota("");
      setUnlimited(false);
      setFormError("");
    },
    onError: (err) => setFormError(err.response?.data?.message || "Could not save leave type"),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    upsertMutation.mutate({
      name: name.trim().toLowerCase(),
      yearlyQuota: unlimited ? null : Number(quota),
    });
  }

  function editExisting(lt) {
    setName(lt.name);
    setUnlimited(lt.yearlyQuota === null);
    setQuota(lt.yearlyQuota ?? "");
  }

  if (isLoading) return <PageState text="Loading leave types..." />;
  if (isError) return <PageState text="Could not load leave types." error />;

  const leaveTypes = data?.leaveTypes || [];

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Leave Types & Quotas</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 mb-6 space-y-3">
        <div className="grid grid-cols-3 gap-3 items-end">
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <input
              className="input mt-1"
              placeholder="e.g. annual"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Yearly quota (days)</label>
            <input
              type="number"
              min="0"
              className="input mt-1"
              value={quota}
              disabled={unlimited}
              onChange={(e) => setQuota(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 pb-2">
            <input type="checkbox" checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} />
            <span className="text-sm text-gray-700">Unlimited (e.g. unpaid)</span>
          </label>
        </div>
        {formError && <div className="text-sm text-red-600">{formError}</div>}
        <button type="submit" disabled={upsertMutation.isPending} className="btn-primary">
          {upsertMutation.isPending ? "Saving..." : "Save leave type"}
        </button>
        <p className="text-xs text-gray-400">
          Entering a name that already exists updates its quota instead of creating a duplicate.
        </p>
      </form>

      <div className="bg-white rounded-lg shadow divide-y">
        {leaveTypes.length === 0 && (
          <div className="p-5 text-sm text-gray-500">No leave types yet.</div>
        )}
        {leaveTypes.map((lt) => (
          <div key={lt._id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-800 capitalize">{lt.name}</div>
              <div className="text-sm text-gray-500">
                {lt.yearlyQuota === null ? "Unlimited" : `${lt.yearlyQuota} days / year`}
              </div>
            </div>
            <button onClick={() => editExisting(lt)} className="btn-secondary text-xs">
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}