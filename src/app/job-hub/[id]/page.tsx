"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getApplicationKit, deleteApplicationKit, updateApplicationKit } from "@/lib/firebase/applicationKitUtils";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import { FaArrowLeft } from "react-icons/fa";
import TemplateOne from "@/app/components/template/TemplateOne";
import TemplateTwo from "@/app/components/template/TemplateTwo";
import TemplateThree from "@/app/components/template/TemplateThree";

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
  const [activeTemplate, setActiveTemplate] = useState<1 | 2 | 3>(2);
  const [resumeData, setResumeData] = useState<any>(null);
  const resumeRef = useRef<HTMLDivElement>(null);

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
        const kitData:any = await getApplicationKit(user.uid, id);
        // Convert Firestore timestamp to Date object
        const formattedKit = {
          ...kitData,
          createdAt: kitData.createdAt?.toDate() || new Date(),
        };
        setKit(formattedKit);
        setStatus(formattedKit.status || "Interested");
        
        // Parse the resume JSON if available
        if (formattedKit.resume) {
          try {
            // First try to parse the resume as JSON
            const parsedResume = JSON.parse(formattedKit.resume);
            
            // Validate that it has the expected structure
            if (parsedResume && 
                typeof parsedResume === 'object' && 
                (parsedResume.personalInformation || parsedResume.summary)) {
              console.log("Successfully parsed resume data:", parsedResume);
              setResumeData(parsedResume);
            } else {
              // If parsed but doesn't have expected structure, use a default template
              console.warn("Resume parsed as JSON but lacks expected structure:", parsedResume);
              setResumeData(createDefaultResumeData(formattedKit));
            }
          } catch (error) {
            // If JSON parsing fails, create a default resume structure
            console.error("Error parsing resume JSON:", error);
            setResumeData(createDefaultResumeData(formattedKit));
          }
        } else {
          setResumeData(null);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching application kit:", error);
        setLoading(false);
      }
    };

    fetchApplicationKit();
  }, [user, id]);

  // Function to create a default resume structure if parsing fails
  const createDefaultResumeData = (kit: ApplicationKit) => {
    // Extract name and contact info if possible from the raw resume
    let name = "Applicant";
    let email = "";
    let phone = "";
    
    if (kit.resume) {
      // Try to extract basic info from text-based resume
      const lines = kit.resume.split('\n').map(line => line.trim());
      // First non-empty line is often the name
      for (const line of lines) {
        if (line) {
          name = line;
          break;
        }
      }
      
      // Look for email pattern
      const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
      const emailMatch = kit.resume.match(emailRegex);
      if (emailMatch) {
        email = emailMatch[0];
      }
      
      // Look for phone pattern (simple version)
      const phoneRegex = /\b\+?[\d\s\(\)-]{10,}\b/;
      const phoneMatch = kit.resume.match(phoneRegex);
      if (phoneMatch) {
        phone = phoneMatch[0];
      }
    }

    // Return a basic structured resume that works with the templates
    return {
      summary: "Professional with experience in " + (kit.jobTitle || "this field"),
      personalInformation: {
        name: name,
        email: email || "email@example.com",
        phone: phone || "+1234567890",
        address: "Professional Location",
        linkedin: "linkedin.com/in/profile"
      },
      professionalExperience: [
        {
          company: kit.company || "Company",
          position: kit.jobTitle || "Position",
          location: "Location",
          duration: "Recent - Present",
          responsibilities: [
            {
              category: "Key Responsibilities",
              details: ["Successfully completed projects and tasks as assigned"]
            }
          ]
        }
      ],
      education: {
        institution: "University",
        degree: "Degree",
        location: "Location",
        duration: "2018-2022",
        concentrations: ["Major"],
        achievements: ["Graduated with honors"]
      },
      skillsAndInterests: {
        interests: ["Professional Development"],
        languages: {
          native: ["English"],
          fluent: []
        },
        technical: ["Microsoft Office", "Communication", "Problem Solving"]
      }
    };
  };

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

  // Add PDF download function
  const handleDownloadResumePdf = async () => {
    if (!resumeRef.current) return;

    try {
      // Add a loading state for PDF generation
      const loadingToast = document.createElement("div");
      loadingToast.className =
        "fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50";
      loadingToast.innerText = "Generating Resume PDF...";
      document.body.appendChild(loadingToast);

      // Dynamically import html2pdf only on the client side
      const html2pdf = (await import("html2pdf.js")).default;

      const element = resumeRef.current;
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${resumeData?.personalInformation?.name || 'resume'}_template${activeTemplate}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { 
          unit: "mm", 
          format: "a4", 
          orientation: "portrait",
          compress: true 
        },
      };

      await html2pdf().set(opt).from(element).save();

      // Remove the loading toast after PDF generation is complete
      document.body.removeChild(loadingToast);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    }
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
                  <div className="flex items-center gap-4 mb-1">
                    <button
                      onClick={() => router.push("/job-hub")}
                      className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Back to dashboard"
                    >
                      <FaArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold">{kit.jobTitle}</h1>
                  </div>
                  <p className="text-gray-600 ml-9">{kit.company}</p>
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
                        <div className="flex space-x-3">
                          <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => setActiveTemplate(1)}
                              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                activeTemplate === 1
                                  ? "bg-white shadow-sm text-indigo-600"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              Template 1
                            </button>
                            <button
                              onClick={() => setActiveTemplate(2)}
                              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                activeTemplate === 2
                                  ? "bg-white shadow-sm text-indigo-600"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              Template 2
                            </button>
                            <button
                              onClick={() => setActiveTemplate(3)}
                              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                activeTemplate === 3
                                  ? "bg-white shadow-sm text-indigo-600"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              Template 3
                            </button>
                          </div>
                          <button
                            onClick={handleDownloadResumePdf}
                            className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                              ></path>
                            </svg>
                            Download PDF
                          </button>
                        </div>
                      </div>
                      <div className="bg-white border rounded-lg p-4 overflow-auto" style={{ height: "700px" }}>
                        {resumeData ? (
                          <div className="bg-white w-full h-full" ref={resumeRef}>
                            {activeTemplate === 1 && (
                              <TemplateOne result={resumeData} />
                            )}
                            {activeTemplate === 2 && (
                              <TemplateTwo result={resumeData} />
                            )}
                            {activeTemplate === 3 && (
                              <TemplateThree result={resumeData} />
                            )}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-gray-400">
                              {kit.resume ? "Unable to parse resume data" : "No resume data available"}
                            </p>
                          </div>
                        )}
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