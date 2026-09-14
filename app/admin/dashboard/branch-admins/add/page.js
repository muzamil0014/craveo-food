// ============================================================
// CRAVEO - ADD BRANCH ADMIN PAGE
// ============================================================

import {
  connectDB,
} from "@/lib/mongodb";

import Restaurant from "@/models/Restaurant";

import BranchAdminForm from "@/components/admin/BranchAdminForm";

// ============================================================
// PAGE
// ============================================================

export default async function AddBranchAdminPage() {
  await connectDB();

  const branches =
    await Restaurant.find({
      isActive: true,
    })
      .sort({
        name: 1,
      })
      .lean();

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
      })
    );

  return (
    <BranchAdminForm
      branches={
        serializedBranches
      }
    />
  );
}