// ============================================================
// CRAVEO - COUPONS MANAGEMENT PAGE
// ============================================================

import Link from "next/link";

import {
  CircleCheck,
  CircleX,
  Plus,
  TicketPercent,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";

import Coupon from "@/models/Coupon";
import Restaurant from "@/models/Restaurant";

import CouponActions from "@/components/admin/CouponActions";

// ============================================================
// DATE
// ============================================================

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat(
    "en-PK",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(value)
  );
}

// ============================================================
// COUPON STATE
// ============================================================

function getCouponState(
  coupon
) {
  const now = new Date();

  if (!coupon.isActive) {
    return "inactive";
  }

  if (
    new Date(
      coupon.startDate
    ) > now
  ) {
    return "scheduled";
  }

  if (
    new Date(
      coupon.expiryDate
    ) < now
  ) {
    return "expired";
  }

  if (
    coupon.usageLimit > 0 &&
    coupon.usedCount >=
      coupon.usageLimit
  ) {
    return "limit-reached";
  }

  return "active";
}

// ============================================================
// PAGE
// ============================================================

export default async function CouponsPage() {
  await connectDB();

  void Restaurant;

  const coupons =
    await Coupon.find()
      .populate(
        "restaurantIds",
        "name city area"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

  const activeCoupons =
    coupons.filter(
      (coupon) =>
        getCouponState(
          coupon
        ) === "active"
    ).length;

  const expiredCoupons =
    coupons.filter(
      (coupon) =>
        getCouponState(
          coupon
        ) === "expired"
    ).length;

  const inactiveCoupons =
    coupons.filter(
      (coupon) =>
        !coupon.isActive
    ).length;

  return (
    <main className="coupons-page">
      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="coupons-header">
        <div>
          <span className="coupon-eyebrow">
            COUPON MANAGEMENT
          </span>

          <h1>
            CRAVEO Coupons
          </h1>

          <p>
            Manage promotional codes,
            discounts and usage rules.
          </p>
        </div>

        <Link
          href="/admin/dashboard/coupons/add"
          className="coupon-add-btn"
        >
          <Plus size={18} />
          Add Coupon
        </Link>
      </div>

      {/* ====================================================
          SUMMARY
      ==================================================== */}

      <section className="coupon-summary-grid">
        <div className="coupon-summary-card">
          <div className="coupon-summary-icon">
            <TicketPercent
              size={20}
            />
          </div>

          <div>
            <span>
              Total Coupons
            </span>

            <strong>
              {coupons.length}
            </strong>
          </div>
        </div>

        <div className="coupon-summary-card">
          <div className="coupon-summary-icon success">
            <CircleCheck
              size={20}
            />
          </div>

          <div>
            <span>
              Active
            </span>

            <strong>
              {activeCoupons}
            </strong>
          </div>
        </div>

        <div className="coupon-summary-card">
          <div className="coupon-summary-icon danger">
            <CircleX
              size={20}
            />
          </div>

          <div>
            <span>
              Expired
            </span>

            <strong>
              {expiredCoupons}
            </strong>
          </div>
        </div>

        <div className="coupon-summary-card">
          <div className="coupon-summary-icon danger">
            <CircleX
              size={20}
            />
          </div>

          <div>
            <span>
              Inactive
            </span>

            <strong>
              {inactiveCoupons}
            </strong>
          </div>
        </div>
      </section>

      {/* ====================================================
          COUPONS
      ==================================================== */}

      {coupons.length > 0 ? (
        <section className="coupon-grid">
          {coupons.map(
            (coupon) => {
              const state =
                getCouponState(
                  coupon
                );

              return (
                <article
                  className="coupon-card"
                  key={
                    coupon._id.toString()
                  }
                >
                  <div className="coupon-card-top">
                    <div className="coupon-code-box">
                      <TicketPercent
                        size={18}
                      />

                      <strong>
                        {coupon.code}
                      </strong>
                    </div>

                    <span
                      className={`coupon-state-badge ${state}`}
                    >
                      {state.replaceAll(
                        "-",
                        " "
                      )}
                    </span>
                  </div>

                  <h2>
                    {coupon.title}
                  </h2>

                  <p>
                    {coupon.description ||
                      "No description added."}
                  </p>

                  <div className="coupon-discount-value">
                    {coupon.discountType ===
                    "percentage"
                      ? `${coupon.discountValue}% OFF`
                      : `PKR ${Number(
                          coupon.discountValue
                        ).toLocaleString()} OFF`}
                  </div>

                  <div className="coupon-details-grid">
                    <div>
                      <span>
                        Min. Order
                      </span>

                      <strong>
                        PKR{" "}
                        {Number(
                          coupon.minimumOrder ||
                            0
                        ).toLocaleString()}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Usage
                      </span>

                      <strong>
                        {
                          coupon.usedCount
                        }
                        /
                        {coupon.usageLimit >
                        0
                          ? coupon.usageLimit
                          : "∞"}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Start
                      </span>

                      <strong>
                        {formatDate(
                          coupon.startDate
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Expiry
                      </span>

                      <strong>
                        {formatDate(
                          coupon.expiryDate
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="coupon-branches">
                    {coupon.restaurantIds
                      ?.length > 0 ? (
                      <>
                        {coupon.restaurantIds
                          .slice(
                            0,
                            3
                          )
                          .map(
                            (
                              branch
                            ) => (
                              <span
                                key={
                                  branch._id.toString()
                                }
                              >
                                {
                                  branch.name
                                }
                              </span>
                            )
                          )}

                        {coupon
                          .restaurantIds
                          .length >
                          3 && (
                          <span>
                            +
                            {coupon
                              .restaurantIds
                              .length -
                              3}
                          </span>
                        )}
                      </>
                    ) : (
                      <span>
                        All Branches
                      </span>
                    )}
                  </div>

                  <CouponActions
                    couponId={
                      coupon._id.toString()
                    }
                    couponCode={
                      coupon.code
                    }
                    isActive={
                      coupon.isActive
                    }
                  />
                </article>
              );
            }
          )}
        </section>
      ) : (
        <section className="coupons-empty">
          <TicketPercent
            size={38}
          />

          <h2>
            No coupons yet
          </h2>

          <p>
            Create your first CRAVEO
            promotional coupon.
          </p>

          <Link
            href="/admin/dashboard/coupons/add"
            className="coupon-add-btn"
          >
            <Plus size={18} />
            Add First Coupon
          </Link>
        </section>
      )}
    </main>
  );
}