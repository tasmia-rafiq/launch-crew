"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList,
} from "recharts";

export default function AnalyticsChart({ chartData }: { chartData: any }) {
  return (
    <div className="bg-gray-50 p-6 rounded-xl shadow-lg border border-primary-100">
      <h2 className="text-2xl font-semibold mb-6">Ratings Overview</h2>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.5} />
            </linearGradient>
          </defs>

          {/* Subtle background grid */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* X-axis */}
          <XAxis
            dataKey="metric"
            tick={{ fontSize: 13, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />

          {/* Y-axis */}
          <YAxis
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          {/* Tooltip */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
            }}
            cursor={{ fill: "rgba(59,130,246,0.05)" }}
          />

          <Legend
            verticalAlign="top"
            wrapperStyle={{ fontSize: "13px", fontWeight: 500 }}
          />

          {/* Main Bar */}
          <Bar
            dataKey="score"
            fill="url(#colorRating)"
            radius={[8, 8, 0, 0]}
            barSize={45}
            animationDuration={900}
          >
            {/* Value labels above bars */}
            <LabelList
              dataKey="score"
              position="top"
              formatter={(val: any) => val.toFixed(1)}
              style={{ fill: "#374151", fontSize: 13, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
