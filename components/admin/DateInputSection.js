"use client";

import { useState } from "react";
import { Plus, Trash2, CalendarDays, RefreshCw, Calendar } from "lucide-react";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#7a73ff]/30";

function generateRange({ start, end, time, weekdays }) {
  if (!start || !end || !time) return [];
  const results = [];
  const cur = new Date(`${start}T${time}`);
  const last = new Date(`${end}T${time}`);
  if (isNaN(cur) || isNaN(last) || cur > last) return [];
  while (cur <= last) {
    if (weekdays.size === 0 || weekdays.has(cur.getDay())) {
      results.push(new Date(cur).toISOString().slice(0, 16));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return results;
}

function generateRepeat({ start, intervalDays, count }) {
  if (!start || !intervalDays || !count) return [];
  const results = [];
  const cur = new Date(start);
  if (isNaN(cur)) return [];
  const n = Math.min(Number(count), 365);
  const step = Math.max(1, Number(intervalDays));
  for (let i = 0; i < n; i++) {
    results.push(new Date(cur).toISOString().slice(0, 16));
    cur.setDate(cur.getDate() + step);
  }
  return results;
}

function fmtPreview(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-KE", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function DateInputSection({ dates, onChange }) {
  const [mode, setMode] = useState("custom");

  // Range state
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [rangeTime, setRangeTime] = useState("14:00");
  const [rangeWeekdays, setRangeWeekdays] = useState(new Set());

  // Repeat state
  const [repeatStart, setRepeatStart] = useState("");
  const [repeatInterval, setRepeatInterval] = useState("1");
  const [repeatCount, setRepeatCount] = useState("7");

  const toggleWeekday = (d) => {
    const next = new Set(rangeWeekdays);
    next.has(d) ? next.delete(d) : next.add(d);
    setRangeWeekdays(next);
  };

  const rangePreview = mode === "range"
    ? generateRange({ start: rangeStart, end: rangeEnd, time: rangeTime, weekdays: rangeWeekdays })
    : [];

  const repeatPreview = mode === "repeat"
    ? generateRepeat({ start: repeatStart, intervalDays: repeatInterval, count: repeatCount })
    : [];

  const applyGenerated = (generated) => {
    const merged = Array.from(new Set([...dates.filter(Boolean), ...generated])).sort();
    onChange(merged);
    setMode("custom");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-medium text-gray-500">Available dates</label>
        <div className="flex gap-1">
          {[
            { id: "custom", icon: <Calendar className="w-3.5 h-3.5" />, label: "Custom" },
            { id: "range", icon: <CalendarDays className="w-3.5 h-3.5" />, label: "Range" },
            { id: "repeat", icon: <RefreshCw className="w-3.5 h-3.5" />, label: "Repeat" },
          ].map(({ id, icon, label }) => (
            <button type="button" key={id} onClick={() => setMode(id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${mode === id ? "bg-[#7a73ff] text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {mode === "custom" && (
        <div className="space-y-2">
          {dates.map((d, i) => (
            <div key={i} className="flex gap-2">
              <input type="datetime-local" className={`${inputCls} flex-1`} value={d}
                onChange={(e) => {
                  const next = [...dates];
                  next[i] = e.target.value;
                  onChange(next);
                }} />
              {dates.length > 1 && (
                <button type="button" onClick={() => onChange(dates.filter((_, j) => j !== i))}
                  className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => onChange([...dates, ""])}
            className="flex items-center gap-1 text-sm text-[#7a73ff] hover:underline">
            <Plus className="w-3.5 h-3.5" /> Add date
          </button>
        </div>
      )}

      {mode === "range" && (
        <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">From</label>
              <input type="date" className={inputCls} value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">To</label>
              <input type="date" className={inputCls} value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Time</label>
            <input type="time" className={inputCls} value={rangeTime} onChange={(e) => setRangeTime(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">Weekdays only <span className="text-gray-300">(leave all off = every day)</span></label>
            <div className="flex gap-1.5 flex-wrap">
              {WEEKDAYS.map((wd, i) => (
                <button type="button" key={wd} onClick={() => toggleWeekday(i)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${rangeWeekdays.has(i) ? "bg-[#7a73ff] text-white" : "bg-white border border-gray-200 text-gray-500"}`}>
                  {wd}
                </button>
              ))}
            </div>
          </div>
          {rangePreview.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">{rangePreview.length} date{rangePreview.length !== 1 ? "s" : ""} generated</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {rangePreview.map((d) => (
                  <p key={d} className="text-xs text-gray-600">{fmtPreview(d)}</p>
                ))}
              </div>
              <button type="button" onClick={() => applyGenerated(rangePreview)}
                className="mt-2 w-full bg-[#7a73ff] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#6a63ef] transition-colors">
                Add {rangePreview.length} date{rangePreview.length !== 1 ? "s" : ""}
              </button>
            </div>
          )}
        </div>
      )}

      {mode === "repeat" && (
        <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">Start date &amp; time</label>
            <input type="datetime-local" className={inputCls} value={repeatStart} onChange={(e) => setRepeatStart(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Every (days)</label>
              <div className="flex gap-1.5">
                {["1", "2", "7", "14"].map((v) => (
                  <button type="button" key={v} onClick={() => setRepeatInterval(v)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${repeatInterval === v ? "bg-[#7a73ff] text-white" : "bg-white border border-gray-200 text-gray-500"}`}>
                    {v === "1" ? "Daily" : v === "7" ? "Weekly" : v === "14" ? "2 wks" : `${v}d`}
                  </button>
                ))}
                <input type="number" min="1" placeholder="N" className="w-14 border border-gray-200 rounded-xl px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#7a73ff]/30"
                  value={["1","2","7","14"].includes(repeatInterval) ? "" : repeatInterval}
                  onChange={(e) => setRepeatInterval(e.target.value || "1")} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Occurrences</label>
              <div className="flex gap-1.5">
                {["3", "7", "14", "30"].map((v) => (
                  <button type="button" key={v} onClick={() => setRepeatCount(v)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${repeatCount === v ? "bg-[#7a73ff] text-white" : "bg-white border border-gray-200 text-gray-500"}`}>
                    {v}
                  </button>
                ))}
                <input type="number" min="1" max="365" placeholder="N" className="w-14 border border-gray-200 rounded-xl px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#7a73ff]/30"
                  value={["3","7","14","30"].includes(repeatCount) ? "" : repeatCount}
                  onChange={(e) => setRepeatCount(e.target.value || "1")} />
              </div>
            </div>
          </div>
          {repeatPreview.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 mb-1">{repeatPreview.length} date{repeatPreview.length !== 1 ? "s" : ""} generated</p>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {repeatPreview.map((d) => (
                  <p key={d} className="text-xs text-gray-600">{fmtPreview(d)}</p>
                ))}
              </div>
              <button type="button" onClick={() => applyGenerated(repeatPreview)}
                className="mt-2 w-full bg-[#7a73ff] text-white py-2 rounded-xl text-sm font-medium hover:bg-[#6a63ef] transition-colors">
                Add {repeatPreview.length} date{repeatPreview.length !== 1 ? "s" : ""}
              </button>
            </div>
          )}
        </div>
      )}

      {dates.filter(Boolean).length > 0 && mode !== "custom" && (
        <div className="mt-3">
          <p className="text-xs text-gray-400 mb-1">{dates.filter(Boolean).length} date{dates.filter(Boolean).length !== 1 ? "s" : ""} already added</p>
          <button type="button" onClick={() => setMode("custom")}
            className="text-xs text-[#7a73ff] hover:underline">View / edit all</button>
        </div>
      )}
    </div>
  );
}
