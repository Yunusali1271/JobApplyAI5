"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getUserApplicationKits, manageDeletedAppIds } from "@/lib/firebase/applicationKitUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPlus, FaDownload, FaEdit, FaEllipsisV } from "react-icons/fa";
import Sidebar from "@/app/components/Sidebar";

interface ResumeItem {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  jobTitle: string;
  company: string;
}

export default function ResumesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add state to track if we need to refresh the data
  const [shouldRefresh, setShouldRefresh] = useState(false);

  useEffect(() => {
    const fetchResumes = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Get application kits which contain resumes
        const kits = await getUserApplicationKits(user.uid);
        
        // Get the list of deleted application IDs
        const deletedIds = manageDeletedAppIds.getAll();
        console.log("Filtering resumes with deleted IDs:", deletedIds);
        
        // Filter out kits without resume content, deleted kits, and map to resume format
        const resumeList = kits
          .filter((kit: any) => kit.resume && kit.resume.trim() !== '')
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
              content: kit.resume,
              createdAt: createdDate,
              jobTitle: kit.jobTitle,
              company: kit.company
            };
          });
        
        setResumes(resumeList);
        
        // Reset the refresh flag
        if (shouldRefresh) {
          setShouldRefresh(false);
        }
      } catch (error) {
        console.error("Error fetching resumes from application kits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumes();
    
    // Set up a listener for localStorage changes to detect when applications are deleted
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'deletedApplicationIds') {
        console.log("Detected deletedApplicationIds change, refreshing resumes");
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

  const handleNewResume = () => {
    router.push("/");
  };

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };
  
  const downloadAsPdf = (resume: ResumeItem) => {
    // In a real implementation, this would generate a PDF from the resume content
    alert(`Downloading ${resume.title} as PDF`);
  };

  if (!user) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 px-8 py-16 lg:py-8 bg-gray-50 text-[#363636]">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">My Resumes</h1>
            <p className="text-gray-600">Please sign in to view your resumes.</p>
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
              <h1 className="text-2xl font-bold">My Resumes</h1>
              <p className="text-gray-600">
                View, share and edit your resumes here.
              </p>
            </div>
            <button 
              onClick={handleNewResume}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full flex items-center"
            >
              <FaPlus className="mr-2" /> New Hire Me Pack
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <p>Loading your resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium">No resumes yet</h3>
              <p className="text-gray-500 mt-2">
                Create a Hire Me Pack with a resume to get started.
              </p>
              <button 
                onClick={handleNewResume}
                className="mt-4 inline-block bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
              >
                Create Hire Me Pack
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resumes.map((resume) => (
                <div key={resume.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-lg font-bold truncate">{resume.jobTitle}-{resume.company}</h2>
                      <div className="relative">
                        <button className="text-gray-500 hover:text-gray-700">
                          <FaEllipsisV />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">{formatDate(resume.createdAt)}</p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => downloadAsPdf(resume)}
                        className="flex-1 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-300 rounded shadow text-sm flex items-center justify-center"
                      >
                        <FaDownload className="mr-2" /> PDF
                      </button>
                      <Link
                        href={`/job-hub/${resume.id}?tab=resume`}
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
    </div>
  );
} 