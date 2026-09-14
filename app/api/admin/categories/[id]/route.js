// ============================================================
// CRAVEO - SINGLE CATEGORY API
// ============================================================

import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

import {
  uploadImage,
  deleteImage,
} from "@/lib/uploadImage";

import Category from "@/models/Category";

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
// VALID ID
// ============================================================

function validId(id) {
  return mongoose.Types.ObjectId.isValid(
    id
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
            "Invalid category ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const category =
      await Category.findById(
        id
      ).lean();

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error(
      "GET CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load category.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// UPDATE
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
            "Invalid category ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const category =
      await Category.findById(
        id
      );

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category not found.",
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
              "Valid status is required.",
          },
          {
            status: 400,
          }
        );
      }

      category.isActive =
        body.isActive;

      await category.save();

      return NextResponse.json({
        success: true,

        message:
          "Category status updated successfully.",

        category: {
          id:
            category._id.toString(),

          isActive:
            category.isActive,
        },
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

    const description =
      formData
        .get("description")
        ?.toString()
        .trim() || "";

    const sortOrder =
      Number(
        formData.get("sortOrder")
      ) || 0;

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
    // DUPLICATE NAME CHECK
    // --------------------------------------------------------

    const duplicate =
      await Category.findOne({
        _id: {
          $ne: category._id,
        },

        name: {
          $regex:
            `^${name.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            )}$`,

          $options: "i",
        },
      });

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Another category with this name already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // --------------------------------------------------------
    // UPDATE
    // --------------------------------------------------------

    category.name =
      name;

    category.description =
      description;

    category.sortOrder =
      Math.max(
        0,
        sortOrder
      );

    // --------------------------------------------------------
    // IMAGE
    // --------------------------------------------------------

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
          "craveo/categories"
        );

      const oldPublicId =
        category.imagePublicId;

      category.image =
        uploaded.url;

      category.imagePublicId =
        uploaded.publicId;

      if (oldPublicId) {
        await deleteImage(
          oldPublicId
        );
      }
    }

    await category.save();

    return NextResponse.json({
      success: true,

      message:
        "Category updated successfully.",

      category: {
        id:
          category._id.toString(),

        name:
          category.name,

        image:
          category.image,

        isActive:
          category.isActive,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to update category.",
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
            "Invalid category ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const category =
      await Category.findById(
        id
      );

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category not found.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------------
    // DELETE IMAGE
    // --------------------------------------------------------

    if (
      category.imagePublicId
    ) {
      await deleteImage(
        category.imagePublicId
      );
    }

    // --------------------------------------------------------
    // DELETE DOCUMENT
    // --------------------------------------------------------

    await category.deleteOne();

    return NextResponse.json({
      success: true,
      message:
        "Category deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE CATEGORY ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to delete category.",
      },
      {
        status: 500,
      }
    );
  }
}