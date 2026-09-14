// ============================================================
// CRAVEO - CUSTOMER REGISTER PAGE
// PREMIUM RESPONSIVE DESIGN
// ============================================================

import Link from "next/link";

import {
  BadgeCheck,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";

import { connectDB } from "@/lib/mongodb";

import Restaurant from "@/models/Restaurant";

import CustomerAuthForm from "@/components/customer/CustomerAuthForm";

import "../store.css";

// ============================================================
// ALWAYS FRESH
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

// ============================================================
// PAGE
// ============================================================

export default async function CustomerRegisterPage() {
  // ==========================================================
  // DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // ACTIVE CITIES
  // ==========================================================

  const branches =
    await Restaurant.find({
      isActive: true,
    })
      .select("city")
      .lean();

  // ==========================================================
  // UNIQUE CITIES
  // ==========================================================

  const cities =
    [
      ...new Set(
        branches
          .map(
            (
              branch
            ) =>
              branch.city
                ?.toString()
                .trim()
          )
          .filter(
            Boolean
          )
      ),
    ].sort(
      (
        first,
        second
      ) =>
        first.localeCompare(
          second
        )
    );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="craveo-register-page">
      <section className="craveo-register-shell">

        {/* ====================================================
            LEFT BRAND PANEL
        ==================================================== */}

        <div className="craveo-register-showcase">
          {/* ==================================================
              BRAND
          ================================================== */}

          <Link
            href="/"
            className="craveo-register-brand"
          >
            <span>
              CRAVEO
              <b>.</b>
            </span>

            <small>
              PREMIUM FOOD • DELIVERED
            </small>
          </Link>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <div className="craveo-register-showcase-content">
            <span className="craveo-register-kicker">
              <Sparkles
                size={15}
              />

              JOIN CRAVEO TODAY
            </span>

            <h1>
              Your food.
              <br />
              Your branch.
              <br />
              Your account.
            </h1>

            <p>
              Create your CRAVEO account,
              select your city and start
              ordering from your nearest
              active branch.
            </p>

            {/* ================================================
                FEATURES
            ================================================ */}

            <div className="craveo-register-features">
              <div className="craveo-register-feature">
                <span>
                  <UserRound
                    size={17}
                  />
                </span>

                <div>
                  <strong>
                    Personal Account
                  </strong>

                  <small>
                    Save your profile, addresses and orders.
                  </small>
                </div>
              </div>

              <div className="craveo-register-feature">
                <span>
                  <MapPin
                    size={17}
                  />
                </span>

                <div>
                  <strong>
                    Nearby Branch
                  </strong>

                  <small>
                    Order from a CRAVEO branch in your city.
                  </small>
                </div>
              </div>

              <div className="craveo-register-feature">
                <span>
                  <ShoppingBag
                    size={17}
                  />
                </span>

                <div>
                  <strong>
                    Easy Ordering
                  </strong>

                  <small>
                    Cart, checkout and order tracking in one place.
                  </small>
                </div>
              </div>

              <div className="craveo-register-feature">
                <span>
                  <ShieldCheck
                    size={17}
                  />
                </span>

                <div>
                  <strong>
                    Secure Profile
                  </strong>

                  <small>
                    Your customer account stays protected.
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              BOTTOM
          ================================================== */}

          <div className="craveo-register-showcase-bottom">
            <BadgeCheck
              size={16}
            />

            <span>
              Create once. Order anytime.
            </span>
          </div>
        </div>

        {/* ====================================================
            REGISTER FORM SIDE
        ==================================================== */}

        <div className="craveo-register-form-side">

          {/* ==================================================
              MOBILE BRAND
          ================================================== */}

          <Link
            href="/"
            className="craveo-register-mobile-brand"
          >
            CRAVEO
            <span>.</span>
          </Link>

          {/* ==================================================
              FORM
          ================================================== */}

          <div className="craveo-register-form-wrap">
            <CustomerAuthForm
              mode="register"
              cities={
                cities
              }
            />
          </div>

          {/* ==================================================
              SECURE NOTE
          ================================================== */}

          <p className="craveo-register-secure-note">
            <ShieldCheck
              size={13}
            />

            Secure customer registration
          </p>
        </div>
      </section>
    </main>
  );
}