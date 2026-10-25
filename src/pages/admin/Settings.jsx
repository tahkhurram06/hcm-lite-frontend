import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as orgApi from "../../api/org";
import Field from "../../components/Field";
import PageState from "../../components/PageState";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Settings() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["org-settings"],
    queryFn: orgApi.getSettings,
  });

  const [form, setForm] = useState(null);
  const [savedMsg, setSavedMsg] = useState("");

  // Populate the form once settings load.
  useEffect(() => {
    if (data?.settings) {
      const s = data.settings;
      setForm({
        companyName: s.companyName || "",
        officeStartTime: s.officeStartTime || "09:00",
        graceMinutes: s.graceMinutes ?? 15,
        halfDayThresholdHours: s.halfDayThresholdHours ?? 5,
        weekendDays: s.weekendDays || [0, 6],
        lat: s.officeLocation?.lat ?? "",
        lng: s.officeLocation?.lng ?? "",
        radiusMeters: s.officeLocation?.radiusMeters ?? 150,
      });
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload) => orgApi.updateSettings(payload),
    onSuccess: () => {
      setSavedMsg("Saved.");
      queryClient.invalidateQueries({ queryKey: ["org-settings"] });
      setTimeout(() => setSavedMsg(""), 2000);
    },
  });

  function toggleWeekendDay(day) {
    setForm((f) => {
      const has = f.weekendDays.includes(day);
      return { ...f, weekendDays: has ? f.weekendDays.filter((d) => d !== day) : [...f.weekendDays, day] };
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    mutation.mutate({
      companyName: form.companyName,
      officeStartTime: form.officeStartTime,
      graceMinutes: Number(form.graceMinutes),
      halfDayThresholdHours: Number(form.halfDayThresholdHours),
      weekendDays: form.weekendDays,
      officeLocation: {
        lat: form.lat === "" ? undefined : Number(form.lat),
        lng: form.lng === "" ? undefined : Number(form.lng),
        radiusMeters: Number(form.radiusMeters),
      },
    });
  }

  if (isLoading || !form) return <PageState text="Loading settings..." />;
  if (isError) return <PageState text="Could not load settings." error />;

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Company Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-lg shadow p-6">
        <Field label="Company name">
          <input
            className="input"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Office start time">
            <input
              type="time"
              className="input"
              value={form.officeStartTime}
              onChange={(e) => setForm({ ...form, officeStartTime: e.target.value })}
            />
          </Field>
          <Field label="Grace minutes">
            <input
              type="number"
              min="0"
              className="input"
              value={form.graceMinutes}
              onChange={(e) => setForm({ ...form, graceMinutes: e.target.value })}
            />
          </Field>
        </div>

        <Field label="Half-day threshold (hours)">
          <input
            type="number"
            min="0"
            step="0.5"
            className="input max-w-xs"
            value={form.halfDayThresholdHours}
            onChange={(e) => setForm({ ...form, halfDayThresholdHours: e.target.value })}
          />
        </Field>

        <Field label="Weekend days">
          <div className="flex gap-2 flex-wrap">
            {DAY_LABELS.map((label, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => toggleWeekendDay(idx)}
                className={`px-3 py-1.5 rounded-md text-sm border ${
                  form.weekendDays.includes(idx)
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Field>

        <div className="border-t pt-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Office location (for camera check-in geofence — optional)
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Latitude">
              <input
                type="number"
                step="any"
                className="input"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
              />
            </Field>
            <Field label="Longitude">
              <input
                type="number"
                step="any"
                className="input"
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
              />
            </Field>
            <Field label="Radius (meters)">
              <input
                type="number"
                min="0"
                className="input"
                value={form.radiusMeters}
                onChange={(e) => setForm({ ...form, radiusMeters: e.target.value })}
              />
            </Field>
          </div>
        </div>

        {mutation.isError && (
          <div className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">
            {mutation.error?.response?.data?.message || "Could not save settings."}
          </div>
        )}

        <div className="flex items-center gap-3">
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? "Saving..." : "Save settings"}
          </button>
          {savedMsg && <span className="text-sm text-green-600">{savedMsg}</span>}
        </div>
      </form>
    </div>
  );
}