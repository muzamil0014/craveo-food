// ============================================================
// CRAVEO - CUSTOMER LOGIN PAGE
// PREMIUM SPLIT SCREEN DESIGN
// ============================================================

import Link from "next/link";

import {
  BadgeCheck,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

import CustomerAuthForm from "@/components/customer/CustomerAuthForm";

import "../store.css";

// ============================================================
// PAGE
// ============================================================

export default function CustomerLoginPage() {
  return (
    <main className="craveo-login-page">
      <section className="craveo-login-shell">

        {/* ====================================================
            LEFT BRAND PANEL
        ==================================================== */}

        <div className="craveo-login-showcase">
          {/* ==================================================
              BRAND
          ================================================== */}

          <Link
            href="/"
            className="craveo-login-brand"
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

          <div className="craveo-login-showcase-content">
            <span className="craveo-login-kicker">
              <Sparkles size={15} />

              PREMIUM FOOD EXPERIENCE
            </span>

            <h1>
              Good food.
              <br />
              Better moments.
            </h1>

            <p>
              Login to your CRAVEO account,
              choose your favourite branch,
              and continue ordering fresh food.
            </p>

            {/* ================================================
                FEATURES
            ================================================ */}

            <div className="craveo-login-features">
              <div className="craveo-login-feature">
                <span>
                  <MapPin size={17} />
                </span>

                <div>
                  <strong>
                    Local Branches
                  </strong>

                  <small>
                    Order from your selected CRAVEO branch.
                  </small>
                </div>
              </div>

              <div className="craveo-login-feature">
                <span>
                  <ShoppingBag size={17} />
                </span>

                <div>
                  <strong>
                    Easy Ordering
                  </strong>

                  <small>
                    Simple cart, checkout and order tracking.
                  </small>
                </div>
              </div>

              <div className="craveo-login-feature">
                <span>
                  <ShieldCheck size={17} />
                </span>

                <div>
                  <strong>
                    Secure Account
                  </strong>

                  <small>
                    Your account and orders stay protected.
                  </small>
                </div>
              </div>
            </div>
          </div>

          {/* ==================================================
              BOTTOM
          ================================================== */}

          <div className="craveo-login-showcase-bottom">
            <BadgeCheck size={16} />

            <span>
              Fresh food. Trusted branches. Easy delivery.
            </span>
          </div>
        </div>

        {/* ====================================================
            RIGHT LOGIN PANEL
        ==================================================== */}

        <div className="craveo-login-form-side">
          {/* ==================================================
              MOBILE BRAND
          ================================================== */}

          <Link
            href="/"
            className="craveo-login-mobile-brand"
          >
            CRAVEO
            <span>.</span>
          </Link>

          {/* ==================================================
              FORM WRAPPER

              CustomerAuthForm already contains:
              heading
              email
              password
              login button
              create account link
          ================================================== */}

          <div className="craveo-login-form-wrap">
            <CustomerAuthForm
              mode="login"
            />
          </div>

          {/* ==================================================
              SMALL FOOTER
          ================================================== */}

          <p className="craveo-login-secure-note">
            <ShieldCheck size={13} />

            Secure customer login
          </p>
        </div>
      </section>
    </main>
  );
}