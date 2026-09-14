// ============================================================
// CRAVEO - EDIT BRANCH PAGE
// ============================================================

import mongoose from "mongoose";
import { notFound } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import Restaurant from "@/models/Restaurant";

import BranchForm from "@/components/admin/BranchForm";

// ============================================================
// EDIT BRANCH PAGE
// ============================================================

export default async function EditBranchPage({
  params,
}) {
  // ==========================================================
  // NEXT.JS 16 PARAMS
  // ==========================================================

  const { id } =
    await params;

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

  const branch =
    await Restaurant.findById(
      id
    ).lean();

  if (!branch) {
    notFound();
  }

  // ==========================================================
  // SERIALIZE
  // ==========================================================

  const serializedBranch = {
    _id:
      branch._id.toString(),

    name:
      branch.name || "",

    slug:
      branch.slug || "",

    description:
      branch.description || "",

    // Older branches without branchType
    // automatically appear as normal.
    branchType:
      branch.branchType ||
      "normal",

    image:
      branch.image || "",

    imagePublicId:
      branch.imagePublicId ||
      "",

    phone:
      branch.phone || "",

    email:
      branch.email || "",

    address:
      branch.address || "",

    city:
      branch.city ||
      "Karachi",

    area:
      branch.area || "",

    openingTime:
      branch.openingTime ||
      "11:00",

    closingTime:
      branch.closingTime ||
      "23:00",

    deliveryTime:
      branch.deliveryTime ||
      "30-45 min",

    deliveryFee:
      branch.deliveryFee ??
      0,

    minimumOrder:
      branch.minimumOrder ??
      0,

    isActive:
      branch.isActive !== false,

    isFeatured:
      Boolean(
        branch.isFeatured
      ),
  };

  return (
    <BranchForm
      branch={serializedBranch}
    />
  );
}