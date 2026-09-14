// ============================================================
// CRAVEO - CATEGORIES API
//
// GET  /api/admin/categories
// POST /api/admin/categories
// ============================================================

import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";
import { uploadImage } from "@/lib/uploadImage";

import Category from "@/models/Category";

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
// GET ALL CATEGORIES
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

    const categories =
      await Category.find()
        .sort({
          sortOrder: 1,
          createdAt: -1,
        })
        .lean();

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error(
      "GET CATEGORIES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Unable to load categories.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// CREATE CATEGORY
// ============================================================

export async function POST(request) {
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

    const sortOrder =
      Number(
        formData.get("sortOrder")
      ) || 0;

    const image =
      formData.get("image");

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category name is required.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // UNIQUE NAME
    // --------------------------------------------------------

    const existingCategory =
      await Category.findOne({
        name: {
          $regex:
            `^${name.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            )}$`,
          $options: "i",
        },
      });

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // --------------------------------------------------------
    // UNIQUE SLUG
    // --------------------------------------------------------

    const baseSlug =
      createSlug(name);

    let slug = baseSlug;
    let counter = 1;

    while (
      await Category.exists({
        slug,
      })
    ) {
      slug =
        `${baseSlug}-${counter}`;

      counter++;
    }

    // --------------------------------------------------------
    // IMAGE
    // --------------------------------------------------------

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
          "craveo/categories"
        );

      imageUrl =
        uploaded.url;

      imagePublicId =
        uploaded.publicId;
    }

    // --------------------------------------------------------
    // CREATE
    // --------------------------------------------------------

    const category =
      await Category.create({
        name,
        slug,
        description,

        image:
          imageUrl,

        imagePublicId,

        isActive: true,

        sortOrder:
          Math.max(
            0,
            sortOrder
          ),
      });

    return NextResponse.json(
      {
        success: true,

        message:
          "Category created successfully.",

        category,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to create category.",
      },
      {
        status: 500,
      }
    );
  }
}