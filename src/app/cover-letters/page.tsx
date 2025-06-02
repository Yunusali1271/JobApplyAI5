"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getUserApplicationKits, manageDeletedAppIds } from "@/lib/firebase/applicationKitUtils";
import { getUserSubscriptionStatus } from "@/lib/firebase/firebaseUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPlus, FaDownload, FaEdit, FaEllipsisV } from "react-icons/fa";
import { AiFillCloseCircle } from "react-icons/ai";
import Sidebar from "@/app/components/Sidebar";

interface CoverLetterItem {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  jobTitle: string;
  company: string;
}

export default function CoverLettersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [coverLetters, setCoverLetters] = useState<CoverLetterItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add state to track if we need to refresh the data
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Subscription status states
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    const fetchCoverLetters = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Get application kits which contain cover letters
        const kits = await getUserApplicationKits(user.uid);
        
        // Get the list of deleted application IDs
        const deletedIds = manageDeletedAppIds.getAll();
        console.log("Filtering cover letters with deleted IDs:", deletedIds);
        
        // Filter out kits without cover letter content, deleted kits, and map to cover letter format
        const coverLetterList = kits
          .filter((kit: any) => kit.coverLetter && kit.coverLetter.trim() !== '')
          .filter((kit: any) => !deletedIds.includes(kit.id)) // Filter out deleted applications
          .map((kit: any) => {
            // Safely handle date conversion
            let createdDate = new Date();
            try {
              if (kit.createdAt && typeof kit.createdAt.toDate === 'function') {
                createdDate = kit.createdAt.toDate();
              } else if (kit.createdAt instanceof Date) {
                createdDate = kit.createdAt;
              }
            } catch (e) {
              console.error("Error formatting date:", e);
            }
            
            return {
              id: kit.id,
              title: `${kit.jobTitle} - ${kit.company}`,
              content: kit.coverLetter,
              createdAt: createdDate,
              jobTitle: kit.jobTitle,
              company: kit.company
            };
          });
        
        setCoverLetters(coverLetterList);
        
        // Reset the refresh flag
        if (shouldRefresh) {
          setShouldRefresh(false);
        }
      } catch (error) {
        console.error("Error fetching cover letters from application kits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverLetters();
    
    // Set up a listener for localStorage changes to detect when applications are deleted
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'deletedApplicationIds') {
        console.log("Detected deletedApplicationIds change, refreshing cover letters");
        setShouldRefresh(true);
      }
    };
    
    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, shouldRefresh]);

  // Check subscription status
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (user) {
        try {
          const { hasSubscription, subscription } = await getUserSubscriptionStatus(user.uid);
          setHasActiveSubscription(hasSubscription && subscription?.status === 'active');
        } catch (error) {
          console.error("Error checking subscription status:", error);
          setHasActiveSubscription(false);
        }
      } else {
        setHasActiveSubscription(false);
      }
    };

    checkSubscriptionStatus();
  }, [user]);

  const handleNewCoverLetter = () => {
    router.push("/");
  };

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };
  
  const downloadAsPdf = (coverLetter: CoverLetterItem) => {
    // Check if user has active subscription
    if (!hasActiveSubscription) {
      setShowSubscriptionModal(true);
      return;
    }
    
    // In a real implementation, this would generate a PDF from the cover letter content
    alert(`Downloading ${coverLetter.title} as PDF`);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 px-8 py-16 lg:py-8 bg-gray-50">
          <div className="max-w-6xl mx-auto text-[#363636]">
            <h1 className="text-2xl font-bold mb-4">My Cover Letters</h1>
            <p className="text-gray-600">Please sign in to view your cover letters.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 px-8 py-16 lg:py-8 bg-gray-50">
        <div className="max-w-6xl mx-auto text-[#363636]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">My Cover Letters</h1>
              <p className="text-gray-600">
                View, share and edit your cover letters here.
              </p>
            </div>
            <button 
              onClick={handleNewCoverLetter}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full flex items-center"
            >
              <FaPlus className="mr-2" /> New Hire Me Pack
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <p>Loading your cover letters...</p>
            </div>
          ) : coverLetters.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium">No cover letters yet</h3>
              <p className="text-gray-500 mt-2">
                Create a Hire Me Pack with a cover letter to get started.
              </p>
              <button 
                onClick={handleNewCoverLetter}
                className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Create Hire Me Pack
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coverLetters.map((coverLetter) => (
                <div key={coverLetter.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-lg font-bold truncate">{coverLetter.jobTitle}-{coverLetter.company}</h2>
                      <div className="relative">
                        <button className="text-gray-500 hover:text-gray-700">
                          <FaEllipsisV />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{formatDate(coverLetter.createdAt)}</p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => downloadAsPdf(coverLetter)}
                        className="flex-1 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded shadow text-sm flex items-center justify-center"
                      >
                        <FaDownload className="mr-2" /> PDF
                      </button>
                      <Link
                        href={`/job-hub/${coverLetter.id}?tab=coverLetter`}
                        className="flex-1 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded shadow text-sm flex items-center justify-center"
                      >
                        <FaEdit className="mr-2" /> View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative bg-white rounded-lg w-full max-w-md p-6 text-center">
            <button 
              className="absolute top-0 right-0 bg-white rounded-full -translate-y-1/3 translate-x-1/3" 
              onClick={() => setShowSubscriptionModal(false)}
            >
              <AiFillCloseCircle size={36}/>
            </button>
            
            <div className="mb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  ></path>
                </svg>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Subscribe to Download
              </h3>
              
              <p className="text-gray-600 mb-4">
                Subscribe to download and unlock all premium features, cancel anytime
              </p>
              
              <div className="text-sm text-gray-500 mb-6">
                ✨ Unlimited downloads<br/>
                ✨ All resume templates<br/>
                ✨ Priority support<br/>
                ✨ Advanced features
              </div>
            </div>
            
            <div className="space-y-3">
              <Link
                href="/manage-subscription"
                className="block w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                onClick={() => setShowSubscriptionModal(false)}
              >
                Subscribe Now
              </Link>
              
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="block w-full text-gray-500 py-2 px-4 hover:text-gray-700 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}