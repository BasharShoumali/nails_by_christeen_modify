import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import styles from "../ReportsPage.module.css";

export default function NewUsersChart({ data }) {
  return (
    <section className={styles.chartSection}>
      <h2>New Users per Month</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="new_users" fill="#007bff" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
