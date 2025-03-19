"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getUserApplicationKits } from "@/lib/firebase/applicationKitUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import Sidebar from "@/app/components/Sidebar";

interface ApplicationKit {
  id: string;
  jobTitle: string;
  company: string;
  status: string;
  coverLetter: string;
  resume: string;
  followUpEmail: string;
  createdAt: Date;
}

export default function JobHub() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [applicationKits, setApplicationKits] = useState<ApplicationKit[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchApplicationKits = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const kits = await getUserApplicationKits(user.uid);
        const formattedKits = kits.map((kit: any) => ({
          ...kit,
          createdAt: kit.createdAt?.toDate() || new Date(),
        }));
        
        setApplicationKits(formattedKits);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching application kits:", error);
        setLoading(false);
      }
    };

    fetchApplicationKits();
  }, [user]);

  const handleSignIn = async () => {
    try {
      setSigningIn(true);
      await signInWithGoogle();
      // The user state will be updated automatically by the auth listener
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Failed to sign in. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  const navigateToHome = () => {
    router.push("/");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Job Hub</h1>
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto mt-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">Sign in to access your applications</h2>
                <p className="text-gray-600 mb-6">
                  View and manage all your job applications in one place
                </p>
                <button
                  onClick={handleSignIn}
                  disabled={signingIn}
                  className={`w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-3 ${
                    signingIn ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {!signingIn && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  <span>{signingIn ? 'Signing in...' : 'Sign in with Google'}</span>
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Your applications will be saved securely to your account
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Job Hub</h1>
              <p className="text-gray-600">
                Your job hub is where you can manage all your Hire Me Packs and track job applications.
              </p>
            </div>
            <button 
              onClick={navigateToHome}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full flex items-center"
            >
              <FaPlus className="mr-2" /> New Hire Me Pack
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <p>Loading your applications...</p>
            </div>
          ) : applicationKits.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium">No Hire Me Packs yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first Hire Me Pack to get started.
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Hire Me Pack
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cover Letter
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resume
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Follow-up
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hire Me Pack
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applicationKits.map((kit) => (
                    <tr key={kit.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-indigo-600 font-medium">{kit.status || "Interested"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{kit.jobTitle}</div>
                        <div className="text-sm text-gray-500">{kit.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/job-hub/${kit.id}?tab=coverLetter`}
                          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded shadow text-sm"
                        >
                          Open
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/job-hub/${kit.id}?tab=resume`}
                          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded shadow text-sm"
                        >
                          Open
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded shadow text-sm"
                          onClick={() => {
                            navigator.clipboard.writeText(kit.followUpEmail);
                            alert('Follow-up email copied to clipboard!');
                          }}
                        >
                          Copy
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/job-hub/${kit.id}`}
                          className="inline-flex items-center justify-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          <span className="mr-1">⦿</span> Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 