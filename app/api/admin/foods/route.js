// ============================================================
// CRAVEO - FOODS API
//
// GET  /api/admin/foods
// POST /api/admin/foods
// ============================================================

import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";
import { uploadImage } from "@/lib/uploadImage";

import Food from "@/models/Food";
import Category from "@/models/Category";
import Restaurant from "@/models/Restaurant";

// ============================================================
// REQUIRE SUPER ADMIN
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
// SLUGIFY
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
// PARSE BOOLEAN
// ============================================================

function parseBoolean(value) {
  return (
    value?.toString() === "true"
  );
}

// ============================================================
// PARSE VARIANTS
// ============================================================

function parseVariants(value) {
  try {
    if (!value) {
      return [];
    }

    const parsed =
      JSON.parse(
        value.toString()
      );

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(
        (item) =>
          item?.name?.trim()
      )
      .map((item) => ({
        name:
          item.name.trim(),

        price:
          Math.max(
            0,
            Number(
              item.price
            ) || 0
          ),
      }));
  } catch {
    return [];
  }
}

// ============================================================
// GET ALL FOODS
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

    const foods =
      await Food.find()
        .populate(
          "categoryId",
          "name"
        )
        .populate(
          "restaurantIds",
          "name city area branchType"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      foods,
    });
  } catch (error) {
    console.error(
      "GET FOODS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to load foods.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// CREATE FOOD
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

    const categoryId =
      formData
        .get("categoryId")
        ?.toString()
        .trim();

    const price =
      Number(
        formData.get("price")
      );

    const salePrice =
      Number(
        formData.get("salePrice")
      );

    const stock =
      Number(
        formData.get("stock")
      );

    const isAvailable =
      parseBoolean(
        formData.get(
          "isAvailable"
        )
      );

    const isFeatured =
      parseBoolean(
        formData.get(
          "isFeatured"
        )
      );

    const isPopular =
      parseBoolean(
        formData.get(
          "isPopular"
        )
      );

    const variants =
      parseVariants(
        formData.get(
          "variants"
        )
      );

    const restaurantIds =
      formData
        .getAll(
          "restaurantIds"
        )
        .map((value) =>
          value.toString()
        )
        .filter((id) =>
          mongoose.Types.ObjectId.isValid(
            id
          )
        );

    const image =
      formData.get("image");

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Food name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !categoryId ||
      !mongoose.Types.ObjectId.isValid(
        categoryId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid category is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid food price is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      restaurantIds.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Assign food to at least one branch.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // VERIFY CATEGORY
    // --------------------------------------------------------

    const category =
      await Category.findById(
        categoryId
      );

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Selected category does not exist.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------------
    // VERIFY BRANCHES
    // --------------------------------------------------------

    const branchCount =
      await Restaurant.countDocuments({
        _id: {
          $in: restaurantIds,
        },
      });

    if (
      branchCount !==
      restaurantIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "One or more selected branches are invalid.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // SLUG
    // ========================================================

    const baseSlug =
      createSlug(name);

    let slug = baseSlug;
    let counter = 1;

    while (
      await Food.exists({
        slug,
      })
    ) {
      slug =
        `${baseSlug}-${counter}`;

      counter++;
    }

    // ========================================================
    // IMAGE
    // ========================================================

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
          "craveo/foods"
        );

      imageUrl =
        uploaded.url;

      imagePublicId =
        uploaded.publicId;
    }

    // ========================================================
    // CREATE
    // ========================================================

    const food =
      await Food.create({
        name,
        slug,
        description,

        categoryId,

        restaurantIds,

        image:
          imageUrl,

        imagePublicId,

        price:
          Math.max(
            0,
            price
          ),

        salePrice:
          Number.isFinite(
            salePrice
          )
            ? Math.max(
                0,
                salePrice
              )
            : 0,

        variants,

        stock:
          Number.isFinite(
            stock
          )
            ? Math.max(
                0,
                stock
              )
            : 0,

        isAvailable,

        isFeatured,

        isPopular,
      });

    return NextResponse.json(
      {
        success: true,

        message:
          "Food created successfully.",

        food: {
          id:
            food._id.toString(),

          name:
            food.name,

          image:
            food.image,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE FOOD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to create food.",
      },
      {
        status: 500,
      }
    );
  }
}