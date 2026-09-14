// ============================================================
// CRAVEO - RESTAURANTS REDIRECT
// ============================================================

import {
  redirect,
} from "next/navigation";

// ============================================================
// PAGE
// ============================================================

export default function RestaurantsPage() {
  redirect(
    "/select-branch"
  );
}