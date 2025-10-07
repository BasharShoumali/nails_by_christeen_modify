import { useEffect, useState } from "react";
import DayTemplateManager from "./DayTemplateManager";
import WeekPlannerPanel from "./WeekPlannerPanel";
import OverridePanel from "./OverridePanel";
import styles from "./SchedulePage.module.css";
import WeekAssignmentsViewer from "./WeekAssignmentsViewer";

// Normalize API base URL
const RAW_API = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const API = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api/admin`;

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [error, setError] = useState(null);

  async function safeFetch(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    } catch (err) {
      console.error(`❌ Fetch failed for ${url}:`, err);
      setError(`Failed to load: ${url}`);
      return [];
    }
  }

  async function loadAll() {
    const [sRes, wRes, oRes] = await Promise.all([
      safeFetch(`${API}/schedules`),
      safeFetch(`${API}/week-assignments`),
      safeFetch(`${API}/overrides`),
    ]);
    setSchedules(sRes);
    setAssignments(wRes);
    setOverrides(oRes);
  }

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>📅 Schedule Management</h1>
      <p className={styles.subtitle}>
        Configure your recurring week and manage special cases. Reuse{" "}
        <strong>day templates</strong> (like “Regular Day”, “Holiday”) and{" "}
        <strong>weekly plans</strong> to simplify scheduling.
      </p>

      {error && (
        <div
          style={{
            color: "var(--brand-accent)",
            textAlign: "center",
            marginBottom: "1rem",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      <DayTemplateManager schedules={schedules} onChanged={loadAll} />

      <WeekPlannerPanel
        schedules={schedules}
        assignments={assignments}
        onChanged={loadAll}
      />

      <WeekAssignmentsViewer />

      <OverridePanel
        schedules={schedules}
        overrides={overrides}
        onChanged={loadAll}
      />
    </main>
  );
}
