// ============================================================
// CRAVEO - EDIT FOOD PAGE
// ============================================================

import mongoose from "mongoose";

import {
  notFound,
} from "next/navigation";

import {
  connectDB,
} from "@/lib/mongodb";

import Food from "@/models/Food";
import Category from "@/models/Category";
import Restaurant from "@/models/Restaurant";

import FoodForm from "@/components/admin/FoodForm";

// ============================================================
// PAGE
// ============================================================

export default async function EditFoodPage({
  params,
}) {
  // ==========================================================
  // PARAMS
  // ==========================================================

  const {
    id,
  } = await params;

  // ==========================================================
  // VALID ID
  // ==========================================================

  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    notFound();
  }

  // ==========================================================
  // DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // LOAD DATA
  // ==========================================================

  const [
    food,
    categories,
    branches,
  ] =
    await Promise.all([
      Food.findById(
        id
      ).lean(),

      Category.find({
        isActive: true,
      })
        .sort({
          sortOrder: 1,
          name: 1,
        })
        .lean(),

      Restaurant.find({
        isActive: true,
      })
        .sort({
          name: 1,
        })
        .lean(),
    ]);

  // ==========================================================
  // FOOD NOT FOUND
  // ==========================================================

  if (!food) {
    notFound();
  }

  // ==========================================================
  // SERIALIZE FOOD
  //
  // VARIANTS REMOVED
  // ==========================================================

  const serializedFood = {
    _id:
      food._id.toString(),

    name:
      food.name || "",

    description:
      food.description || "",

    categoryId:
      food.categoryId
        ? food.categoryId.toString()
        : "",

    restaurantIds:
      food.restaurantIds?.map(
        (branchId) =>
          branchId.toString()
      ) || [],

    image:
      food.image || "",

    price:
      food.price ?? "",

    salePrice:
      food.salePrice ?? "",

    stock:
      food.stock ?? 0,

    isAvailable:
      food.isAvailable !==
      false,

    isFeatured:
      Boolean(
        food.isFeatured
      ),

    isPopular:
      Boolean(
        food.isPopular
      ),
  };

  // ==========================================================
  // SERIALIZE CATEGORIES
  // ==========================================================

  const serializedCategories =
    categories.map(
      (category) => ({
        _id:
          category._id.toString(),

        name:
          category.name,
      })
    );

  // ==========================================================
  // SERIALIZE BRANCHES
  // ==========================================================

  const serializedBranches =
    branches.map(
      (branch) => ({
        _id:
          branch._id.toString(),

        name:
          branch.name,

        city:
          branch.city || "",

        area:
          branch.area || "",

        branchType:
          branch.branchType ||
          "normal",
      })
    );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <FoodForm
      food={
        serializedFood
      }
      categories={
        serializedCategories
      }
      branches={
        serializedBranches
      }
    />
  );
}