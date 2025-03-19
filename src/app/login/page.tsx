"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { signInWithGoogle } from "@/lib/firebase/firebaseUtils";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import Link from "next/link";
import Sidebar from "@/app/components/Sidebar";

export default function Login() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // If user is already logged in, redirect to job hub
    if (user) {
      router.push("/job-hub");
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    
    try {
      await signInWithGoogle();
      // Auth state change will trigger redirect in useEffect
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-md mx-auto mt-16">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center mb-6">Login to JobApplyAI</h1>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            
            <div className="mb-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-lg px-6 py-3 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaGoogle className="text-[#4285F4]" />
                <span>{loading ? "Signing in..." : "Sign in with Google"}</span>
              </button>
            </div>
            
            <div className="text-center text-sm text-gray-500">
              <p>
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-indigo-600 hover:text-indigo-800">
                  Sign up
                </Link>
              </p>
              <p className="mt-2">
                By signing in, you agree to our{" "}
                <a href="#" className="text-indigo-600 hover:text-indigo-800">Terms of Service</a>
                {" "}and{" "}
                <a href="#" className="text-indigo-600 hover:text-indigo-800">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 