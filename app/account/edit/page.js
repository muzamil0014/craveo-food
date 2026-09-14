// ============================================================
// CRAVEO - EDIT CUSTOMER PROFILE PAGE
// PROFILE + CITY + ACTIVE BRANCH CITIES
// ============================================================

import { redirect } from "next/navigation";

import { connectDB } from "@/lib/mongodb";
import { getCustomerSession } from "@/lib/customerAuth";

import User from "@/models/User";
import Restaurant from "@/models/Restaurant";

import CustomerNavbar from "@/components/customer/CustomerNavbar";
import CustomerFooter from "@/components/customer/CustomerFooter";
import CustomerProfileForm from "@/components/customer/CustomerProfileForm";

import "../../store.css";

// ============================================================
// FRESH DATA
// ============================================================

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ============================================================
// PAGE
// ============================================================

export default async function EditProfilePage() {
  // ==========================================================
  // SESSION
  // ==========================================================

  const session = await getCustomerSession();

  if (!session?.userId) {
    redirect("/login");
  }

  await connectDB();

  // ==========================================================
  // USER
  // ==========================================================

  const user = await User.findOne({
    _id: session.userId,
    role: "customer",
    isActive: true,
  })
    .select(
      "name email phone city avatar avatarPublicId"
    )
    .lean();

  if (!user) {
    redirect("/login");
  }

  // ==========================================================
  // ACTIVE CITIES FROM BRANCHES
  // ==========================================================

  const rawCities = await Restaurant.distinct(
    "city",
    {
      isActive: true,
    }
  );

  const cities = [
    ...new Set(
      rawCities
        .filter(Boolean)
        .map((city) =>
          city.toString().trim()
        )
        .filter(Boolean)
    ),
  ].sort((a, b) =>
    a.localeCompare(b)
  );

  // ==========================================================
  // SERIALIZED USER
  // ==========================================================

  const serializedUser = {
    id: user._id.toString(),
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    city: user.city || "",
    avatar: user.avatar || "",
    avatarPublicId:
      user.avatarPublicId || "",
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <CustomerNavbar />

      <main className="customer-profile-edit-page">
        <CustomerProfileForm
          user={serializedUser}
          cities={cities}
        />
      </main>

      <CustomerFooter />
    </>
  );
}