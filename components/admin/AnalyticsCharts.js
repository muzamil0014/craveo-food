"use client";

// ============================================================
// CRAVEO - ANALYTICS CHARTS
// ============================================================

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ============================================================
// TOOLTIP FORMATTER
// ============================================================

function formatCurrency(
  value
) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// COMPONENT
// ============================================================

export default function AnalyticsCharts({
  dailySales = [],
  monthlySales = [],
  orderStatusData = [],
  customerGrowth = [],
}) {
  return (
    <>
      {/* ======================================================
          DAILY SALES
      ====================================================== */}

      <section className="analytics-chart-card">
        <div className="analytics-card-heading">
          <div>
            <span>
              LAST 7 DAYS
            </span>

            <h2>
              Daily Revenue
            </h2>
          </div>
        </div>

        <div className="analytics-chart-area">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={
                dailySales
              }
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="label"
              />

              <YAxis />

              <Tooltip
                formatter={(
                  value,
                  name
                ) => [
                  name ===
                  "revenue"
                    ? formatCurrency(
                        value
                      )
                    : value,

                  name ===
                  "revenue"
                    ? "Revenue"
                    : "Orders",
                ]}
              />

              <Line
                type="monotone"
                dataKey="revenue"
                stroke="currentColor"
                strokeWidth={3}
                dot={{
                  r: 4,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ======================================================
          MONTHLY SALES
      ====================================================== */}

      <section className="analytics-chart-card">
        <div className="analytics-card-heading">
          <div>
            <span>
              CURRENT YEAR
            </span>

            <h2>
              Monthly Sales
            </h2>
          </div>
        </div>

        <div className="analytics-chart-area">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={
                monthlySales
              }
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="label"
              />

              <YAxis />

              <Tooltip
                formatter={(
                  value,
                  name
                ) => [
                  name ===
                  "revenue"
                    ? formatCurrency(
                        value
                      )
                    : value,

                  name ===
                  "revenue"
                    ? "Revenue"
                    : "Orders",
                ]}
              />

              <Bar
                dataKey="revenue"
                fill="currentColor"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ======================================================
          ORDER STATUS
      ====================================================== */}

      <section className="analytics-chart-card">
        <div className="analytics-card-heading">
          <div>
            <span>
              ORDERS
            </span>

            <h2>
              Order Status
            </h2>
          </div>
        </div>

        <div className="analytics-chart-area analytics-pie-area">
          {orderStatusData.length >
          0 ? (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={
                    orderStatusData
                  }
                  dataKey="value"
                  nameKey="name"
                  innerRadius={65}
                  outerRadius={100}
                  paddingAngle={3}
                >
                  {orderStatusData.map(
                    (
                      entry,
                      index
                    ) => (
                      <Cell
                        key={`${entry.name}-${index}`}
                        fill="currentColor"
                        opacity={
                          1 -
                          index * 0.08
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="analytics-chart-empty">
              No order data yet.
            </div>
          )}
        </div>

        <div className="analytics-status-list">
          {orderStatusData.map(
            (item) => (
              <div
                key={
                  item.name
                }
              >
                <span>
                  {item.name}
                </span>

                <strong>
                  {item.value}
                </strong>
              </div>
            )
          )}
        </div>
      </section>

      {/* ======================================================
          CUSTOMER GROWTH
      ====================================================== */}

      <section className="analytics-chart-card">
        <div className="analytics-card-heading">
          <div>
            <span>
              CUSTOMERS
            </span>

            <h2>
              Customer Growth
            </h2>
          </div>
        </div>

        <div className="analytics-chart-area">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={
                customerGrowth
              }
            >
              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
              />

              <XAxis
                dataKey="label"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="customers"
                fill="currentColor"
                radius={[
                  6,
                  6,
                  0,
                  0,
                ]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}