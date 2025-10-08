// src/pages/admin/reports/charts/RevenueChart.jsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export default function RevenueChart({ data = [], currentFinance }) {
  // 🧩 Normalize currentFinance (can be object, array, string, null)
  let normalized = {};

  if (Array.isArray(currentFinance)) {
    normalized = currentFinance[0] || {};
  } else if (typeof currentFinance === "object" && currentFinance !== null) {
    normalized = currentFinance;
  } else {
    normalized = {};
  }

  // 🧮 Convert to numeric safely
  const income = parseFloat(normalized.income) || 0;
  const outcome = parseFloat(normalized.outcome) || 0;

  // 🗓️ Month title
  const monthName = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="chartCard">
      <h3>💰 Monthly Income & Outcome</h3>

      {/* === Current Month Summary === */}
      <div style={{ marginBottom: "1rem", textAlign: "center" }}>
        <strong>{monthName}</strong>
        <p style={{ margin: "0.5rem 0" }}>
          🟢 Income:{" "}
          <strong style={{ color: "#1fa37c" }}>₪{income.toFixed(2)}</strong>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          🔴 Outcome:{" "}
          <strong style={{ color: "#dc3545" }}>₪{outcome.toFixed(2)}</strong>
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, bottom: 10, left: 0 }}
        >
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
          <Legend />

          {/* === Income Bar === */}
          <Bar
            dataKey="income"
            name="Income"
            fill="url(#incomeGradient)"
            radius={[8, 8, 0, 0]}
            barSize={30}
          />
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1fa37c" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#1fa37c" stopOpacity={0.3} />
            </linearGradient>
          </defs>

          {/* === Outcome Bar === */}
          <Bar
            dataKey="outcome"
            name="Outcome"
            fill="url(#outcomeGradient)"
            radius={[8, 8, 0, 0]}
            barSize={30}
          />
          <defs>
            <linearGradient id="outcomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#dc3545" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#dc3545" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
