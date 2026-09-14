"use client";

// ============================================================
// CRAVEO - BRANCH ANALYTICS CHARTS
// ============================================================

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ============================================================
// FORMAT TOOLTIP VALUE
// ============================================================

function formatValue(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// COMPONENT
// ============================================================

export default function BranchAnalyticsCharts({
  dailyData = [],
  weeklyData = [],
  monthlyData = [],
}) {
  return (
    <div className="branch-analytics-charts">
      {/* ======================================================
          DAILY CHART
      ====================================================== */}

      <section className="branch-chart-card">
        <div className="branch-chart-heading">
          <span>
            DAILY SALES
          </span>

          <h3>
            Last 7 Days Revenue
          </h3>
        </div>

        <div className="branch-chart-box">
          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <BarChart
              data={dailyData}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                fontSize={10}
              />

              <YAxis
                fontSize={10}
              />

              <Tooltip
                formatter={(
                  value
                ) => [
                  formatValue(
                    value
                  ),
                  "Revenue",
                ]}
              />

              <Bar
                dataKey="revenue"
                radius={[
                  7,
                  7,
                  0,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ======================================================
          WEEKLY CHART
      ====================================================== */}

      <section className="branch-chart-card">
        <div className="branch-chart-heading">
          <span>
            WEEKLY SALES
          </span>

          <h3>
            Last 4 Weeks
          </h3>
        </div>

        <div className="branch-chart-box">
          <ResponsiveContainer
            width="100%"
            height={280}
          >
            <LineChart
              data={weeklyData}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                fontSize={10}
              />

              <YAxis
                fontSize={10}
              />

              <Tooltip
                formatter={(
                  value
                ) => [
                  formatValue(
                    value
                  ),
                  "Revenue",
                ]}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ======================================================
          MONTHLY CHART
      ====================================================== */}

      <section className="branch-chart-card branch-chart-card-full">
        <div className="branch-chart-heading">
          <span>
            MONTHLY SALES
          </span>

          <h3>
            Current Year Revenue
          </h3>
        </div>

        <div className="branch-chart-box">
          <ResponsiveContainer
            width="100%"
            height={300}
          >
            <BarChart
              data={monthlyData}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis
                dataKey="label"
                fontSize={10}
              />

              <YAxis
                fontSize={10}
              />

              <Tooltip
                formatter={(
                  value
                ) => [
                  formatValue(
                    value
                  ),
                  "Revenue",
                ]}
              />

              <Bar
                dataKey="revenue"
                radius={[
                  7,
                  7,
                  0,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}