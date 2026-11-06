import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import "./RentalOverview.css";

const formatCurrency = (value) => `₱${Number(value).toLocaleString("en-PH")}`;

export default function RentalOverview({ data = [] }) {
  return (
    <section className="rental-overview-card">
      <div className="rental-overview-header">
        <div className="rental-overview-heading">
          <h2>Rental Overview</h2>
          <p>Monthly rental collection (₱)</p>
        </div>

        <div className="rental-overview-legend">
          <span>
            <i className="legend-dot collected-dot" />
            Collected
          </span>
        </div>
      </div>

      <div className="rental-overview-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 12,
              right: 8,
              left: 8,
              bottom: 0,
            }}
            barCategoryGap="32%"
          >
            <CartesianGrid
              vertical={false}
              stroke="#E9EFF7"
              strokeDasharray="0"
            />

            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#64748B",
                fontSize: 11,
              }}
              dy={8}
            />

            <YAxis
              domain={[0, "auto"]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#64748B",
                fontSize: 10,
              }}
              tickFormatter={(value) =>
                value === 0 ? "0" : `${Math.round(value / 1000)}k`
              }
              width={48}
            />

            <Tooltip
              cursor={{ fill: "#F3F7FC" }}
              formatter={(value) => [formatCurrency(value), "Collected"]}
              labelFormatter={(label) => `${label}`}
              contentStyle={{
                border: "1px solid #E5EAF2",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.08)",
              }}
            />

            <Legend content={() => null} />

            <Bar
              dataKey="collected"
              stackId="rental"
              fill="#3478E5"
              radius={[0, 0, 0, 0]}
              name="Collected"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
