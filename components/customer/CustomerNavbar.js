// ============================================================
// CRAVEO - CUSTOMER NAVBAR SERVER WRAPPER
// OPTIMIZED CUSTOMER + BRANCH + CART + WISHLIST
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
// COMPONENT
// ============================================================

export default async function CustomerNavbar() {
  // ==========================================================
  // DEFAULT VALUES
  // ==========================================================

  let customer = null;

  let branch = null;

  let cartCount = 0;

  let wishlistCount = 0;

  try {
    // ========================================================
    // SESSION FIRST
    //
    // Guest ho to navbar ke liye database hit ki zarurat nahi.
    // ========================================================

    const session =
      await getCustomerSession();

    if (!session?.userId) {
      return (
        <CustomerNavbarClient
          customer={null}
          branch={null}
          cartCount={0}
          wishlistCount={0}
        />
      );
    }

    // ========================================================
    // DATABASE
    // ========================================================

    await connectDB();

    // ========================================================
    // CUSTOMER
    // ========================================================

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
          "_id name email avatar city selectedRestaurantId"
        )
        .lean();

    // ========================================================
    // INVALID / DELETED USER
    // ========================================================

    if (!user) {
      return (
        <CustomerNavbarClient
          customer={null}
          branch={null}
          cartCount={0}
          wishlistCount={0}
        />
      );
    }

    // ========================================================
    // CUSTOMER DATA
    // ========================================================

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

    // ========================================================
    // PARALLEL QUERIES
    //
    // Previously:
    // Branch -> Cart -> Wishlist
    //
    // Now:
    // Branch + Cart + Wishlist together.
    // ========================================================

    const [
      selectedBranch,
      cart,
      wishlist,
    ] = await Promise.all([
      // ======================================================
      // SELECTED BRANCH
      // ======================================================

      user.selectedRestaurantId
        ? Restaurant.findOne({
            _id:
              user.selectedRestaurantId,

            isActive:
              true,
          })
            .select(
              "_id name city area"
            )
            .lean()
        : Promise.resolve(
            null
          ),

      // ======================================================
      // CART
      // ======================================================

      Cart.findOne({
        userId:
          user._id,
      })
        .select(
          "items.quantity"
        )
        .lean(),

      // ======================================================
      // WISHLIST
      // ======================================================

      Wishlist.findOne({
        userId:
          user._id,
      })
        .select(
          "items"
        )
        .lean(),
    ]);

    // ========================================================
    // BRANCH DATA
    // ========================================================

    if (selectedBranch) {
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

    // ========================================================
    // CART COUNT
    // ========================================================

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
          ) => {
            return (
              total +
              Number(
                item?.quantity ||
                  0
              )
            );
          },
          0
        );
    }

    // ========================================================
    // WISHLIST COUNT
    // ========================================================

    if (
      Array.isArray(
        wishlist?.items
      )
    ) {
      wishlistCount =
        wishlist.items.length;
    }
  } catch (error) {
    // ========================================================
    // NAVBAR ERROR SHOULD NOT CRASH COMPLETE WEBSITE
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