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

// this is just a sample data to display, i will create a table at database for this soon.
const rentalData = [
  { month: "Jan", collected: 80000, pending: 12000 },
  { month: "Feb", collected: 95000, pending: 15000 },
  { month: "Mar", collected: 120000, pending: 14000 },
  { month: "Apr", collected: 130000, pending: 18000 },
  { month: "May", collected: 115000, pending: 32000 },
  { month: "Jun", collected: 108000, pending: 30000 },
  { month: "Jul", collected: 120000, pending: 30000 },
  { month: "Aug", collected: 125000, pending: 12000 },
  { month: "Sep", collected: 150000, pending: 20000 },
  { month: "Oct", collected: 160000, pending: 18000 },
];

const formatCurrency = (value) => `₱${value.toLocaleString("en-PH")}`;

export default function RentalOverview() {
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

          <span>
            <i className="legend-dot pending-dot" />
            Pending
          </span>
        </div>
      </div>

      <div className="rental-overview-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rentalData}
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
              domain={[0, 200000]}
              ticks={[0, 50000, 100000, 150000, 200000]}
              axisLine={false}
              tickLine={false}
              tick={{
                fill: "#64748B",
                fontSize: 10,
              }}
              tickFormatter={(value) =>
                value === 0 ? "0" : `${value / 1000},000`
              }
              width={48}
            />

            <Tooltip
              cursor={{ fill: "#F3F7FC" }}
              formatter={(value, name) => [
                formatCurrency(value),
                name === "collected" ? "Collected" : "Pending",
              ]}
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

            <Bar
              dataKey="pending"
              stackId="rental"
              fill="#B7D2FF"
              radius={[3, 3, 0, 0]}
              name="Pending"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
