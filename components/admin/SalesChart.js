"use client";

// ============================================================
// CRAVEO - SALES CHART
// ============================================================

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// ============================================================
// CUSTOM TOOLTIP
// ============================================================

function SalesTooltip({
  active,
  payload,
  label,
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="admin-chart-tooltip">
      <strong>{label}</strong>

      <span>
        Rs.{" "}
        {Number(
          payload[0]?.value || 0
        ).toLocaleString()}
      </span>
    </div>
  );
}

// ============================================================
// SALES CHART
// ============================================================

export default function SalesChart({
  data = [],
}) {
  return (
    <div className="admin-sales-chart">
      <ResponsiveContainer
        width="100%"
        height={310}
      >
        <AreaChart
          data={data}
          margin={{
            top: 15,
            right: 5,
            left: -15,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient
              id="craveoRevenue"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="5%"
                stopColor="#e87517"
                stopOpacity={0.3}
              />

              <stop
                offset="95%"
                stopColor="#e87517"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
            stroke="#eee6df"
          />

          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#8f8378",
              fontSize: 12,
            }}
          />

          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{
              fill: "#8f8378",
              fontSize: 11,
            }}
            tickFormatter={(value) =>
              value >= 1000
                ? `${Math.round(value / 1000)}k`
                : value
            }
          />

          <Tooltip
            content={<SalesTooltip />}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#e87517"
            strokeWidth={3}
            fill="url(#craveoRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}