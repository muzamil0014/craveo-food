// ============================================================
// CRAVEO - CUSTOMER NAVBAR SERVER WRAPPER
// CUSTOMER + BRANCH + CART + WISHLIST
// ============================================================

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import User from "@/models/User";
import Restaurant from "@/models/Restaurant";
import Cart from "@/models/Cart";
import Wishlist from "@/models/Wishlist";

import CustomerNavbarClient from "@/components/customer/CustomerNavbarClient";

// ============================================================
// ALWAYS FRESH
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// COMPONENT
// ============================================================

export default async function CustomerNavbar() {
  // ==========================================================
  // DEFAULT DATA
  // ==========================================================

  let customer = null;

  let branch = null;

  let cartCount = 0;

  let wishlistCount = 0;

  // ==========================================================
  // DATABASE
  // ==========================================================

  try {
    await connectDB();

    // ========================================================
    // SESSION
    // ========================================================

    const session =
      await getCustomerSession();

    // ========================================================
    // LOGGED IN CUSTOMER
    // ========================================================

    if (session?.userId) {
      // ======================================================
      // USER
      // ======================================================

      const user =
        await User.findOne({
          _id:
            session.userId,

          role:
            "customer",

          isActive:
            true,
        })
          .select(
            "name email avatar city selectedRestaurantId"
          )
          .lean();

      // ======================================================
      // CUSTOMER DATA
      // ======================================================

      if (user) {
        customer = {
          id:
            user._id.toString(),

          name:
            user.name || "",

          email:
            user.email || "",

          city:
            user.city || "",

          avatar:
            user.avatar || "",
        };

        // ====================================================
        // SELECTED BRANCH
        // ====================================================

        if (
          user.selectedRestaurantId
        ) {
          const selectedBranch =
            await Restaurant.findOne({
              _id:
                user.selectedRestaurantId,

              isActive:
                true,
            })
              .select(
                "name city area"
              )
              .lean();

          if (
            selectedBranch
          ) {
            branch = {
              id:
                selectedBranch._id.toString(),

              name:
                selectedBranch.name ||
                "",

              city:
                selectedBranch.city ||
                "",

              area:
                selectedBranch.area ||
                "",
            };
          }
        }

        // ====================================================
        // CART
        // ====================================================

        const cart =
          await Cart.findOne({
            userId:
              user._id,
          })
            .select(
              "items"
            )
            .lean();

        if (
          Array.isArray(
            cart?.items
          )
        ) {
          cartCount =
            cart.items.reduce(
              (
                total,
                item
              ) =>
                total +
                Number(
                  item.quantity ||
                    0
                ),
              0
            );
        }

        // ====================================================
        // WISHLIST
        // ====================================================

        const wishlist =
          await Wishlist.findOne({
            userId:
              user._id,
          })
            .select(
              "items"
            )
            .lean();

        if (
          Array.isArray(
            wishlist?.items
          )
        ) {
          wishlistCount =
            wishlist.items.length;
        }
      }
    }
  } catch (error) {
    // ========================================================
    // NAVBAR SHOULD NOT CRASH WHOLE WEBSITE
    // ========================================================

    console.error(
      "CUSTOMER NAVBAR ERROR:",
      error
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <CustomerNavbarClient
      customer={
        customer
      }
      branch={
        branch
      }
      cartCount={
        cartCount
      }
      wishlistCount={
        wishlistCount
      }
    />
  );
}