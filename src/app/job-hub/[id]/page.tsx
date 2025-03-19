"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getApplicationKit, deleteApplicationKit, updateApplicationKit } from "@/lib/firebase/applicationKitUtils";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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

export default function ApplicationKitDetail() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [kit, setKit] = useState<ApplicationKit | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"coverLetter" | "resume" | "followUp">("coverLetter");
  const [status, setStatus] = useState("");

  const id = params.id as string;

  useEffect(() => {
    // Set the active tab based on URL parameter
    const tab = searchParams.get('tab');
    if (tab === 'resume') {
      setActiveTab('resume');
    } else if (tab === 'followUp') {
      setActiveTab('followUp');
    } else {
      setActiveTab('coverLetter');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchApplicationKit = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const kitData = await getApplicationKit(user.uid, id);
        // Convert Firestore timestamp to Date object
        const formattedKit = {
          ...kitData,
          createdAt: kitData.createdAt?.toDate() || new Date(),
        };
        setKit(formattedKit);
        setStatus(formattedKit.status || "Interested");
        setLoading(false);
      } catch (error) {
        console.error("Error fetching application kit:", error);
        setLoading(false);
      }
    };

    fetchApplicationKit();
  }, [user, id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!user || !kit) return;
    
    try {
      setStatus(newStatus);
      await updateApplicationKit(user.uid, id, { status: newStatus });
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert if there's an error
      setStatus(kit.status);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    
    if (window.confirm("Are you sure you want to delete this Hire Me Pack?")) {
      try {
        await deleteApplicationKit(user.uid, id);
        router.push("/job-hub");
      } catch (error) {
        console.error("Error deleting application kit:", error);
      }
    }
  };

  const handleTabChange = (tab: "coverLetter" | "resume" | "followUp") => {
    setActiveTab(tab);
    // Update URL without full navigation
    router.push(`/job-hub/${id}?tab=${tab}`, { scroll: false });
  };

  if (!user) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Hire Me Pack</h1>
            <p>Please sign in to view this Hire Me Pack.</p>
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
          {loading ? (
            <div className="text-center py-10">
              <p>Loading Hire Me Pack...</p>
            </div>
          ) : !kit ? (
            <div className="text-center py-10">
              <h1 className="text-2xl font-bold mb-4">Hire Me Pack Not Found</h1>
              <p>This Hire Me Pack may have been deleted or does not exist.</p>
              <button
                onClick={() => router.push("/job-hub")}
                className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
              >
                Return to Job Hub
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold">{kit.jobTitle}</h1>
                  <p className="text-gray-600">{kit.company}</p>
                </div>
                <div className="flex items-center gap-4">
                  <select
                    value={status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 bg-white text-indigo-600 font-medium"
                  >
                    <option value="Interested">Interested</option>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
                <div className="border-b border-gray-200">
                  <nav className="flex">
                    <button
                      onClick={() => handleTabChange("coverLetter")}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === "coverLetter"
                          ? "border-b-2 border-indigo-500 text-indigo-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Cover Letter
                    </button>
                    <button
                      onClick={() => handleTabChange("resume")}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === "resume"
                          ? "border-b-2 border-indigo-500 text-indigo-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => handleTabChange("followUp")}
                      className={`px-6 py-4 text-sm font-medium ${
                        activeTab === "followUp"
                          ? "border-b-2 border-indigo-500 text-indigo-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      Follow-up Email
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === "coverLetter" && (
                    <div>
                      <div className="flex justify-between mb-4">
                        <h3 className="text-lg font-medium">Cover Letter</h3>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(kit.coverLetter);
                            alert("Copied to clipboard!");
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          Copy to clipboard
                        </button>
                      </div>
                      <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap font-serif">
                        {kit.coverLetter}
                      </div>
                    </div>
                  )}

                  {activeTab === "resume" && (
                    <div>
                      <div className="flex justify-between mb-4">
                        <h3 className="text-lg font-medium">Resume</h3>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(kit.resume);
                            alert("Copied to clipboard!");
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          Copy to clipboard
                        </button>
                      </div>
                      <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap font-serif">
                        {kit.resume}
                      </div>
                    </div>
                  )}

                  {activeTab === "followUp" && (
                    <div>
                      <div className="flex justify-between mb-4">
                        <h3 className="text-lg font-medium">Follow-up Email</h3>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(kit.followUpEmail);
                            alert("Copied to clipboard!");
                          }}
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          Copy to clipboard
                        </button>
                      </div>
                      <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap font-serif">
                        {kit.followUpEmail}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 