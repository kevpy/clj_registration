"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="px-3 py-1.5 rounded-md bg-white text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
      onClick={() => void signOut()}
    >
      Sign out
    </button>
  );
}
