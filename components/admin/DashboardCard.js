// ============================================================
// CRAVEO - DASHBOARD STAT CARD
// ============================================================

import {
  ArrowUpRight,
} from "lucide-react";

// ============================================================
// DASHBOARD CARD
// ============================================================

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
}) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-card-top">
        <div className="admin-stat-icon">
          {Icon && (
            <Icon
              size={22}
              strokeWidth={1.8}
            />
          )}
        </div>

        <div className="admin-stat-trend">
          <ArrowUpRight size={14} />
        </div>
      </div>

      <div className="admin-stat-content">
        <p>{title}</p>

        <h3>{value}</h3>

        <span>{subtitle}</span>
      </div>
    </article>
  );
}