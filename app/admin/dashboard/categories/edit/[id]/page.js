// ============================================================
// CRAVEO - EDIT CATEGORY PAGE
// ============================================================

import mongoose from "mongoose";
import { notFound } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

import CategoryForm from "@/components/admin/CategoryForm";

// ============================================================
// PAGE
// ============================================================

export default async function EditCategoryPage({
  params,
}) {
  const { id } =
    await params;

  if (
    !mongoose.Types.ObjectId.isValid(
      id
    )
  ) {
    notFound();
  }

  await connectDB();

  const category =
    await Category.findById(
      id
    ).lean();

  if (!category) {
    notFound();
  }

  // ==========================================================
  // SERIALIZE MONGODB DATA
  // ==========================================================

  const serializedCategory = {
    _id:
      category._id.toString(),

    name:
      category.name || "",

    description:
      category.description ||
      "",

    image:
      category.image || "",

    imagePublicId:
      category.imagePublicId ||
      "",

    sortOrder:
      category.sortOrder ??
      0,

    isActive:
      category.isActive !==
      false,
  };

  return (
    <CategoryForm
      category={
        serializedCategory
      }
    />
  );
}