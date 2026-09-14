// ============================================================
// CRAVEO - SINGLE BRANCH API
//
// GET
// PUT
// DELETE
// ============================================================

import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

import {
  uploadImage,
  deleteImage,
} from "@/lib/uploadImage";

import Restaurant from "@/models/Restaurant";

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
// HELPERS
// ============================================================

function validId(id) {
  return mongoose.Types.ObjectId.isValid(
    id
  );
}

function validBranchType(value) {
  return [
    "super",
    "city-main",
    "normal",
  ].includes(value);
}

function normalizeCity(value) {
  return value
    .toString()
    .trim()
    .replace(/\s+/g, " ");
}

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

// ============================================================
// GET
// ============================================================

export async function GET(
  request,
  { params }
) {
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

    const { id } =
      await params;

    if (!validId(id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid branch ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const branch =
      await Restaurant.findById(
        id
      ).lean();

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Branch not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      branch,
    });
  } catch (error) {
    console.error(
      "GET BRANCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to load branch.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// PUT
// ============================================================

export async function PUT(
  request,
  { params }
) {
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

    const { id } =
      await params;

    if (!validId(id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid branch ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const branch =
      await Restaurant.findById(
        id
      );

    if (!branch) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Branch not found.",
        },
        {
          status: 404,
        }
      );
    }

    const contentType =
      request.headers.get(
        "content-type"
      ) || "";

    // ========================================================
    // STATUS UPDATE
    // ========================================================

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      const body =
        await request.json();

      if (
        typeof body.isActive !==
        "boolean"
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid status.",
          },
          {
            status: 400,
          }
        );
      }

      branch.isActive =
        body.isActive;

      await branch.save();

      return NextResponse.json({
        success: true,

        message:
          "Branch status updated successfully.",
      });
    }

    // ========================================================
    // FULL FORM UPDATE
    // ========================================================

    const formData =
      await request.formData();

    const name =
      formData
        .get("name")
        ?.toString()
        .trim();

    const branchType =
      formData
        .get("branchType")
        ?.toString()
        .trim() ||
      "normal";

    const phone =
      formData
        .get("phone")
        ?.toString()
        .trim();

    const address =
      formData
        .get("address")
        ?.toString()
        .trim();

    const city =
      normalizeCity(
        formData
          .get("city")
          ?.toString() ||
          "Karachi"
      );

    // ========================================================
    // DEBUG
    // ========================================================

    console.log(
      "UPDATE BRANCH TYPE:",
      branchType
    );

    // ========================================================
    // VALIDATION
    // ========================================================

    if (
      !name ||
      !phone ||
      !address ||
      !city
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Name, phone, city and address are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !validBranchType(
        branchType
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            `Invalid branch type: ${branchType}`,
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // SUPER BRANCH RULE
    // ========================================================

    if (
      branchType === "super"
    ) {
      const anotherSuper =
        await Restaurant.findOne({
          _id: {
            $ne: branch._id,
          },

          branchType: "super",
        });

      if (anotherSuper) {
        return NextResponse.json(
          {
            success: false,

            message:
              `Super Branch already exists: ${anotherSuper.name}.`,
          },
          {
            status: 409,
          }
        );
      }
    }

    // ========================================================
    // CITY MAIN RULE
    // ========================================================

    if (
      branchType ===
      "city-main"
    ) {
      const anotherCityMain =
        await Restaurant.findOne({
          _id: {
            $ne: branch._id,
          },

          branchType:
            "city-main",

          city: {
            $regex:
              `^${escapeRegex(
                city
              )}$`,

            $options: "i",
          },
        });

      if (anotherCityMain) {
        return NextResponse.json(
          {
            success: false,

            message:
              `${city} already has a City Main Branch: ${anotherCityMain.name}.`,
          },
          {
            status: 409,
          }
        );
      }
    }

    // ========================================================
    // UPDATE
    // ========================================================

    branch.name =
      name;

    // IMPORTANT
    branch.branchType =
      branchType;

    branch.description =
      formData
        .get("description")
        ?.toString()
        .trim() || "";

    branch.phone =
      phone;

    branch.email =
      formData
        .get("email")
        ?.toString()
        .trim()
        .toLowerCase() || "";

    branch.address =
      address;

    branch.city =
      city;

    branch.area =
      formData
        .get("area")
        ?.toString()
        .trim() || "";

    branch.openingTime =
      formData
        .get("openingTime")
        ?.toString() ||
      "11:00";

    branch.closingTime =
      formData
        .get("closingTime")
        ?.toString() ||
      "23:00";

    branch.deliveryTime =
      formData
        .get("deliveryTime")
        ?.toString()
        .trim() ||
      "30-45 min";

    const deliveryFee =
      Number(
        formData.get(
          "deliveryFee"
        )
      );

    const minimumOrder =
      Number(
        formData.get(
          "minimumOrder"
        )
      );

    branch.deliveryFee =
      Number.isFinite(
        deliveryFee
      )
        ? Math.max(
            0,
            deliveryFee
          )
        : 0;

    branch.minimumOrder =
      Number.isFinite(
        minimumOrder
      )
        ? Math.max(
            0,
            minimumOrder
          )
        : 0;

    branch.isFeatured =
      formData
        .get("isFeatured")
        ?.toString() ===
      "true";

    // ========================================================
    // IMAGE
    // ========================================================

    const image =
      formData.get("image");

    if (
      image &&
      typeof image !== "string" &&
      typeof image.arrayBuffer ===
        "function" &&
      image.size > 0
    ) {
      const uploaded =
        await uploadImage(
          image,
          "craveo/branches"
        );

      const oldPublicId =
        branch.imagePublicId;

      branch.image =
        uploaded.url;

      branch.imagePublicId =
        uploaded.publicId;

      if (oldPublicId) {
        await deleteImage(
          oldPublicId
        );
      }
    }

    // ========================================================
    // SAVE
    // ========================================================

    await branch.save();

    console.log(
      "SAVED UPDATE TYPE:",
      branch.branchType
    );

    return NextResponse.json({
      success: true,

      message:
        "Branch updated successfully.",

      branch: {
        id:
          branch._id.toString(),

        name:
          branch.name,

        branchType:
          branch.branchType,

        city:
          branch.city,

        isActive:
          branch.isActive,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE BRANCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to update branch.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// DELETE
// ============================================================

export async function DELETE(
  request,
  { params }
) {
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

    const { id } =
      await params;

    if (!validId(id)) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid branch ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const branch =
      await Restaurant.findById(
        id
      );

    if (!branch) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Branch not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      branch.imagePublicId
    ) {
      await deleteImage(
        branch.imagePublicId
      );
    }

    await branch.deleteOne();

    return NextResponse.json({
      success: true,

      message:
        "Branch deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE BRANCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to delete branch.",
      },
      {
        status: 500,
      }
    );
  }
}