"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/contexts/AuthContext";

export default function AuthWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
} 