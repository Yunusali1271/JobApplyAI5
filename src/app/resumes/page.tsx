"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getUserApplicationKits } from "@/lib/firebase/applicationKitUtils";
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

  useEffect(() => {
    const fetchResumes = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        // Get application kits which contain resumes
        const kits = await getUserApplicationKits(user.uid);
        
        // Filter out kits without resume content and map to resume format
        const resumeList = kits
          .filter((kit: any) => kit.resume && kit.resume.trim() !== '')
          .map((kit: any) => ({
            id: kit.id,
            title: `${kit.jobTitle} - ${kit.company}`,
            content: kit.resume,
            createdAt: kit.createdAt?.toDate() || new Date(),
            jobTitle: kit.jobTitle,
            company: kit.company
          }));
        
        setResumes(resumeList);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching resumes from application kits:", error);
        setLoading(false);
      }
    };

    fetchResumes();
  }, [user]);

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
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">My Resumes</h1>
            <p>Please sign in to view your resumes.</p>
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