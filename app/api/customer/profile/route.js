// ============================================================
// CRAVEO - CUSTOMER PROFILE API
// NAME + PHONE + CITY + AVATAR
// ============================================================

import { NextResponse } from "next/server";

import { connectDB } from "@/lib/mongodb";
import { getCustomerSession } from "@/lib/customerAuth";

import User from "@/models/User";
import Restaurant from "@/models/Restaurant";

import cloudinary from "@/lib/cloudinary";

// ============================================================
// NORMALIZE
// ============================================================

function normalize(value) {
  return (
    value
      ?.toString()
      .trim()
      .toLowerCase() || ""
  );
}

// ============================================================
// GET PROFILE
// ============================================================

export async function GET() {
  try {
    const session =
      await getCustomerSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    await connectDB();

    const user = await User.findOne({
      _id: session.userId,
      role: "customer",
      isActive: true,
    })
      .select(
        "name email phone city avatar avatarPublicId selectedRestaurantId"
      )
      .lean();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Customer not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,

      user: {
        id: user._id.toString(),

        name: user.name || "",

        email: user.email || "",

        phone: user.phone || "",

        city: user.city || "",

        avatar: user.avatar || "",

        avatarPublicId:
          user.avatarPublicId || "",

        selectedRestaurantId:
          user.selectedRestaurantId
            ?.toString() || null,
      },
    });
  } catch (error) {
    console.error(
      "GET CUSTOMER PROFILE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error?.message ||
          "Unable to load profile.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// PUT PROFILE
// ============================================================

export async function PUT(request) {
  try {
    // ========================================================
    // SESSION
    // ========================================================

    const session =
      await getCustomerSession();

    if (!session?.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Please login first.",
        },
        {
          status: 401,
        }
      );
    }

    // ========================================================
    // BODY
    // ========================================================

    const body =
      await request.json();

    const name =
      body.name
        ?.toString()
        .trim() || "";

    const phone =
      body.phone
        ?.toString()
        .trim() || "";

    const city =
      body.city
        ?.toString()
        .trim() || "";

    const avatar =
      body.avatar
        ?.toString()
        .trim() || "";

    const avatarPublicId =
      body.avatarPublicId
        ?.toString()
        .trim() || "";

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Full name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!city) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please select your city.",
        },
        {
          status: 400,
        }
      );
    }

    await connectDB();

    // ========================================================
    // CUSTOMER
    // ========================================================

    const currentUser =
      await User.findOne({
        _id: session.userId,
        role: "customer",
        isActive: true,
      })
        .select(
          "city avatar avatarPublicId selectedRestaurantId"
        )
        .lean();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // VALID ACTIVE CITY
    // ========================================================

    const activeCities =
      await Restaurant.distinct(
        "city",
        {
          isActive: true,
        }
      );

    const validCity =
      activeCities.find(
        (item) =>
          normalize(item) ===
          normalize(city)
      );

    if (!validCity) {
      return NextResponse.json(
        {
          success: false,

          message:
            "There is no active CRAVEO branch in the selected city.",
        },
        {
          status: 400,
        }
      );
    }

    const exactCity =
      validCity
        .toString()
        .trim();

    // ========================================================
    // CHECK CITY CHANGE
    // ========================================================

    const oldCity =
      normalize(
        currentUser.city
      );

    const newCity =
      normalize(
        exactCity
      );

    let branchReset = false;

    let selectedRestaurantId =
      currentUser.selectedRestaurantId ||
      null;

    // ========================================================
    // VERIFY EXISTING BRANCH AGAINST NEW CITY
    // ========================================================

    if (
      oldCity !== newCity &&
      selectedRestaurantId
    ) {
      const branch =
        await Restaurant.findById(
          selectedRestaurantId
        )
          .select("city")
          .lean();

      if (
        !branch ||
        normalize(branch.city) !==
          newCity
      ) {
        selectedRestaurantId =
          null;

        branchReset =
          true;
      }
    }

    // ========================================================
    // UPDATE OBJECT
    // ========================================================

    const updateData = {
      name,
      phone,
      city: exactCity,
      selectedRestaurantId,
    };

    // ========================================================
    // AVATAR
    // ========================================================

    if (avatar) {
      updateData.avatar =
        avatar;
    }

    if (avatarPublicId) {
      updateData.avatarPublicId =
        avatarPublicId;
    }

    // ========================================================
    // UPDATE USER
    // ========================================================

    const updatedUser =
      await User.findOneAndUpdate(
        {
          _id: session.userId,
          role: "customer",
          isActive: true,
        },
        {
          $set: updateData,
        },
        {
          new: true,
          runValidators: true,
        }
      ).select(
        "name email phone city avatar avatarPublicId selectedRestaurantId"
      );

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to update customer profile.",
        },
        {
          status: 500,
        }
      );
    }

    // ========================================================
    // DELETE OLD CLOUDINARY AVATAR
    // ========================================================

    if (
      avatarPublicId &&
      currentUser.avatarPublicId &&
      avatarPublicId !==
        currentUser.avatarPublicId
    ) {
      try {
        await cloudinary.uploader.destroy(
          currentUser.avatarPublicId
        );
      } catch (error) {
        console.error(
          "OLD CUSTOMER AVATAR DELETE ERROR:",
          error
        );
      }
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return NextResponse.json({
      success: true,

      message:
        "Profile updated successfully.",

      branchReset,

      user: {
        id:
          updatedUser._id.toString(),

        name:
          updatedUser.name || "",

        email:
          updatedUser.email || "",

        phone:
          updatedUser.phone || "",

        city:
          updatedUser.city || "",

        avatar:
          updatedUser.avatar || "",

        avatarPublicId:
          updatedUser.avatarPublicId ||
          "",

        selectedRestaurantId:
          updatedUser.selectedRestaurantId
            ?.toString() || null,
      },
    });
  } catch (error) {
    console.error(
      "UPDATE CUSTOMER PROFILE ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to update profile.",
      },
      {
        status: 500,
      }
    );
  }
}