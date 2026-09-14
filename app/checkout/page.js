// ============================================================
// CRAVEO - CUSTOMER CHECKOUT PAGE
// ============================================================

import { redirect } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import { getCustomerSession } from "@/lib/customerAuth";

import User from "@/models/User";
import Restaurant from "@/models/Restaurant";
import Cart from "@/models/Cart";
import Settings from "@/models/Settings";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import CheckoutForm from "@/components/customer/CheckoutForm";

import "../store.css";

// ============================================================
// FRESH DATA
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

// ============================================================
// PAGE
// ============================================================

export default async function CheckoutPage() {
  // ==========================================================
  // SESSION
  // ==========================================================

  const session =
    await getCustomerSession();

  if (!session?.userId) {
    redirect(
      "/login"
    );
  }

  await connectDB();

  // ==========================================================
  // CUSTOMER
  // ==========================================================

  const user =
    await User.findOne({
      _id: session.userId,
      role: "customer",
      isActive: true,
    }).lean();

  if (!user) {
    redirect(
      "/login"
    );
  }

  if (
    !user.selectedRestaurantId
  ) {
    redirect(
      "/select-branch"
    );
  }

  // ==========================================================
  // BRANCH
  // ==========================================================

  const branch =
    await Restaurant.findOne({
      _id:
        user.selectedRestaurantId,

      isActive: true,
    })
      .select(
        "_id name city area"
      )
      .lean();

  if (!branch) {
    redirect(
      "/select-branch"
    );
  }

  // ==========================================================
  // CART + SETTINGS
  // ==========================================================

  const [
    cart,
    settings,
  ] = await Promise.all([
    Cart.findOne({
      userId: user._id,
      restaurantId:
        branch._id,
    }).lean(),

    Settings.findOne({
      key: "main",
    }).lean(),
  ]);

  if (
    !cart ||
    !cart.items?.length
  ) {
    redirect(
      "/cart"
    );
  }

  // ==========================================================
  // DEFAULT ADDRESS
  // ==========================================================

  const defaultAddress =
    user.addresses?.find(
      (address) =>
        address.isDefault
    ) ||
    user.addresses?.[0] ||
    null;

  // ==========================================================
  // SERIALIZE CUSTOMER
  // ==========================================================

  const customerData = {
    name:
      user.name || "",

    email:
      user.email || "",

    phone:
      user.phone || "",

    defaultAddress:
      defaultAddress
        ? {
            address:
              defaultAddress.address ||
              "",

            area:
              defaultAddress.area ||
              "",

            city:
              defaultAddress.city ||
              "",
          }
        : null,
  };

  // ==========================================================
  // SERIALIZE BRANCH
  // ==========================================================

  const branchData = {
    id:
      branch._id.toString(),

    name:
      branch.name,

    city:
      branch.city || "",

    area:
      branch.area || "",
  };

  // ==========================================================
  // SERIALIZE CART
  // ==========================================================

  const cartData = {
    subtotal:
      Number(
        cart.subtotal ||
          0
      ),

    items:
      cart.items.map(
        (item) => ({
          id:
            item._id.toString(),

          name:
            item.name,

          quantity:
            Number(
              item.quantity ||
                1
            ),

          unitPrice:
            Number(
              item.unitPrice ||
                0
            ),

          variantName:
            item.variantName ||
            "",

          variantPrice:
            Number(
              item.variantPrice ||
                0
            ),

          lineTotal:
            (Number(
              item.unitPrice ||
                0
            ) +
              Number(
                item.variantPrice ||
                  0
              )) *
            Number(
              item.quantity ||
                1
            ),
        })
      ),
  };

  // ==========================================================
  // SERIALIZE SETTINGS
  // ==========================================================

  const settingsData = {
    deliveryEnabled:
      settings?.deliveryEnabled !==
      false,

    defaultDeliveryFee:
      Number(
        settings?.defaultDeliveryFee ??
          150
      ),

    freeDeliveryMinimum:
      Number(
        settings?.freeDeliveryMinimum ||
          0
      ),

    minimumOrderAmount:
      Number(
        settings?.minimumOrderAmount ||
          0
      ),

    cashOnDeliveryEnabled:
      settings?.cashOnDeliveryEnabled !==
      false,

    cardPaymentEnabled:
      settings?.cardPaymentEnabled ===
      true,

    bankTransferEnabled:
      settings?.bankTransferEnabled ===
      true,

    walletPaymentEnabled:
      settings?.walletPaymentEnabled ===
      true,
  };

  return (
    <>
      <CustomerNavbar />

      <main className="customer-checkout-page">
        <section className="customer-checkout-header">
          <span>
            SECURE CHECKOUT
          </span>

          <h1>
            Complete Your Order
          </h1>

          <p>
            Ordering from{" "}
            <strong>
              {branch.name}
            </strong>
            .
          </p>
        </section>

        <CheckoutForm
          customer={
            customerData
          }
          branch={
            branchData
          }
          cart={
            cartData
          }
          settings={
            settingsData
          }
        />
      </main>

      <CustomerFooter />
    </>
  );
}