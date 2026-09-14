// ============================================================
// CRAVEO - EDIT BRANCH ADMIN PAGE
// NEXT.JS 16 DYNAMIC PARAMS FIX
// ============================================================

import { notFound } from "next/navigation";

import {
  connectDB,
} from "@/lib/mongodb";

import Admin from "@/models/Admin";
import Restaurant from "@/models/Restaurant";

import BranchAdminForm from "@/components/admin/BranchAdminForm";

// ============================================================
// FORCE DYNAMIC
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate =
  0;

// ============================================================
// PAGE
// ============================================================

export default async function EditBranchAdminPage({
  params,
}) {
  // ==========================================================
  // NEXT.JS 16 PARAMS
  // ==========================================================

  const resolvedParams =
    await params;

  const id =
    resolvedParams?.id
      ?.toString()
      .trim();

  if (!id) {
    notFound();
  }

  // ==========================================================
  // DATABASE
  // ==========================================================

  await connectDB();

  void Restaurant;

  // ==========================================================
  // ADMIN
  // ==========================================================

  const admin =
    await Admin.findOne({
      _id: id,

      role:
        "branch-admin",
    })
      .select("-password")
      .lean();

  if (!admin) {
    notFound();
  }

  // ==========================================================
  // BRANCHES
  // ==========================================================

  const branches =
    await Restaurant.find({
      isActive: true,
    })
      .select(
        "_id name city area isActive"
      )
      .sort({
        name: 1,
      })
      .lean();

  // ==========================================================
  // SERIALIZE ADMIN
  // ==========================================================

  const serializedAdmin = {
    _id:
      admin._id.toString(),

    name:
      admin.name || "",

    email:
      admin.email || "",

    phone:
      admin.phone || "",

    role:
      admin.role ||
      "branch-admin",

    isActive:
      admin.isActive !== false,

    restaurantId:
      admin.restaurantId
        ? admin.restaurantId.toString()
        : "",
  };

  // ==========================================================
  // SERIALIZE BRANCHES
  // ==========================================================

  const serializedBranches =
    branches.map(
      (branch) => ({
        _id:
          branch._id.toString(),

        name:
          branch.name || "",

        city:
          branch.city || "",

        area:
          branch.area || "",

        isActive:
          branch.isActive !== false,
      })
    );

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <main className="branch-admin-form-page">
      <BranchAdminForm
        mode="edit"
        admin={
          serializedAdmin
        }
        branches={
          serializedBranches
        }
      />
    </main>
  );
}