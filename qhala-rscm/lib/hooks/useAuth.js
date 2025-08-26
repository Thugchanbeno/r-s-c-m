"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useAuth() {
  const { data: session, status } = useSession();
  
  // Get fresh user data from Convex for real-time updates
  const userData = useQuery(
    api.users.getCurrentUser,
    session?.user?.email ? { email: session.user.email } : "skip"
  );

  return {
    user: userData || session?.user, // Use fresh data if available, fallback to session
    session,
    isLoading: status === "loading" || (session?.user?.email && userData === undefined),
    isAuthenticated: !!session?.user,
    status,
  };
}