// ============================================================
// CRAVEO - ADD COUPON PAGE
// ============================================================

import { connectDB } from "@/lib/mongodb";

import Restaurant from "@/models/Restaurant";

import CouponForm from "@/components/admin/CouponForm";

// ============================================================
// PAGE
// ============================================================

export default async function AddCouponPage() {
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
    <CouponForm
      branches={
        serializedBranches
      }
    />
  );
}