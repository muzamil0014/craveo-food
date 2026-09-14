// ============================================================
// CRAVEO - ADD FOOD PAGE
// ============================================================

import {
  connectDB,
} from "@/lib/mongodb";

import Category from "@/models/Category";
import Restaurant from "@/models/Restaurant";

import FoodForm from "@/components/admin/FoodForm";

// ============================================================
// PAGE
// ============================================================

export default async function AddFoodPage() {
  // ==========================================================
  // DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // ACTIVE CATEGORIES
  // ==========================================================

  const categories =
    await Category.find({
      isActive: true,
    })
      .sort({
        sortOrder: 1,
        name: 1,
      })
      .lean();

  // ==========================================================
  // ACTIVE BRANCHES
  // ==========================================================

  const branches =
    await Restaurant.find({
      isActive: true,
    })
      .sort({
        name: 1,
      })
      .lean();

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
      categories={
        serializedCategories
      }
      branches={
        serializedBranches
      }
    />
  );
}