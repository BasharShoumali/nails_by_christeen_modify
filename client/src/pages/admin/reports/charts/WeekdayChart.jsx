import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import styles from "../ReportsPage.module.css";

const COLORS = [
  "#1fa37c",
  "#007bff",
  "#ffc107",
  "#dc3545",
  "#6f42c1",
  "#17a2b8",
  "#fd7e14",
];

export default function WeekdayChart({ data }) {
  return (
    <section className={styles.chartSection}>
      <h2>Appointments by Weekday</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="weekday"
            outerRadius={100}
            label
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </section>
  );
}
