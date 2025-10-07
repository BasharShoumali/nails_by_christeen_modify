// src/pages/reports/components/RevenueChart.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function RevenueChart({ data }) {
  return (
    <div className="chartCard">
      <h3>💰 Total Revenue per Month</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
          <defs>
            <linearGradient id="revBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1fa37c" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#1fa37c" stopOpacity={0.3} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.08)" />
          <XAxis dataKey="month" tick={{ fill: "var(--brand-text)" }} />
          <YAxis tick={{ fill: "var(--brand-text)" }} />
          <Tooltip
            formatter={(value) => `₪${value}`}
            labelStyle={{ fontWeight: "bold", color: "var(--brand-text)" }}
            contentStyle={{
              background: "var(--card-bg)",
              borderRadius: "var(--radius)",
              boxShadow: "0 2px 10px var(--shadow)",
              border: "none",
            }}
          />

          <Bar
            dataKey="total_amount"
            fill="url(#revBarGradient)"
            radius={[8, 8, 0, 0]}
            barSize={40}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
