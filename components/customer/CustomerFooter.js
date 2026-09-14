// ============================================================
// CRAVEO - CUSTOMER FOOTER
// ============================================================

import Link from "next/link";

import {
  Globe2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function CustomerFooter() {
  return (
    <footer className="store-footer">
      <div className="store-footer-grid">
        {/* ====================================================
            BRAND
        ==================================================== */}

        <div className="store-footer-brand">
          <Link
            href="/"
            className="store-footer-logo"
          >
            CRAVEO
            <span>.</span>
          </Link>

          <p>
            Premium food delivery from
            your favorite CRAVEO branches.
          </p>

          {/* ==================================================
              SOCIAL LINKS
          ================================================== */}

          <div className="store-socials">
            <a
              href="#"
              aria-label="Website"
            >
              <Globe2 size={17} />
            </a>

            <a
              href="#"
              aria-label="Contact"
            >
              <Send size={17} />
            </a>
          </div>
        </div>

        {/* ====================================================
            EXPLORE LINKS
        ==================================================== */}

        <div>
          <h3>
            Explore
          </h3>

          <Link href="/foods">
            Menu
          </Link>

          <Link href="/restaurants">
            Restaurants
          </Link>

          <Link href="/categories">
            Categories
          </Link>
        </div>

        {/* ====================================================
            CUSTOMER LINKS
        ==================================================== */}

        <div>
          <h3>
            Customer
          </h3>

          <Link href="/login">
            Login
          </Link>

          <Link href="/register">
            Register
          </Link>

          <Link href="/account/orders">
            My Orders
          </Link>
        </div>

        {/* ====================================================
            CONTACT
        ==================================================== */}

        <div>
          <h3>
            Contact
          </h3>

          <p>
            <MapPin size={15} />
            Pakistan
          </p>

          <p>
            <Phone size={15} />
            Customer Support
          </p>

          <p>
            <Mail size={15} />
            support@craveo.com
          </p>
        </div>
      </div>

      {/* ======================================================
          FOOTER BOTTOM
      ====================================================== */}

      <div className="store-footer-bottom">
        <span>
          © 2026 CRAVEO. All rights reserved.
        </span>

        <span className="store-footer-developer">
          Designed &amp; Developed by
          <strong>
            {" "}Muzamil Kakepoto
          </strong>
        </span>
      </div>
    </footer>
  );
}