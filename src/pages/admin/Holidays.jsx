import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as orgApi from "../../api/org";
import PageState from "../../components/PageState";

export default function Holidays() {
  const queryClient = useQueryClient();
  const [year, setYear] = useState(new Date().getFullYear());

  const { data, isLoading, isError } = useQuery({
    queryKey: ["holidays", year],
    queryFn: () => orgApi.listHolidays({ year }),
  });

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [formError, setFormError] = useState("");

  const createMutation = useMutation({
    mutationFn: orgApi.createHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["holidays", year] });
      setName("");
      setDate("");
      setFormError("");
    },
    onError: (err) => setFormError(err.response?.data?.message || "Could not add holiday"),
  });

  const deleteMutation = useMutation({
    mutationFn: orgApi.deleteHoliday,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["holidays", year] }),
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !date) return;
    createMutation.mutate({ name: name.trim(), date });
  }

  const holidays = data?.holidays || [];

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-800">Public Holidays</h1>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="input w-28"
        >
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-5 mb-6 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <input
            className="input"
            placeholder="Holiday name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {formError && <div className="text-sm text-red-600">{formError}</div>}
        <button type="submit" disabled={createMutation.isPending} className="btn-primary">
          {createMutation.isPending ? "Adding..." : "Add holiday"}
        </button>
      </form>

      {isLoading && <PageState text="Loading holidays..." />}
      {isError && <PageState text="Could not load holidays." error />}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg shadow divide-y">
          {holidays.length === 0 && (
            <div className="p-5 text-sm text-gray-500">No holidays added for {year}.</div>
          )}
          {holidays.map((h) => (
            <div key={h._id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">{h.name}</div>
                <div className="text-sm text-gray-500">
                  {new Date(h.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "UTC",
                  })}
                </div>
              </div>
              <button onClick={() => deleteMutation.mutate(h._id)} className="btn-danger">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}