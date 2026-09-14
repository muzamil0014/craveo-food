// ============================================================
// CRAVEO - CUSTOMER SAVED ADDRESSES API
//
// GET    -> LOAD ADDRESSES
// POST   -> ADD ADDRESS
// PUT    -> EDIT / SET DEFAULT
// DELETE -> DELETE ADDRESS
// ============================================================

import {
  NextResponse,
} from "next/server";

import {
  revalidatePath,
} from "next/cache";

import mongoose from "mongoose";

import {
  connectDB,
} from "@/lib/mongodb";

import {
  getCustomerSession,
} from "@/lib/customerAuth";

import User from "@/models/User";

// ============================================================
// FRESH
// ============================================================

export const dynamic =
  "force-dynamic";

export const revalidate = 0;

// ============================================================
// CLEAN TEXT
// ============================================================

function cleanText(
  value,
  maximum = 300
) {
  return String(
    value || ""
  )
    .trim()
    .slice(
      0,
      maximum
    );
}

// ============================================================
// CURRENT CUSTOMER
// ============================================================

async function getCustomer() {
  const session =
    await getCustomerSession();

  if (!session?.userId) {
    return {
      error:
        NextResponse.json(
          {
            success: false,
            message:
              "Please login first.",
          },
          {
            status: 401,
          }
        ),
    };
  }

  const user =
    await User.findOne({
      _id:
        session.userId,

      role:
        "customer",

      isActive:
        true,
    }).select(
      "name email phone city addresses"
    );

  if (!user) {
    return {
      error:
        NextResponse.json(
          {
            success: false,
            message:
              "Customer account not found.",
          },
          {
            status: 401,
          }
        ),
    };
  }

  return {
    user,
  };
}

// ============================================================
// SERIALIZE ADDRESS
// ============================================================

function serializeAddress(
  address
) {
  return {
    id:
      address._id?.toString() ||
      "",

    label:
      address.label ||
      "Home",

    fullName:
      address.fullName ||
      "",

    phone:
      address.phone ||
      "",

    address:
      address.address ||
      "",

    area:
      address.area ||
      "",

    city:
      address.city ||
      "",

    isDefault:
      Boolean(
        address.isDefault
      ),
  };
}

// ============================================================
// GET
// ============================================================

export async function GET() {
  try {
    await connectDB();

    const result =
      await getCustomer();

    if (result.error) {
      return result.error;
    }

    const user =
      result.user;

    const addresses =
      Array.isArray(
        user.addresses
      )
        ? user.addresses.map(
            serializeAddress
          )
        : [];

    return NextResponse.json({
      success: true,

      addresses,

      customer: {
        name:
          user.name || "",

        phone:
          user.phone || "",

        city:
          user.city || "",
      },
    });
  } catch (error) {
    console.error(
      "GET CUSTOMER ADDRESSES ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to load addresses.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST
// ADD ADDRESS
// ============================================================

export async function POST(
  request
) {
  try {
    await connectDB();

    const result =
      await getCustomer();

    if (result.error) {
      return result.error;
    }

    const user =
      result.user;

    const body =
      await request.json();

    // ========================================================
    // VALUES
    // ========================================================

    const label =
      cleanText(
        body.label,
        30
      ) || "Home";

    const fullName =
      cleanText(
        body.fullName,
        100
      );

    const phone =
      cleanText(
        body.phone,
        30
      );

    const address =
      cleanText(
        body.address,
        300
      );

    const area =
      cleanText(
        body.area,
        100
      );

    const city =
      cleanText(
        body.city,
        100
      );

    const isDefault =
      Boolean(
        body.isDefault
      );

    // ========================================================
    // VALIDATION
    // ========================================================

    if (
      !fullName ||
      !phone ||
      !address ||
      !area ||
      !city
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please complete all address fields.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // CITY RESTRICTION
    // ========================================================

    if (
      user.city &&
      city.toLowerCase() !==
        user.city.toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            `Address city must be ${user.city}.`,
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // DUPLICATE
    // ========================================================

    const duplicate =
      user.addresses?.some(
        (item) =>
          item.address
            ?.trim()
            .toLowerCase() ===
            address.toLowerCase() &&
          item.area
            ?.trim()
            .toLowerCase() ===
            area.toLowerCase() &&
          item.city
            ?.trim()
            .toLowerCase() ===
            city.toLowerCase()
      );

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,

          message:
            "This address is already saved.",
        },
        {
          status: 409,
        }
      );
    }

    // ========================================================
    // FIRST ADDRESS = DEFAULT
    // ========================================================

    const shouldDefault =
      user.addresses.length ===
        0 ||
      isDefault;

    // ========================================================
    // REMOVE OLD DEFAULT
    // ========================================================

    if (shouldDefault) {
      user.addresses.forEach(
        (item) => {
          item.isDefault =
            false;
        }
      );
    }

    // ========================================================
    // ADD
    // ========================================================

    user.addresses.push({
      label,
      fullName,
      phone,
      address,
      area,
      city,

      isDefault:
        shouldDefault,
    });

    await user.save();

    revalidatePath(
      "/account"
    );

    revalidatePath(
      "/account/addresses"
    );

    revalidatePath(
      "/checkout"
    );

    return NextResponse.json(
      {
        success: true,

        message:
          "Address saved successfully.",

        addresses:
          user.addresses.map(
            serializeAddress
          ),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "CREATE ADDRESS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to save address.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// PUT
// UPDATE ADDRESS / SET DEFAULT
// ============================================================

export async function PUT(
  request
) {
  try {
    await connectDB();

    const result =
      await getCustomer();

    if (result.error) {
      return result.error;
    }

    const user =
      result.user;

    const body =
      await request.json();

    const addressId =
      cleanText(
        body.addressId,
        50
      );

    if (
      !mongoose.Types.ObjectId.isValid(
        addressId
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid address ID.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // FIND ADDRESS
    // ========================================================

    const savedAddress =
      user.addresses.id(
        addressId
      );

    if (!savedAddress) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Address not found.",
        },
        {
          status: 404,
        }
      );
    }

    // ========================================================
    // SET DEFAULT ONLY
    // ========================================================

    if (
      body.action ===
      "set-default"
    ) {
      user.addresses.forEach(
        (item) => {
          item.isDefault =
            item._id.toString() ===
            addressId;
        }
      );

      await user.save();

      revalidatePath(
        "/account"
      );

      revalidatePath(
        "/account/addresses"
      );

      revalidatePath(
        "/checkout"
      );

      return NextResponse.json({
        success: true,

        message:
          "Default address updated.",

        addresses:
          user.addresses.map(
            serializeAddress
          ),
      });
    }

    // ========================================================
    // EDIT VALUES
    // ========================================================

    const label =
      cleanText(
        body.label,
        30
      ) || "Home";

    const fullName =
      cleanText(
        body.fullName,
        100
      );

    const phone =
      cleanText(
        body.phone,
        30
      );

    const address =
      cleanText(
        body.address,
        300
      );

    const area =
      cleanText(
        body.area,
        100
      );

    const city =
      cleanText(
        body.city,
        100
      );

    const isDefault =
      Boolean(
        body.isDefault
      );

    // ========================================================
    // REQUIRED
    // ========================================================

    if (
      !fullName ||
      !phone ||
      !address ||
      !area ||
      !city
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Please complete all address fields.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // CITY
    // ========================================================

    if (
      user.city &&
      city.toLowerCase() !==
        user.city.toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            `Address city must be ${user.city}.`,
        },
        {
          status: 400,
        }
      );
    }

    // ========================================================
    // SET DEFAULT
    // ========================================================

    if (isDefault) {
      user.addresses.forEach(
        (item) => {
          item.isDefault =
            false;
        }
      );
    }

    // ========================================================
    // UPDATE
    // ========================================================

    savedAddress.label =
      label;

    savedAddress.fullName =
      fullName;

    savedAddress.phone =
      phone;

    savedAddress.address =
      address;

    savedAddress.area =
      area;

    savedAddress.city =
      city;

    if (isDefault) {
      savedAddress.isDefault =
        true;
    }

    await user.save();

    revalidatePath(
      "/account"
    );

    revalidatePath(
      "/account/addresses"
    );

    revalidatePath(
      "/checkout"
    );

    return NextResponse.json({
      success: true,

      message:
        "Address updated successfully.",

      addresses:
        user.addresses.map(
          serializeAddress
        ),
    });
  } catch (error) {
    console.error(
      "UPDATE ADDRESS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to update address.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// DELETE
// ============================================================

export async function DELETE(
  request
) {
  try {
    await connectDB();

    const result =
      await getCustomer();

    if (result.error) {
      return result.error;
    }

    const user =
      result.user;

    const body =
      await request.json();

    const addressId =
      cleanText(
        body.addressId,
        50
      );

    if (
      !mongoose.Types.ObjectId.isValid(
        addressId
      )
    ) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Invalid address ID.",
        },
        {
          status: 400,
        }
      );
    }

    const savedAddress =
      user.addresses.id(
        addressId
      );

    if (!savedAddress) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Address not found.",
        },
        {
          status: 404,
        }
      );
    }

    const wasDefault =
      Boolean(
        savedAddress.isDefault
      );

    // ========================================================
    // REMOVE
    // ========================================================

    savedAddress.deleteOne();

    // ========================================================
    // IF DEFAULT DELETED
    // SET FIRST REMAINING AS DEFAULT
    // ========================================================

    if (
      wasDefault &&
      user.addresses.length >
        0
    ) {
      user.addresses[0].isDefault =
        true;
    }

    await user.save();

    revalidatePath(
      "/account"
    );

    revalidatePath(
      "/account/addresses"
    );

    revalidatePath(
      "/checkout"
    );

    return NextResponse.json({
      success: true,

      message:
        "Address deleted successfully.",

      addresses:
        user.addresses.map(
          serializeAddress
        ),
    });
  } catch (error) {
    console.error(
      "DELETE ADDRESS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error?.message ||
          "Unable to delete address.",
      },
      {
        status: 500,
      }
    );
  }
}