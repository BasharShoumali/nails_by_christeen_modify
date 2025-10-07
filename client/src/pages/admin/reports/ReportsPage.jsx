import { useEffect, useState } from "react";
import { subMonths, format } from "date-fns";
import styles from "./ReportsPage.module.css";

import AppointmentsChart from "./charts/AppointmentsChart";
import RevenueChart from "./charts/RevenueChart";
import NewUsersChart from "./charts/NewUsersChart";
import WeekdayChart from "./charts/WeekdayChart";

const RAW_API = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const API = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api/admin`;

export default function ReportsPage() {
  const [data, setData] = useState(null);
  const [range, setRange] = useState({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const fromStr = format(range.from, "yyyy-MM");
      const toStr = format(range.to, "yyyy-MM");
      const res = await fetch(`${API}/reports?from=${fromStr}&to=${toStr}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("❌ Reports fetch failed:", err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [range]);

  if (loading) return <p className={styles.loading}>Loading reports...</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!data) return null;

  return (
    <main className={styles.page}>
  <h1 className={styles.title}>📊 Manager Reports</h1>

  <div className={styles.rangeControls}>
    <label>
      From:
      <input
        type="month"
        value={format(range.from, "yyyy-MM")}
        onChange={(e) =>
          setRange((r) => ({
            ...r,
            from: new Date(`${e.target.value}-01`),
          }))
        }
      />
    </label>
    <label>
      To:
      <input
        type="month"
        value={format(range.to, "yyyy-MM")}
        onChange={(e) =>
          setRange((r) => ({ ...r, to: new Date(`${e.target.value}-01`) }))
        }
      />
    </label>
  </div>

  <div className={styles.chartGrid}>
    <AppointmentsChart data={data.monthly_appointments} />
    <RevenueChart data={data.monthly_revenue} />
    <NewUsersChart data={data.monthly_users} />
    {data.weekday_distribution && (
      <WeekdayChart data={data.weekday_distribution} />
    )}
  </div>
</main>

  );
}
