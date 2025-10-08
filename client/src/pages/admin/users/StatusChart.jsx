// src/pages/admin/users/components/StatusChart.jsx
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import styles from "./UsersPage.module.css";

const STATUS_COLORS = {
  closed: "#1fa37c",
  open: "#ffc107",
  canceled: "#dc3545",
};

export default function StatusChart({ data, user, appointments }) {
  // --- Compute "since" month/year ---
  const signupDate = user?.created_at ? new Date(user.created_at) : new Date();

  // ✅ Format as "Sep 25"
  const month = signupDate
    .toLocaleString("default", { month: "short" })
    .replace(".", ""); // remove dot if locale adds it
  const year = String(signupDate.getFullYear()).slice(-2);
  const since = `${month} ${year}`;

  // --- Compute visit count ---
  const visits = appointments?.filter((a) => a.status === "closed").length || 0;

  return (
    <div className={styles.chartCard}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={80}
            label
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={STATUS_COLORS[entry.name] || "#ccc"}
              />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>

      {/* === Legend === */}
      <div className={styles.chartLegend}>
        {data.map((entry) => (
          <div key={entry.name} className={styles.legendItem}>
            <span
              className={styles.legendColor}
              style={{ backgroundColor: STATUS_COLORS[entry.name] }}
            ></span>
            <span className={styles.legendLabel}>
              {entry.name.charAt(0).toUpperCase() + entry.name.slice(1)} (
              {entry.value})
            </span>
          </div>
        ))}
      </div>

      {/* === Extra Info === */}
      <div className={styles.userInfo}>
        <p>
          👤 <strong>Since:</strong> {since}
        </p>
        <p>
          🗓️ <strong>Visited:</strong> {visits}{" "}
          {visits === 1 ? "time" : "times"}
        </p>
      </div>
    </div>
  );
}
