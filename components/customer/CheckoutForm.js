"use client";

// ============================================================
// CRAVEO - CUSTOMER CHECKOUT FORM
// CITY LOCKED TO CUSTOMER ACCOUNT / SELECTED BRANCH
// PAYMENT METHOD: cod
// ============================================================

import {
  CheckCircle2,
  CreditCard,
  LoaderCircle,
  LockKeyhole,
  MapPin,
  Tag,
  Truck,
  WalletCards,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";

// ============================================================
// PRICE
// ============================================================

function formatPrice(value) {
  return `PKR ${Number(
    value || 0
  ).toLocaleString()}`;
}

// ============================================================
// SAFE RESPONSE
// ============================================================

async function readResponse(response) {
  const text =
    await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      `Server returned invalid response (${response.status}).`
    );
  }
}

// ============================================================
// COMPONENT
// ============================================================

export default function CheckoutForm({
  customer,
  branch,
  cart,
  settings,
}) {
  // ==========================================================
  // FIXED CUSTOMER CITY
  //
  // Priority:
  // 1. Customer account city
  // 2. Selected branch city
  //
  // Customer cannot manually change this during checkout.
  // ==========================================================

  const fixedCity =
    customer?.city?.toString().trim() ||
    branch?.city?.toString().trim() ||
    "";

  // ==========================================================
  // COUPON
  // ==========================================================

  const [
    couponCode,
    setCouponCode,
  ] = useState("");

  const [
    couponDiscount,
    setCouponDiscount,
  ] = useState(0);

  const [
    couponMessage,
    setCouponMessage,
  ] = useState("");

  const [
    couponError,
    setCouponError,
  ] = useState("");

  const [
    applyingCoupon,
    setApplyingCoupon,
  ] = useState(false);

  // ==========================================================
  // CHECKOUT
  // ==========================================================

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  // ==========================================================
  // PAYMENT METHOD
  // ==========================================================

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState(
    settings.cashOnDeliveryEnabled
      ? "cod"
      : settings.cardPaymentEnabled
        ? "card"
        : settings.bankTransferEnabled
          ? "bank-transfer"
          : settings.walletPaymentEnabled
            ? "wallet"
            : ""
  );

  // ==========================================================
  // DELIVERY FEE
  // ==========================================================

  const deliveryFee =
    useMemo(() => {
      if (
        settings.deliveryEnabled ===
        false
      ) {
        return 0;
      }

      if (
        settings.freeDeliveryMinimum >
          0 &&
        cart.subtotal >=
          settings.freeDeliveryMinimum
      ) {
        return 0;
      }

      return Number(
        settings.defaultDeliveryFee ||
          0
      );
    }, [
      settings,
      cart.subtotal,
    ]);

  // ==========================================================
  // TOTAL
  // ==========================================================

  const total =
    Math.max(
      0,
      cart.subtotal +
        deliveryFee -
        couponDiscount
    );

  // ==========================================================
  // APPLY COUPON
  // ==========================================================

  async function applyCoupon() {
    try {
      setApplyingCoupon(true);

      setCouponError("");
      setCouponMessage("");

      const cleanCode =
        couponCode
          .trim()
          .toUpperCase();

      if (!cleanCode) {
        setCouponDiscount(0);
        return;
      }

      const response =
        await fetch(
          "/api/customer/coupon",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                code:
                  cleanCode,
              }),
          }
        );

      const result =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.message ||
            "Invalid coupon."
        );
      }

      if (!result.coupon) {
        setCouponDiscount(0);
        return;
      }

      setCouponCode(
        result.coupon.code
      );

      setCouponDiscount(
        Number(
          result.coupon.discount ||
            0
        )
      );

      setCouponMessage(
        `${result.coupon.code} applied successfully.`
      );
    } catch (error) {
      setCouponDiscount(0);

      setCouponMessage("");

      setCouponError(
        error.message ||
          "Unable to apply coupon."
      );
    } finally {
      setApplyingCoupon(false);
    }
  }

  // ==========================================================
  // REMOVE COUPON
  // ==========================================================

  function removeCoupon() {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponMessage("");
    setCouponError("");
  }

  // ==========================================================
  // PLACE ORDER
  // ==========================================================

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // ========================================================
      // CITY VALIDATION
      // ========================================================

      if (!fixedCity) {
        throw new Error(
          "Your account city is missing. Please update your profile first."
        );
      }

      const formData =
        new FormData(
          event.currentTarget
        );

      // ========================================================
      // PAYLOAD
      //
      // IMPORTANT:
      // City FormData se nahi li ja rahi.
      // City customer account / branch se fixed hai.
      // ========================================================

      const payload = {
        fullName:
          formData
            .get("fullName")
            ?.toString()
            .trim(),

        phone:
          formData
            .get("phone")
            ?.toString()
            .trim(),

        address:
          formData
            .get("address")
            ?.toString()
            .trim(),

        area:
          formData
            .get("area")
            ?.toString()
            .trim(),

        city:
          fixedCity,

        notes:
          formData
            .get("notes")
            ?.toString()
            .trim() || "",

        paymentMethod,

        // ======================================================
        // COUPON OPTIONAL
        // ======================================================

        couponCode:
          couponDiscount > 0
            ? couponCode
            : "",
      };

      // ========================================================
      // PAYMENT VALIDATION
      // ========================================================

      if (!paymentMethod) {
        throw new Error(
          "Select a payment method."
        );
      }

      // ========================================================
      // REQUEST
      // ========================================================

      const response =
        await fetch(
          "/api/customer/checkout",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            cache:
              "no-store",

            body:
              JSON.stringify(
                payload
              ),
          }
        );

      const result =
        await readResponse(
          response
        );

      if (
        !response.ok ||
        result.success !==
          true
      ) {
        throw new Error(
          result.message ||
            "Unable to place order."
        );
      }

      // ========================================================
      // ORDER SUCCESS
      // ========================================================

      window.location.replace(
        `/order-success/${result.order.orderNumber}`
      );
    } catch (error) {
      setError(
        error.message ||
          "Unable to place order."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <form
      className="customer-checkout-layout"
      onSubmit={
        handleSubmit
      }
    >
      {/* ======================================================
          LEFT SIDE
      ====================================================== */}

      <div className="customer-checkout-main">
        {/* ====================================================
            DELIVERY ADDRESS
        ==================================================== */}

        <section className="customer-checkout-card">
          <div className="customer-checkout-card-heading">
            <div>
              <MapPin
                size={20}
              />
            </div>

            <div>
              <span>
                DELIVERY
              </span>

              <h2>
                Delivery Address
              </h2>

              <p>
                Tell us where your CRAVEO
                order should be delivered.
              </p>
            </div>
          </div>

          <div className="customer-checkout-fields">
            {/* =================================================
                FULL NAME
            ================================================= */}

            <label>
              Full Name

              <input
                type="text"
                name="fullName"
                defaultValue={
                  customer?.name ||
                  ""
                }
                required
              />
            </label>

            {/* =================================================
                PHONE
            ================================================= */}

            <label>
              Phone

              <input
                type="text"
                name="phone"
                defaultValue={
                  customer?.phone ||
                  ""
                }
                placeholder="03XX XXXXXXX"
                required
              />
            </label>

            {/* =================================================
                ADDRESS
            ================================================= */}

            <label className="checkout-field-full">
              Address

              <input
                type="text"
                name="address"
                defaultValue={
                  customer
                    ?.defaultAddress
                    ?.address ||
                  ""
                }
                placeholder="House / Flat / Street"
                required
              />
            </label>

            {/* =================================================
                AREA
            ================================================= */}

            <label>
              Area

              <input
                type="text"
                name="area"
                defaultValue={
                  customer
                    ?.defaultAddress
                    ?.area ||
                  ""
                }
                placeholder="Area"
                required
              />
            </label>

            {/* =================================================
                CITY - LOCKED
            ================================================= */}

            <label>
              City

              <div
                style={{
                  position:
                    "relative",
                }}
              >
                <input
                  type="text"
                  name="city"
                  value={
                    fixedCity
                  }
                  readOnly
                  required
                  aria-readonly="true"
                  className="customer-checkout-city-locked"
                  style={{
                    width:
                      "100%",

                    paddingRight:
                      "42px",

                    cursor:
                      "not-allowed",

                    background:
                      "#f7f4f1",
                  }}
                />

                <LockKeyhole
                  size={15}
                  style={{
                    position:
                      "absolute",

                    right:
                      "14px",

                    top:
                      "50%",

                    transform:
                      "translateY(-50%)",

                    pointerEvents:
                      "none",

                    opacity:
                      0.55,
                  }}
                />
              </div>

              <small
                className="customer-checkout-city-note"
                style={{
                  display:
                    "block",

                  marginTop:
                    "5px",

                  fontSize:
                    "10px",

                  fontWeight:
                    "500",

                  opacity:
                    0.65,
                }}
              >
                City is fixed according to
                your CRAVEO account.
              </small>
            </label>

            {/* =================================================
                ORDER NOTES
            ================================================= */}

            <label className="checkout-field-full">
              Order Notes

              <textarea
                name="notes"
                placeholder="Optional delivery instructions..."
                rows={4}
              />
            </label>
          </div>
        </section>

        {/* ====================================================
            PAYMENT METHOD
        ==================================================== */}

        <section className="customer-checkout-card">
          <div className="customer-checkout-card-heading">
            <div>
              <CreditCard
                size={20}
              />
            </div>

            <div>
              <span>
                PAYMENT
              </span>

              <h2>
                Payment Method
              </h2>

              <p>
                Choose your payment
                method.
              </p>
            </div>
          </div>

          <div className="customer-payment-methods">
            {/* =================================================
                CASH ON DELIVERY
            ================================================= */}

            {settings.cashOnDeliveryEnabled && (
              <button
                type="button"
                className={
                  paymentMethod ===
                  "cod"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPaymentMethod(
                    "cod"
                  )
                }
              >
                <Truck
                  size={20}
                />

                <span>
                  <strong>
                    Cash On Delivery
                  </strong>

                  <small>
                    Pay when your order
                    arrives.
                  </small>
                </span>
              </button>
            )}

            {/* =================================================
                CARD
            ================================================= */}

            {settings.cardPaymentEnabled && (
              <button
                type="button"
                className={
                  paymentMethod ===
                  "card"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPaymentMethod(
                    "card"
                  )
                }
              >
                <CreditCard
                  size={20}
                />

                <span>
                  <strong>
                    Card
                  </strong>

                  <small>
                    Online card payment.
                  </small>
                </span>
              </button>
            )}

            {/* =================================================
                BANK TRANSFER
            ================================================= */}

            {settings.bankTransferEnabled && (
              <button
                type="button"
                className={
                  paymentMethod ===
                  "bank-transfer"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPaymentMethod(
                    "bank-transfer"
                  )
                }
              >
                <CreditCard
                  size={20}
                />

                <span>
                  <strong>
                    Bank Transfer
                  </strong>

                  <small>
                    Pay through bank
                    transfer.
                  </small>
                </span>
              </button>
            )}

            {/* =================================================
                WALLET
            ================================================= */}

            {settings.walletPaymentEnabled && (
              <button
                type="button"
                className={
                  paymentMethod ===
                  "wallet"
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setPaymentMethod(
                    "wallet"
                  )
                }
              >
                <WalletCards
                  size={20}
                />

                <span>
                  <strong>
                    Wallet
                  </strong>

                  <small>
                    Digital wallet
                    payment.
                  </small>
                </span>
              </button>
            )}
          </div>
        </section>
      </div>

      {/* ======================================================
          ORDER SUMMARY
      ====================================================== */}

      <aside className="customer-checkout-summary">
        <span>
          ORDER SUMMARY
        </span>

        <h2>
          {branch.name}
        </h2>

        {/* ====================================================
            ITEMS
        ==================================================== */}

        <div className="customer-checkout-items-mini">
          {cart.items.map(
            (item) => (
              <div
                key={
                  item.id
                }
                className="customer-checkout-mini-item"
              >
                <div>
                  <strong>
                    {item.name}
                  </strong>

                  <span>
                    {item.quantity}
                    {" × "}
                    {formatPrice(
                      item.unitPrice +
                        item.variantPrice
                    )}
                  </span>

                  {item.variantName && (
                    <small>
                      {
                        item.variantName
                      }
                    </small>
                  )}
                </div>

                <strong>
                  {formatPrice(
                    item.lineTotal
                  )}
                </strong>
              </div>
            )
          )}
        </div>

        {/* ====================================================
            COUPON
        ==================================================== */}

        <div className="customer-summary-coupon">
          <div className="customer-summary-coupon-title">
            <Tag
              size={15}
            />

            <span>
              Coupon Code
            </span>
          </div>

          <div className="customer-summary-coupon-form">
            <input
              type="text"
              value={
                couponCode
              }
              placeholder="Enter code"
              onChange={(
                event
              ) => {
                setCouponCode(
                  event.target.value
                );

                setCouponDiscount(
                  0
                );

                setCouponMessage(
                  ""
                );

                setCouponError(
                  ""
                );
              }}
            />

            <button
              type="button"
              disabled={
                applyingCoupon
              }
              onClick={
                applyCoupon
              }
            >
              {applyingCoupon
                ? "..."
                : "Apply"}
            </button>
          </div>

          {/* ==================================================
              COUPON SUCCESS
          ================================================== */}

          {couponMessage && (
            <div className="customer-summary-coupon-success">
              <CheckCircle2
                size={13}
              />

              <span>
                {
                  couponMessage
                }
              </span>

              <button
                type="button"
                onClick={
                  removeCoupon
                }
              >
                Remove
              </button>
            </div>
          )}

          {/* ==================================================
              COUPON ERROR
          ================================================== */}

          {couponError && (
            <div className="customer-summary-coupon-error">
              {
                couponError
              }
            </div>
          )}
        </div>

        {/* ====================================================
            SUBTOTAL
        ==================================================== */}

        <div className="customer-checkout-summary-row">
          <span>
            Subtotal
          </span>

          <strong>
            {formatPrice(
              cart.subtotal
            )}
          </strong>
        </div>

        {/* ====================================================
            DELIVERY
        ==================================================== */}

        <div className="customer-checkout-summary-row">
          <span>
            Delivery
          </span>

          <strong>
            {deliveryFee === 0
              ? "FREE"
              : formatPrice(
                  deliveryFee
                )}
          </strong>
        </div>

        {/* ====================================================
            DISCOUNT
        ==================================================== */}

        {couponDiscount >
          0 && (
          <div className="customer-checkout-summary-row discount">
            <span>
              Coupon Discount
            </span>

            <strong>
              -{" "}
              {formatPrice(
                couponDiscount
              )}
            </strong>
          </div>
        )}

        {/* ====================================================
            TOTAL
        ==================================================== */}

        <div className="customer-checkout-total">
          <span>
            Total
          </span>

          <strong>
            {formatPrice(
              total
            )}
          </strong>
        </div>

        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div className="customer-checkout-error">
            {error}
          </div>
        )}

        {/* ====================================================
            PLACE ORDER
        ==================================================== */}

        <button
          type="submit"
          className="customer-place-order-btn"
          disabled={
            submitting ||
            !paymentMethod ||
            !fixedCity
          }
        >
          {submitting && (
            <LoaderCircle
              size={17}
            />
          )}

          {submitting
            ? "Placing Order..."
            : "Place Order"}
        </button>
      </aside>
    </form>
  );
}