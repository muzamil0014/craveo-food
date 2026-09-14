// ============================================================
// CRAVEO - BRANCH ADMIN DASHBOARD LAYOUT
// ============================================================

import {
  redirect,
} from "next/navigation";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getBranchAdminSession,
} from "@/lib/auth";

import Admin from "@/models/Admin";
import Restaurant from "@/models/Restaurant";

import BranchDashboardClientLayout from "@/components/admin/branch/BranchDashboardClientLayout";
// ============================================================
// FORCE DYNAMIC
// BRANCH ADMIN DEPENDS ON AUTH COOKIES
// ============================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================
// BRANCH ADMIN DASHBOARD LAYOUT
// ============================================================

export default async function BranchDashboardLayout({
  children,
}) {
  // ==========================================================
  // GET BRANCH ADMIN SESSION
  // ==========================================================

  const session =
    await getBranchAdminSession();

  if (!session) {
    redirect(
      "/admin/branch-login"
    );
  }

  // ==========================================================
  // CONNECT DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // VERIFY BRANCH ADMIN
  // ==========================================================

  const admin =
    await Admin.findOne({
      _id:
        session.adminId,

      role:
        "branch-admin",

      restaurantId:
        session.restaurantId,

      isActive:
        true,
    })
      .select(
        "name email phone restaurantId isActive"
      )
      .lean();

  if (!admin) {
    redirect(
      "/admin/branch-login"
    );
  }

  // ==========================================================
  // VERIFY ASSIGNED BRANCH
  // ==========================================================

  const branch =
    await Restaurant.findOne({
      _id:
        session.restaurantId,

      isActive:
        true,
    })
      .select(
        "name city area image isActive"
      )
      .lean();

  if (!branch) {
    redirect(
      "/admin/branch-login"
    );
  }

  // ==========================================================
  // SERIALIZE ADMIN
  // ==========================================================

  const adminData = {
    id:
      admin._id.toString(),

    name:
      admin.name || "",

    email:
      admin.email || "",

    phone:
      admin.phone || "",
  };

  // ==========================================================
  // SERIALIZE BRANCH
  // ==========================================================

  const branchData = {
    id:
      branch._id.toString(),

    name:
      branch.name || "",

    city:
      branch.city || "",

    area:
      branch.area || "",

    image:
      branch.image || "",
  };

  // ==========================================================
  // CLIENT LAYOUT
  //
  // Mobile sidebar state client component handle karega.
  // ==========================================================

  return (
    <BranchDashboardClientLayout
      admin={adminData}
      branch={branchData}
    >
      {children}
    </BranchDashboardClientLayout>
  );
}