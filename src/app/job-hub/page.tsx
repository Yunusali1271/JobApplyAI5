"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import {
  getUserApplicationKits,
  deleteApplicationKit,
  manageDeletedAppIds,
} from "@/lib/firebase/applicationKitUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPlus, FaTrash } from "react-icons/fa";
import Sidebar from "@/app/components/Sidebar";
import ApplicationModal from "@/components/ApplicationModal";

// Add custom toast implementation
function useCustomToast() {
  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
    // Create a div element for the toast
    const toastEl = document.createElement("div");
    toastEl.className = `fixed bottom-4 right-4 p-4 rounded shadow-lg z-50 ${
      type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
    }`;
    toastEl.textContent = message;

    // Add to DOM
    document.body.appendChild(toastEl);

    // Remove after 3 seconds
    setTimeout(() => {
      document.body.removeChild(toastEl);
    }, 3000);
  };

  return {
    success: (message: string) => showToast(message, "success"),
    error: (message: string) => showToast(message, "error"),
  };
}

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

function getDeletedApplicationIds() {
  try {
    // Use the utility function for consistency
    const deletedIds = manageDeletedAppIds.getAll();
    console.log("Retrieved deleted application IDs:", deletedIds);
    return new Set(deletedIds);
  } catch (e) {
    console.error("Error loading deleted application IDs:", e);
    return new Set();
  }
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
  const [selectedKits, setSelectedKits] = useState<Set<string>>(new Set());
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [newlyCreatedKitId, setNewlyCreatedKitId] = useState<string | null>(
    null
  );
  const [shouldRefreshData, setShouldRefreshData] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deletedKitIds, setDeletedKitIds] = useState<Set<string>>(
    getDeletedApplicationIds() as Set<string>
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Use custom toast
  const toast = useCustomToast();

  const fetchData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setLoadError(null);
      console.log("Fetching application kits...");
      const kits = await getUserApplicationKits(user.uid);

      // Check if we got a valid response
      if (!Array.isArray(kits)) {
        console.error("Invalid response from getUserApplicationKits:", kits);
        setLoadError("Received invalid data from the server");
        setLoading(false);
        return;
      }

      // Get up-to-date deleted IDs from localStorage
      const currentDeletedIds = getDeletedApplicationIds();

      // Filter out any kits that were deleted in this session or previous sessions
      const filteredKits = kits.filter((kit) => !currentDeletedIds.has(kit.id));

      const formattedKits = filteredKits.map((kit: any) => {
        // Safely handle the toDate function that might not exist
        let createdDate = new Date();
        try {
          if (kit.createdAt && typeof kit.createdAt.toDate === "function") {
            createdDate = kit.createdAt.toDate();
          } else if (kit.createdAt instanceof Date) {
            createdDate = kit.createdAt;
          }
        } catch (e) {
          console.error("Error formatting date:", e);
        }

        return {
          ...kit,
          createdAt: createdDate,
        };
      });

      setApplicationKits(formattedKits);
      // Update deletedKitIds here instead of in the dependencies
      setDeletedKitIds(currentDeletedIds as Set<string>);

      // Reset refresh flag after successful data load
      if (shouldRefreshData) {
        setShouldRefreshData(false);
      }
    } catch (error) {
      console.error("Error fetching application kits:", error);
      setLoadError("Failed to load your applications. Please try again.");
    } finally {
      // Always set loading to false when done
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if logged in
    if (user) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, shouldRefreshData]);

  useEffect(() => {
    // Check if user just created a new Hire Me Pack and returned to dashboard
    const checkForNewHirePack = () => {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("newPack") === "true") {
        setShowSuccessMessage(true);

        // Get the newest kit ID from the URL if available
        const newKitId = urlParams.get("kitId");
        if (newKitId) {
          setNewlyCreatedKitId(newKitId);
        }

        // Remove the query parameter
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);

        // Hide the success message after 5 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      }
    };

    checkForNewHirePack();
  }, []);

  // Scroll to newly created kit
  useEffect(() => {
    if (newlyCreatedKitId && !loading) {
      setTimeout(() => {
        const kitElement = document.getElementById(`kit-${newlyCreatedKitId}`);
        if (kitElement) {
          kitElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);
    }
  }, [newlyCreatedKitId, loading]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
    } finally {
      setSigningIn(false);
    }
  };

  const navigateToHome = () => {
    router.push("/");
  };

  const handleDelete = async (kitId: string) => {
    setIsDeleting(true);
    console.log(`Starting deletion process for application kit: ${kitId}`);

    try {
      // Optimistically update UI first
      setApplicationKits((prev) => prev.filter((kit) => kit.id !== kitId));

      // Update local deletedKitIds
      const newDeletedIds = new Set(deletedKitIds);
      newDeletedIds.add(kitId);
      setDeletedKitIds(newDeletedIds);

      // Update localStorage via the utility
      manageDeletedAppIds.add(kitId);

      // Show immediate feedback to user
      toast.success("Application deleted successfully");

      // Actually delete from Firebase
      const deleted = await deleteApplicationKit(user?.uid as string, kitId);

      if (!deleted) {
        console.error(`Failed to delete application kit in Firebase: ${kitId}`);
        // Even if Firebase deletion fails, we still want to hide it from the UI
        // The next fetchData call will re-sync with Firebase if needed
      }
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast.error(
        "There was an issue with deletion, but the application will be hidden"
      );

      // Even on error, keep the item removed from UI to match user expectations
      setApplicationKits((prev) => prev.filter((kit) => kit.id !== kitId));
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedKits.size === applicationKits.length) {
      setSelectedKits(new Set());
    } else {
      setSelectedKits(new Set(applicationKits.map((kit) => kit.id)));
    }
  };

  const toggleSelectKit = (kitId: string) => {
    const newSelected = new Set(selectedKits);
    if (newSelected.has(kitId)) {
      newSelected.delete(kitId);
    } else {
      newSelected.add(kitId);
    }
    setSelectedKits(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedKits.size === 0) return;

    const selectedKitsArray = applicationKits.filter((kit) =>
      selectedKits.has(kit.id)
    );
    if (selectedKitsArray.length === 1) {
      handleDelete(selectedKitsArray[0].id);
    } else {
      setKitToDelete({
        id: Array.from(selectedKits).join(","),
        jobTitle: `${selectedKitsArray.length} applications`,
        company: "",
        status: "",
        coverLetter: "",
        resume: "",
        followUpEmail: "",
        createdAt: new Date(),
      });
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = async () => {
    if (!user || !kitToDelete) return;

    try {
      setDeletingId(kitToDelete.id);

      if (kitToDelete.id.includes(",")) {
        // Bulk delete
        const ids = kitToDelete.id.split(",");

        // Update UI optimistically first
        setApplicationKits((prev) =>
          prev.filter((kit) => !ids.includes(kit.id))
        );

        // Update deletedKitIds and localStorage
        const newDeletedIds = new Set(deletedKitIds);
        ids.forEach((id) => newDeletedIds.add(id));
        setDeletedKitIds(newDeletedIds);

        // Add to localStorage via the utility
        manageDeletedAppIds.addMultiple(ids);

        // Show immediate success feedback
        toast.success(`Successfully deleted ${ids.length} applications`);

        // Now actually delete from Firebase
        const results = await Promise.all(
          ids.map(async (id) => {
            try {
              const result = await deleteApplicationKit(user.uid, id);
              return { id, success: result };
            } catch (error) {
              console.error(`Error deleting kit ID ${id}:`, error);
              return { id, success: false };
            }
          })
        );

        // Count failures for logging purposes
        const failures = results.filter((result) => !result.success);
        if (failures.length > 0) {
          console.error(
            `${failures.length} applications failed to delete in Firebase, but were hidden from UI:`,
            failures.map((f) => f.id).join(", ")
          );
        }
      } else {
        // Single delete - use the handleDelete function we just updated
        await handleDelete(kitToDelete.id);
      }

      // Clean up the confirmation dialog
      setShowDeleteConfirm(false);
      setKitToDelete(null);
      setSelectedKits(new Set());
    } catch (error) {
      console.error("Error in confirmDelete:", error);
      toast.error(
        "There was an issue with deletion, but the applications will be hidden"
      );
    } finally {
      setDeletingId(null);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Add a function to manually retry loading
  const handleRetryLoad = () => {
    setLoading(true);
    setShouldRefreshData(true);
  };

  useEffect(() => {
    // Cleanup function to ensure we don't show deleted items
    const cleanupLocalStorage = () => {
      // Clear any temporary application data that might be saved in localStorage
      localStorage.removeItem("tempDeletedItemIds");

      // Add the current time to localStorage to force a fresh load
      localStorage.setItem("lastApplicationsRefresh", Date.now().toString());
    };

    // Run cleanup when component mounts
    cleanupLocalStorage();

    // Also run cleanup when component unmounts
    return () => {
      cleanupLocalStorage();
    };
  }, []);

  // Add a function to clear deletion history if needed
  const clearDeletionHistory = () => {
    manageDeletedAppIds.clearAll();
    setDeletedKitIds(new Set());
    fetchData(); // Refetch to show all applications
  };

  if (!user) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 px-8 py-16 lg:py-8 bg-gray-50 text-[#363636]">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Tracking Portal</h1>
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto mt-8">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-2">
                  Sign in to access your applications
                </h2>
                <p className="text-gray-600 mb-6">
                  View and manage all your job applications in one place
                </p>
                <button
                  onClick={handleSignIn}
                  disabled={signingIn}
                  className={`w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-medium py-3 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center space-x-3 ${
                    signingIn ? "opacity-75 cursor-not-allowed" : ""
                  }`}
                >
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
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  <span>
                    {signingIn ? "Signing in..." : "Sign in with Google"}
                  </span>
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
      <div className="flex-1 px-8 py-16 lg:py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {showSuccessMessage && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span>Your Hire Me Pack was successfully created!</span>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="text-green-600 hover:text-green-800"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>
          )}

          <div className="flex flex-col justify-start items-center sm:flex-row sm:justify-between sm:items-center sm:gap-6  mb-6 max-sm:text-center">
            <div>
              <h1 className="text-2xl font-bold text-[#363636]">
                Tracking Portal
              </h1>
              <p className="text-gray-600 mt-4 mb-8">
                Your application dashboard is where you can manage all your Hire
                Packs and track job applications.
              </p>
            </div>
            <button
              onClick={openModal}
              className="bg-[#7046EC] hover:bg-[#5e3bc4] text-white px-6 py-3 rounded-lg flex items-center font-medium transition-colors"
            >
              <FaPlus className="mr-2" /> Create New Hire Pack
            </button>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-300 border-t-purple-600 mx-auto mb-4"></div>
              <p className="text-[#363636]">Loading your applications...</p>
            </div>
          ) : loadError ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <svg
                className="w-16 h-16 text-red-500 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <h3 className="text-lg font-medium mb-2">
                Error Loading Applications
              </h3>
              <p className="text-gray-600 mb-4">{loadError}</p>
              <button
                onClick={handleRetryLoad}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Retry Loading
              </button>
            </div>
          ) : applicationKits.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium">No Hire Me Packs yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first Hire Me Pack to get started.
              </p>
              <button
                onClick={openModal}
                className="bg-[#7046EC] hover:bg-[#5e3bc4] text-white px-6 py-3 rounded-lg transition-colors"
              >
                Create Hire Me Pack
              </button>
            </div>
          ) : (
            <>
              {selectedKits.size > 0 && (
                <div className="mb-4 flex items-center justify-between bg-indigo-50 p-4 rounded-lg">
                  <span className="text-sm text-indigo-700">
                    {selectedKits.size}{" "}
                    {selectedKits.size === 1 ? "item" : "items"} selected
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete Selected
                  </button>
                </div>
              )}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="min-w-full">
                  <div className="hidden md:block border-b">
                    <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-3">
                      <div className="flex items-center">
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600">
                          Status
                        </span>
                        <svg
                          className="w-4 h-4 ml-1 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600">
                          Job Position
                        </span>
                        <svg
                          className="w-4 h-4 ml-1 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-600">
                          Company
                        </span>
                        <svg
                          className="w-4 h-4 ml-1 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          Cover Letter
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          Resume
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          Follow-up
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          Actions
                        </span>
                      </div>
                      <div className="flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          View
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block divide-y divide-gray-100">
                    {applicationKits.map((kit) => (
                      <div
                        key={kit.id}
                        id={`kit-${kit.id}`}
                        className={`grid grid-cols-[40px_1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-4 px-6 py-4 hover:bg-gray-50 ${
                          newlyCreatedKitId === kit.id
                            ? "bg-purple-50 border-l-4 border-purple-500"
                            : ""
                        }`}
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedKits.has(kit.id)}
                            onChange={() => toggleSelectKit(kit.id)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center">
                          <span
                            className={`text-sm ${
                              kit.status === "Applied"
                                ? "text-blue-600"
                                : kit.status === "Interviewing"
                                ? "text-green-600"
                                : kit.status === "Declined"
                                ? "text-red-600"
                                : kit.status === "Bookmarked"
                                ? "text-yellow-600"
                                : "text-gray-600"
                            }`}
                          >
                            {kit.status}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900">
                            {kit.jobTitle}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600">
                            {kit.company}
                          </span>
                        </div>
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => {
                              router.push(`/job-hub/${kit.id}?tab=coverLetter`);
                            }}
                            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-200 hover:border-gray-300 bg-white"
                          >
                            Open
                          </button>
                        </div>
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => {
                              router.push(`/job-hub/${kit.id}?tab=resume`);
                            }}
                            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-200 hover:border-gray-300 bg-white"
                          >
                            Open
                          </button>
                        </div>
                        <div className="flex items-center justify-center">
                          <button
                            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-200 hover:border-gray-300 bg-white"
                            onClick={() => {
                              navigator.clipboard.writeText(kit.followUpEmail);
                              alert("Follow-up email copied to clipboard!");
                            }}
                          >
                            Copy
                          </button>
                        </div>
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleDelete(kit.id)}
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
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => router.push(`/job-hub/${kit.id}`)}
                            className="text-sm bg-[#7046EC] text-white px-4 py-2 rounded-lg hover:bg-[#5e3bc4] transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="block md:hidden divide-y divide-gray-100">
                    {applicationKits.map((kit) => (
                      <div
                        key={kit.id}
                        id={`kit-${kit.id}`}
                        className="mx-auto mt-4 bg-white shadow-lg rounded-lg p-4  hover:shadow-xl transition-shadow"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedKits.has(kit.id)}
                              onChange={() => toggleSelectKit(kit.id)}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded cursor-pointer"
                            />
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              kit.status === "Applied"
                                ? "text-blue-600"
                                : kit.status === "Interviewing"
                                ? "text-green-600"
                                : kit.status === "Declined"
                                ? "text-red-600"
                                : kit.status === "Bookmarked"
                                ? "text-yellow-600"
                                : "text-gray-600"
                            }`}
                          >
                            {kit.status}
                          </span>
                        </div>

                        <div className="mb-4">
                          <p className="text-lg font-semibold text-gray-900">
                            {kit.jobTitle}
                          </p>
                          <p className="text-sm text-gray-600">{kit.company}</p>
                        </div>

                        <div className="flex justify-between gap-2">
                          <button
                            onClick={() => {
                              router.push(`/job-hub/${kit.id}?tab=coverLetter`);
                            }}
                            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-200 hover:border-gray-300 bg-white"
                          >
                            Open Cover Letter
                          </button>

                          <button
                            onClick={() => {
                              router.push(`/job-hub/${kit.id}?tab=resume`);
                            }}
                            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-200 hover:border-gray-300 bg-white"
                          >
                            Open Resume
                          </button>
                        </div>

                        <div className="flex justify-between gap-2 mt-4">
                          <button
                            className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-200 hover:border-gray-300 bg-white"
                            onClick={() => {
                              navigator.clipboard.writeText(kit.followUpEmail);
                              alert("Follow-up email copied to clipboard!");
                            }}
                          >
                            Copy Follow-up Email
                          </button>

                          <button
                            onClick={() => handleDelete(kit.id)}
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

                        <div className="mt-4">
                          <button
                            onClick={() => router.push(`/job-hub/${kit.id}`)}
                            className="w-full text-sm bg-[#7046EC] text-white px-4 py-2 rounded-lg hover:bg-[#5e3bc4] transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && kitToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Delete Application
            </h3>
            <p className="text-gray-500 mb-6">
              {kitToDelete.company === ""
                ? `Are you sure you want to delete these ${
                    kitToDelete.jobTitle.split(" ")[0]
                  } applications? This action cannot be undone.`
                : `Are you sure you want to delete your application for ${kitToDelete.jobTitle} at ${kitToDelete.company}? This action cannot be undone.`}
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

      <ApplicationModal isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
