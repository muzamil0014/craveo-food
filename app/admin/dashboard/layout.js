// ============================================================
// CRAVEO - SUPER ADMIN DASHBOARD LAYOUT
//
// SERVER SIDE SECURITY
//
// Every route inside:
// /admin/dashboard/*
//
// requires:
// role = super-admin
// active admin account
// ============================================================

import {
  redirect,
} from "next/navigation";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getAdminSession,
} from "@/lib/auth";

import Admin from "@/models/Admin";

import AdminDashboardClientLayout from "@/components/admin/AdminDashboardClientLayout";

// ============================================================
// ALWAYS FRESH
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// LAYOUT
// ============================================================

export default async function AdminDashboardLayout({
  children,
}) {
  // ==========================================================
  // JWT SESSION
  // ==========================================================

  const session =
    await getAdminSession();

  // ==========================================================
  // LOGIN REQUIRED
  // ==========================================================

  if (
    !session ||
    !session.adminId ||
    session.role !==
      "super-admin"
  ) {
    redirect(
      "/admin/login"
    );
  }

  // ==========================================================
  // DATABASE
  // ==========================================================

  await connectDB();

  // ==========================================================
  // VERIFY CURRENT ADMIN FROM DATABASE
  //
  // Token alone is not enough.
  //
  // If admin:
  // - deleted
  // - disabled
  // - role changed
  //
  // dashboard will be blocked.
  // ==========================================================

  const admin =
    await Admin.findOne({
      _id:
        session.adminId,

      role:
        "super-admin",

      isActive:
        true,
    })
      .select(
        "name email phone role isActive"
      )
      .lean();

  // ==========================================================
  // INVALID / DISABLED ADMIN
  // ==========================================================

  if (!admin) {
    redirect(
      "/admin/login"
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

    role:
      admin.role,
  };

  // ==========================================================
  // DASHBOARD UI
  // ==========================================================

  return (
    <AdminDashboardClientLayout
      admin={adminData}
    >
      {children}
    </AdminDashboardClientLayout>
  );
}