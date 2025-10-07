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

export default function AppointmentsChart({ data }) {
  return (
    <section className={styles.chartSection}>
      <h2>Appointments per Month</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="closed" stackId="a" fill="#1fa37c" name="Closed" />
          <Bar dataKey="open" stackId="a" fill="#ffc107" name="Open" />
          <Bar dataKey="canceled" stackId="a" fill="#dc3545" name="Canceled" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
