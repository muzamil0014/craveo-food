// ============================================================
// CRAVEO - EDIT COUPON PAGE
// ============================================================

import mongoose from "mongoose";

import {
  notFound,
} from "next/navigation";

import { connectDB } from "@/lib/mongodb";

import Coupon from "@/models/Coupon";
import Restaurant from "@/models/Restaurant";

import CouponForm from "@/components/admin/CouponForm";

// ============================================================
// DATE INPUT FORMAT
// ============================================================

function toDateTimeLocal(
  value
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  const offset =
    date.getTimezoneOffset();

  const localDate =
    new Date(
      date.getTime() -
        offset * 60000
    );

  return localDate
    .toISOString()
    .slice(0, 16);
}

// ============================================================
// PAGE
// ============================================================

export default async function EditCouponPage({
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

  const [
    coupon,
    branches,
  ] = await Promise.all([
    Coupon.findById(id).lean(),

    Restaurant.find({
      isActive: true,
    })
      .sort({
        name: 1,
      })
      .lean(),
  ]);

  if (!coupon) {
    notFound();
  }

  const serializedCoupon = {
    _id:
      coupon._id.toString(),

    code:
      coupon.code || "",

    title:
      coupon.title || "",

    description:
      coupon.description ||
      "",

    discountType:
      coupon.discountType ||
      "percentage",

    discountValue:
      coupon.discountValue ??
      0,

    minimumOrder:
      coupon.minimumOrder ??
      0,

    maximumDiscount:
      coupon.maximumDiscount ??
      0,

    usageLimit:
      coupon.usageLimit ?? 0,

    perUserLimit:
      coupon.perUserLimit ??
      1,

    startDate:
      toDateTimeLocal(
        coupon.startDate
      ),

    expiryDate:
      toDateTimeLocal(
        coupon.expiryDate
      ),

    restaurantIds:
      coupon.restaurantIds?.map(
        (branchId) =>
          branchId.toString()
      ) || [],

    isActive:
      coupon.isActive !==
      false,
  };

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
      coupon={
        serializedCoupon
      }
      branches={
        serializedBranches
      }
    />
  );
}