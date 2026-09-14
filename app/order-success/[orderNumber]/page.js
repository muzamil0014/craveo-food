// ============================================================
// CRAVEO - ORDER SUCCESS PAGE
// ============================================================

import Link from "next/link";

import {
  CheckCircle2,
  Home,
  PackageCheck,
} from "lucide-react";

import {
  notFound,
  redirect,
} from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import { getCustomerSession } from "@/lib/customerAuth";

import Order from "@/models/Order";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";

import "../../store.css";

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

// ============================================================
// PAGE
// ============================================================

export default async function OrderSuccessPage({
  params,
}) {
  const {
    orderNumber,
  } = await params;

  const session =
    await getCustomerSession();

  if (!session?.userId) {
    redirect(
      "/login"
    );
  }

  await connectDB();

  const order =
    await Order.findOne({
      orderNumber,

      userId:
        session.userId,
    })
      .select(
        "orderNumber total status paymentMethod createdAt"
      )
      .lean();

  if (!order) {
    notFound();
  }

  return (
    <>
      <CustomerNavbar />

      <main className="customer-order-success-page">
        <section className="customer-order-success-card">
          <div className="customer-order-success-icon">
            <CheckCircle2
              size={38}
            />
          </div>

          <span>
            ORDER CONFIRMED
          </span>

          <h1>
            Thank You!
          </h1>

          <p>
            Your CRAVEO order has been
            placed successfully.
          </p>

          <div className="customer-order-success-number">
            <small>
              ORDER NUMBER
            </small>

            <strong>
              {
                order.orderNumber
              }
            </strong>
          </div>

          <div className="customer-order-success-info">
            <div>
              <span>
                Total
              </span>

              <strong>
                PKR{" "}
                {Number(
                  order.total ||
                    0
                ).toLocaleString()}
              </strong>
            </div>

            <div>
              <span>
                Status
              </span>

              <strong>
                {order.status}
              </strong>
            </div>

            <div>
              <span>
                Payment
              </span>

              <strong>
                {
                  order.paymentMethod
                }
              </strong>
            </div>
          </div>

          <div className="customer-order-success-actions">
            <Link href="/">
              <Home
                size={16}
              />

              Home
            </Link>

            <Link href="/account/orders">
              <PackageCheck
                size={16}
              />

              My Orders
            </Link>
          </div>
        </section>
      </main>

      <CustomerFooter />
    </>
  );
}