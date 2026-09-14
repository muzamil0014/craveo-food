// ============================================================
// CRAVEO - CUSTOMER HERO
// ============================================================

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  Clock3,
  MapPin,
  Star,
} from "lucide-react";

// ============================================================
// COMPONENT
// ============================================================

export default function CustomerHero() {
  return (
    <section className="craveo-home-hero">
      {/* ======================================================
          LEFT CONTENT
      ====================================================== */}

      <div className="craveo-home-hero-content">
        <span className="craveo-home-eyebrow">
          PREMIUM FOOD DELIVERY
        </span>

        <h1>
          Food That Makes
          <br />
          You Crave
          <span> More.</span>
        </h1>

        <p>
          Delicious meals prepared with care and delivered
          straight to your door.
        </p>

        {/* ====================================================
            HERO ACTIONS
        ==================================================== */}

        <div className="craveo-home-hero-actions">
          <Link
            href="/foods"
            className="craveo-home-primary-btn"
          >
            Order Now
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/foods"
            className="craveo-home-secondary-btn"
          >
            Explore Menu
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* ====================================================
            HERO BENEFITS
        ==================================================== */}

        <div className="craveo-home-hero-benefits">
          <div>
            <Clock3 size={17} />

            <span>
              <strong>Fast Delivery</strong>
              <small>Quick & fresh</small>
            </span>
          </div>

          <div>
            <Star size={17} />

            <span>
              <strong>Fresh Food</strong>
              <small>Always premium</small>
            </span>
          </div>

          <div>
            <MapPin size={17} />

            <span>
              <strong>Multiple Branches</strong>
              <small>Near you</small>
            </span>
          </div>
        </div>
      </div>

      {/* ======================================================
          RIGHT VISUAL
      ====================================================== */}

      <div className="craveo-home-hero-visual">
        {/* ====================================================
            ORANGE BACKGROUND SHAPE
        ==================================================== */}

        <div className="craveo-home-hero-orange-shape" />

        {/* ====================================================
            FLOATING DECORATION
        ==================================================== */}

        <span className="craveo-home-floating-leaf leaf-one">
          ✦
        </span>

        <span className="craveo-home-floating-leaf leaf-two">
          ✦
        </span>

        {/* ====================================================
            HERO IMAGE
            FILE PATH: public/images/dd.png

            sizes:
            - Mobile: image can use most of viewport width
            - Tablet: around half viewport
            - Desktop: maximum hero image frame size
        ==================================================== */}

        <div className="craveo-home-hero-food-frame">
          <Image
            src="/images/dd.png"
            alt="CRAVEO Food"
            fill
            priority
            sizes="(max-width: 650px) 92vw, (max-width: 1024px) 50vw, 520px"
            className="craveo-home-hero-food-image"
          />
        </div>

        {/* ====================================================
            FLOATING LABEL
        ==================================================== */}

        <div className="craveo-home-hero-food-label">
          <span>TASTE</span>
          <strong>HAPPINESS</strong>
        </div>

        {/* ====================================================
            PRICE CARD
        ==================================================== */}

        <div className="craveo-home-hero-price-card">
          <span>FROM</span>
          <strong>PKR 499</strong>
        </div>
      </div>
    </section>
  );
}