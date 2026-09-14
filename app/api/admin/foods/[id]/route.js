// ============================================================
// CRAVEO - SINGLE FOOD API
//
// GET    /api/admin/foods/[id]
// PUT    /api/admin/foods/[id]
// DELETE /api/admin/foods/[id]
// ============================================================

import mongoose from "mongoose";
import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getAdminSession } from "@/lib/auth";

import {
  uploadImage,
  deleteImage,
} from "@/lib/uploadImage";

import Food from "@/models/Food";
import Category from "@/models/Category";
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
// VALID ID
// ============================================================

function validId(id) {
  return mongoose.Types.ObjectId.isValid(
    id
  );
}

// ============================================================
// BOOLEAN
// ============================================================

function parseBoolean(value) {
  return (
    value?.toString() === "true"
  );
}

// ============================================================
// VARIANTS
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
            "Invalid food ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const food =
      await Food.findById(
        id
      )
        .populate(
          "categoryId",
          "name"
        )
        .populate(
          "restaurantIds",
          "name city area"
        )
        .lean();

    if (!food) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Food not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      food,
    });
  } catch (error) {
    console.error(
      "GET FOOD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to load food.",
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
            "Invalid food ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const food =
      await Food.findById(id);

    if (!food) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Food not found.",
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
    // QUICK JSON UPDATE
    // availability / featured / popular / stock
    // ========================================================

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      const body =
        await request.json();

      if (
        typeof body.isAvailable ===
        "boolean"
      ) {
        food.isAvailable =
          body.isAvailable;
      }

      if (
        typeof body.isFeatured ===
        "boolean"
      ) {
        food.isFeatured =
          body.isFeatured;
      }

      if (
        typeof body.isPopular ===
        "boolean"
      ) {
        food.isPopular =
          body.isPopular;
      }

      if (
        body.stock !== undefined
      ) {
        const stock =
          Number(body.stock);

        if (
          !Number.isFinite(stock) ||
          stock < 0
        ) {
          return NextResponse.json(
            {
              success: false,
              message:
                "Invalid stock value.",
            },
            {
              status: 400,
            }
          );
        }

        food.stock = stock;
      }

      await food.save();

      return NextResponse.json({
        success: true,

        message:
          "Food updated successfully.",

        food: {
          id:
            food._id.toString(),

          isAvailable:
            food.isAvailable,

          isFeatured:
            food.isFeatured,

          isPopular:
            food.isPopular,

          stock:
            food.stock,
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

    const restaurantIds =
      formData
        .getAll(
          "restaurantIds"
        )
        .map((value) =>
          value.toString()
        )
        .filter((branchId) =>
          mongoose.Types.ObjectId.isValid(
            branchId
          )
        );

    const variants =
      parseVariants(
        formData.get(
          "variants"
        )
      );

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

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
            "Select at least one branch.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // CATEGORY EXISTS
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
    // BRANCHES EXIST
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
    // UPDATE DATA
    // ========================================================

    food.name = name;

    food.description =
      description;

    food.categoryId =
      categoryId;

    food.restaurantIds =
      restaurantIds;

    food.price =
      Math.max(
        0,
        price
      );

    food.salePrice =
      Number.isFinite(
        salePrice
      )
        ? Math.max(
            0,
            salePrice
          )
        : 0;

    food.stock =
      Number.isFinite(
        stock
      )
        ? Math.max(
            0,
            stock
          )
        : 0;

    food.variants =
      variants;

    food.isAvailable =
      parseBoolean(
        formData.get(
          "isAvailable"
        )
      );

    food.isFeatured =
      parseBoolean(
        formData.get(
          "isFeatured"
        )
      );

    food.isPopular =
      parseBoolean(
        formData.get(
          "isPopular"
        )
      );

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
          "craveo/foods"
        );

      const oldPublicId =
        food.imagePublicId;

      food.image =
        uploaded.url;

      food.imagePublicId =
        uploaded.publicId;

      if (oldPublicId) {
        await deleteImage(
          oldPublicId
        );
      }
    }

    await food.save();

    return NextResponse.json({
      success: true,

      message:
        "Food updated successfully.",

      food: {
        id:
          food._id.toString(),

        name:
          food.name,

        image:
          food.image,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE FOOD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to update food.",
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
            "Invalid food ID.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    const food =
      await Food.findById(id);

    if (!food) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Food not found.",
        },
        {
          status: 404,
        }
      );
    }

    if (
      food.imagePublicId
    ) {
      await deleteImage(
        food.imagePublicId
      );
    }

    await food.deleteOne();

    return NextResponse.json({
      success: true,

      message:
        "Food deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE FOOD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Unable to delete food.",
      },
      {
        status: 500,
      }
    );
  }
}