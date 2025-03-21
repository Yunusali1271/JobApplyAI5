"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getUserApplicationKits, deleteApplicationKit } from "@/lib/firebase/applicationKitUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrash } from "react-icons/fa";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [kitToDelete, setKitToDelete] = useState<ApplicationKit | null>(null);

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

  const handleDelete = async (kit: ApplicationKit) => {
    setKitToDelete(kit);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!user || !kitToDelete) return;

    try {
      setDeletingId(kitToDelete.id);
      await deleteApplicationKit(user.uid, kitToDelete.id);
      setApplicationKits(prev => prev.filter(kit => kit.id !== kitToDelete.id));
      setShowDeleteConfirm(false);
      setKitToDelete(null);
    } catch (error) {
      console.error("Error deleting application kit:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Application</h1>
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
              <h1 className="text-2xl font-bold">Application</h1>
              <p className="text-gray-600">
                Your application dashboard is where you can manage all your Hire Me Packs and track job applications.
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
              <div className="min-w-full divide-y divide-gray-200">
                <div className="bg-gray-50">
                  <div className="grid grid-cols-[100px_2fr_2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3">
                    <div className="text-xs font-medium text-gray-500 uppercase">Status</div>
                    <div className="text-xs font-medium text-gray-500 uppercase">Job</div>
                    <div className="text-xs font-medium text-gray-500 uppercase">Company</div>
                    <div className="text-xs font-medium text-gray-500 uppercase text-center">Cover Letter</div>
                    <div className="text-xs font-medium text-gray-500 uppercase text-center">Resume</div>
                    <div className="text-xs font-medium text-gray-500 uppercase text-center">Follow-up</div>
                    <div className="text-xs font-medium text-gray-500 uppercase text-center">Actions</div>
                  </div>
                </div>
                <div className="bg-white divide-y divide-gray-200">
                  {applicationKits.map((kit) => (
                    <div key={kit.id} className="grid grid-cols-[100px_2fr_2fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-gray-50">
                      <div className="flex items-center">
                        <span className="text-purple-600">{kit.status}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-900">{kit.jobTitle}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-500">{kit.company}</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => {
                            router.push(`/job-hub/${kit.id}?tab=coverLetter`);
                          }}
                          className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-300 text-sm"
                        >
                          Open
                        </button>
                      </div>
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={() => {
                            router.push(`/job-hub/${kit.id}?tab=resume`);
                          }}
                          className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-300 text-sm"
                        >
                          Open
                        </button>
                      </div>
                      <div className="flex items-center justify-center">
                        <button 
                          className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-300 text-sm"
                          onClick={() => {
                            navigator.clipboard.writeText(kit.followUpEmail);
                            alert('Follow-up email copied to clipboard!');
                          }}
                        >
                          Copy
                        </button>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleDelete(kit)}
                          className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50"
                          disabled={deletingId === kit.id}
                        >
                          {deletingId === kit.id ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FaTrash size={16} />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && kitToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Application</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete your application for {kitToDelete.jobTitle} at {kitToDelete.company}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setKitToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 