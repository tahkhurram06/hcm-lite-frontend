import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as leaveApi from "../../api/leave";
import PageState from "../../components/PageState";

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function LeaveInbox() {
  const queryClient = useQueryClient();
  const [commentDrafts, setCommentDrafts] = useState({}); // { [leaveId]: text }
  const [rowError, setRowError] = useState({}); // { [leaveId]: message }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["leave-inbox"],
    queryFn: leaveApi.getInbox,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, decision, comment }) => leaveApi.reviewLeave(id, { decision, comment }),
    onSuccess: (_, { id }) => {
      setRowError((e) => ({ ...e, [id]: "" }));
      queryClient.invalidateQueries({ queryKey: ["leave-inbox"] });
    },
    onError: (err, { id }) =>
      setRowError((e) => ({ ...e, [id]: err.response?.data?.message || "Could not review this request" })),
  });

  function handleDecision(id, decision) {
    reviewMutation.mutate({ id, decision, comment: commentDrafts[id] || "" });
  }

  const leaves = data?.leaves || [];

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Leave Inbox</h1>

      {isLoading && <PageState text="Loading pending requests..." />}
      {isError && <PageState text="Could not load the leave inbox." error />}

      {!isLoading && !isError && (
        <div className="space-y-4 max-w-3xl">
          {leaves.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400 text-sm">
              No pending leave requests.
            </div>
          )}
          {leaves.map((leave) => (
            <div key={leave._id} className="bg-white rounded-lg shadow p-5">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <div className="font-medium text-gray-800">
                    {leave.employee?.name}{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      {leave.employee?.code} · {leave.employee?.department}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1 capitalize">
                    {leave.leaveType} · {fmtDate(leave.startDate)} to {fmtDate(leave.endDate)} · {leave.days} day
                    {leave.days !== 1 ? "s" : ""}
                    {leave.source === "smart" && (
                      <span className="ml-2 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                        AI-assisted
                      </span>
                    )}
                  </div>
                  {leave.reason && <div className="text-sm text-gray-500 mt-1">"{leave.reason}"</div>}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <input
                  className="input flex-1 min-w-[200px]"
                  placeholder="Comment (optional)"
                  value={commentDrafts[leave._id] || ""}
                  onChange={(e) => setCommentDrafts((d) => ({ ...d, [leave._id]: e.target.value }))}
                />
                <button
                  onClick={() => handleDecision(leave._id, "approved")}
                  disabled={reviewMutation.isPending}
                  className="btn-primary text-sm"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecision(leave._id, "rejected")}
                  disabled={reviewMutation.isPending}
                  className="btn-danger"
                >
                  Reject
                </button>
              </div>
              {rowError[leave._id] && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 rounded px-3 py-2">{rowError[leave._id]}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}