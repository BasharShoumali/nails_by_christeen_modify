// src/pages/admin/users/components/StatusChart.jsx
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import styles from "./UsersPage.module.css";

const STATUS_COLORS = {
  closed: "#1fa37c",
  open: "#ffc107",
  canceled: "#dc3545",
};

export default function StatusChart({ data }) {
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
    </div>
  );
}
