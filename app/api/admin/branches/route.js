// ============================================================
// CRAVEO - BRANCHES API
//
// GET  /api/admin/branches
// POST /api/admin/branches
// ============================================================

import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";
import { uploadImage } from "@/lib/uploadImage";

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
// SLUG
// ============================================================

function createSlug(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ============================================================
// CITY NORMALIZER
// ============================================================

function normalizeCity(value) {
  return value
    .toString()
    .trim()
    .replace(/\s+/g, " ");
}

// ============================================================
// REGEX ESCAPE
// ============================================================

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

// ============================================================
// VALID BRANCH TYPE
// ============================================================

function validBranchType(value) {
  return [
    "super",
    "city-main",
    "normal",
  ].includes(value);
}

// ============================================================
// GET ALL
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

    const branches =
      await Restaurant.find()
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      branches,
    });
  } catch (error) {
    console.error(
      "GET BRANCHES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to load branches.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST - CREATE BRANCH
// ============================================================

export async function POST(request) {
  try {
    // --------------------------------------------------------
    // AUTH
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // FORM DATA
    // --------------------------------------------------------

    const formData =
      await request.formData();

    // --------------------------------------------------------
    // VALUES
    // --------------------------------------------------------

    const name =
      formData
        .get("name")
        ?.toString()
        .trim();

    const description =
      formData
        .get("description")
        ?.toString()
        .trim() || "";

    const rawBranchType =
      formData
        .get("branchType")
        ?.toString()
        .trim();

    const branchType =
      rawBranchType || "normal";

    const phone =
      formData
        .get("phone")
        ?.toString()
        .trim();

    const email =
      formData
        .get("email")
        ?.toString()
        .trim()
        .toLowerCase() || "";

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

    const area =
      formData
        .get("area")
        ?.toString()
        .trim() || "";

    const openingTime =
      formData
        .get("openingTime")
        ?.toString() ||
      "11:00";

    const closingTime =
      formData
        .get("closingTime")
        ?.toString() ||
      "23:00";

    const deliveryTime =
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

    const isFeatured =
      formData
        .get("isFeatured")
        ?.toString() ===
      "true";

    // ========================================================
    // DEBUG - TERMINAL MEIN VALUE DIKHEGI
    // ========================================================

    console.log(
      "CREATE BRANCH TYPE:",
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
      const existingSuper =
        await Restaurant.findOne({
          branchType: "super",
        });

      if (existingSuper) {
        return NextResponse.json(
          {
            success: false,

            message:
              `Super Branch already exists: ${existingSuper.name}. Only one Super Branch is allowed.`,
          },
          {
            status: 409,
          }
        );
      }
    }

    // ========================================================
    // CITY MAIN BRANCH RULE
    // ========================================================

    if (
      branchType ===
      "city-main"
    ) {
      const existingCityMain =
        await Restaurant.findOne({
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

      if (existingCityMain) {
        return NextResponse.json(
          {
            success: false,

            message:
              `${city} already has a City Main Branch: ${existingCityMain.name}.`,
          },
          {
            status: 409,
          }
        );
      }
    }

    // ========================================================
    // SLUG
    // ========================================================

    const baseSlug =
      createSlug(name);

    let slug = baseSlug;

    let number = 1;

    while (
      await Restaurant.exists({
        slug,
      })
    ) {
      slug =
        `${baseSlug}-${number}`;

      number++;
    }

    // ========================================================
    // IMAGE
    // ========================================================

    const image =
      formData.get("image");

    let imageUrl = "";
    let imagePublicId = "";

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

      imageUrl =
        uploaded.url;

      imagePublicId =
        uploaded.publicId;
    }

    // ========================================================
    // CREATE
    // ========================================================

    const branch =
      await Restaurant.create({
        name,
        slug,
        description,

        // IMPORTANT
        branchType,

        image:
          imageUrl,

        imagePublicId,

        phone,
        email,

        address,
        city,
        area,

        openingTime,
        closingTime,

        deliveryTime,

        deliveryFee:
          Number.isFinite(
            deliveryFee
          )
            ? Math.max(
                0,
                deliveryFee
              )
            : 0,

        minimumOrder:
          Number.isFinite(
            minimumOrder
          )
            ? Math.max(
                0,
                minimumOrder
              )
            : 0,

        isFeatured,

        isActive: true,
      });

    // ========================================================
    // VERIFY SAVED TYPE
    // ========================================================

    console.log(
      "SAVED BRANCH TYPE:",
      branch.branchType
    );

    return NextResponse.json(
      {
        success: true,

        message:
          "Branch created successfully.",

        branch: {
          id:
            branch._id.toString(),

          name:
            branch.name,

          branchType:
            branch.branchType,

          city:
            branch.city,

          image:
            branch.image,

          isActive:
            branch.isActive,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE BRANCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to create branch.",
      },
      {
        status: 500,
      }
    );
  }
}