// ============================================================
// CRAVEO - ADMIN SETTINGS API
//
// GET /api/admin/settings
// PUT /api/admin/settings
// ============================================================

import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

import Settings from "@/models/Settings";

// ============================================================
// AUTH
// ============================================================

async function requireSuperAdmin() {
  const session =
    await getAdminSession();

  if (
    !session ||
    session.role !== "super-admin"
  ) {
    return null;
  }

  return session;
}

// ============================================================
// GET SETTINGS
// ============================================================

export async function GET() {
  try {
    const session =
      await requireSuperAdmin();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    let settings =
      await Settings.findOne({
        key: "main",
      }).lean();

    // --------------------------------------------------------
    // CREATE DEFAULT SETTINGS
    // --------------------------------------------------------

    if (!settings) {
      const created =
        await Settings.create({
          key: "main",
        });

      settings =
        created.toObject();
    }

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error(
      "GET SETTINGS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to load settings.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// UPDATE SETTINGS
// ============================================================

export async function PUT(request) {
  try {
    const session =
      await requireSuperAdmin();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const body =
      await request.json();

    // ========================================================
    // SANITIZE NUMBER VALUES
    // ========================================================

    const defaultDeliveryFee =
      Math.max(
        0,
        Number(
          body.defaultDeliveryFee
        ) || 0
      );

    const freeDeliveryMinimum =
      Math.max(
        0,
        Number(
          body.freeDeliveryMinimum
        ) || 0
      );

    const minimumOrderAmount =
      Math.max(
        0,
        Number(
          body.minimumOrderAmount
        ) || 0
      );

    const estimatedDeliveryMinutes =
      Math.max(
        1,
        Number(
          body.estimatedDeliveryMinutes
        ) || 45
      );

    const cancellationMinutes =
      Math.max(
        0,
        Number(
          body.cancellationMinutes
        ) || 0
      );

    // ========================================================
    // UPDATE OBJECT
    // ========================================================

    const updateData = {
      // ------------------------------------------------------
      // GENERAL
      // ------------------------------------------------------

      siteName:
        body.siteName
          ?.toString()
          .trim() ||
        "CRAVEO",

      siteTagline:
        body.siteTagline
          ?.toString()
          .trim() ||
        "",

      currency:
        body.currency
          ?.toString()
          .trim()
          .toUpperCase() ||
        "PKR",

      timezone:
        body.timezone
          ?.toString()
          .trim() ||
        "Asia/Karachi",

      // ------------------------------------------------------
      // DELIVERY
      // ------------------------------------------------------

      deliveryEnabled:
        Boolean(
          body.deliveryEnabled
        ),

      defaultDeliveryFee,

      freeDeliveryMinimum,

      minimumOrderAmount,

      estimatedDeliveryMinutes,

      // ------------------------------------------------------
      // ORDER
      // ------------------------------------------------------

      ordersEnabled:
        Boolean(
          body.ordersEnabled
        ),

      allowOrderCancellation:
        Boolean(
          body.allowOrderCancellation
        ),

      cancellationMinutes,

      autoConfirmOrders:
        Boolean(
          body.autoConfirmOrders
        ),

      // ------------------------------------------------------
      // PAYMENT
      // ------------------------------------------------------

      cashOnDeliveryEnabled:
        Boolean(
          body.cashOnDeliveryEnabled
        ),

      cardPaymentEnabled:
        Boolean(
          body.cardPaymentEnabled
        ),

      bankTransferEnabled:
        Boolean(
          body.bankTransferEnabled
        ),

      walletPaymentEnabled:
        Boolean(
          body.walletPaymentEnabled
        ),

      // ------------------------------------------------------
      // CONTACT
      // ------------------------------------------------------

      supportEmail:
        body.supportEmail
          ?.toString()
          .trim() ||
        "",

      supportPhone:
        body.supportPhone
          ?.toString()
          .trim() ||
        "",

      businessAddress:
        body.businessAddress
          ?.toString()
          .trim() ||
        "",

      // ------------------------------------------------------
      // SOCIAL
      // ------------------------------------------------------

      facebookUrl:
        body.facebookUrl
          ?.toString()
          .trim() ||
        "",

      instagramUrl:
        body.instagramUrl
          ?.toString()
          .trim() ||
        "",

      youtubeUrl:
        body.youtubeUrl
          ?.toString()
          .trim() ||
        "",

      tiktokUrl:
        body.tiktokUrl
          ?.toString()
          .trim() ||
        "",

      // ------------------------------------------------------
      // MAINTENANCE
      // ------------------------------------------------------

      maintenanceMode:
        Boolean(
          body.maintenanceMode
        ),

      maintenanceMessage:
        body.maintenanceMessage
          ?.toString()
          .trim() ||
        "CRAVEO is temporarily unavailable.",
    };

    // ========================================================
    // SAVE
    // ========================================================

    const settings =
      await Settings.findOneAndUpdate(
        {
          key: "main",
        },
        {
          $set: updateData,
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
        }
      ).lean();

    return NextResponse.json({
      success: true,

      message:
        "Settings updated successfully.",

      settings,
    });
  } catch (error) {
    console.error(
      "UPDATE SETTINGS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to update settings.",
      },
      {
        status: 500,
      }
    );
  }
}