// ============================================================
// CRAVEO - INITIAL SUPER ADMIN SETUP
// POST /api/setup/super-admin
// ============================================================

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import Admin from "@/models/Admin";

// ============================================================
// INITIAL SUPER ADMIN DETAILS
// Development setup credentials
// ============================================================

const SUPER_ADMIN = {
  name: "CRAVEO Super Admin",
  email: "admin@craveo.com",
  password: "Admin@123",
};

// ============================================================
// POST - CREATE SUPER ADMIN
// ============================================================

export async function POST() {
  try {
    // ========================================================
    // CONNECT TO MONGODB
    // ========================================================

    await connectDB();

    // ========================================================
    // CHECK IF ADMIN ALREADY EXISTS
    // ========================================================

    const existingAdmin = await Admin.findOne({
      email: SUPER_ADMIN.email,
    });

    // ========================================================
    // IF ADMIN EXISTS
    // ========================================================

    if (existingAdmin) {
      return NextResponse.json(
        {
          success: true,
          message: "Super Admin already exists.",
          admin: {
            id: existingAdmin._id.toString(),
            name: existingAdmin.name,
            email: existingAdmin.email,
            role: existingAdmin.role,
          },
        },
        {
          status: 200,
        }
      );
    }

    // ========================================================
    // HASH PASSWORD
    // ========================================================

    const hashedPassword = await bcrypt.hash(
      SUPER_ADMIN.password,
      12
    );

    // ========================================================
    // CREATE SUPER ADMIN
    // ========================================================

    const admin = await Admin.create({
      name: SUPER_ADMIN.name,

      email: SUPER_ADMIN.email,

      password: hashedPassword,

      phone: "",

      role: "super-admin",

      restaurantId: null,

      isActive: true,

      image: "",

      imagePublicId: "",

      lastLogin: null,
    });

    // ========================================================
    // SUCCESS RESPONSE
    // ========================================================

    return NextResponse.json(
      {
        success: true,

        message: "CRAVEO Super Admin created successfully.",

        admin: {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },

        login: {
          email: SUPER_ADMIN.email,
          password: SUPER_ADMIN.password,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "SUPER ADMIN SETUP ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message: "Unable to create Super Admin.",

        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}