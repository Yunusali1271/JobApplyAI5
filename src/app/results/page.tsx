/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/hooks/useAuth";
import { saveApplicationKit } from "@/lib/firebase/applicationKitUtils";
import TemplateOne from "../components/template/TemplateOne";
import TemplateTwo from "../components/template/TemplateTwo";
import { FaArrowLeft } from "react-icons/fa";
import ResumeEditForm from "../components/ResumeeditForm";

type PageProps = {
  params: {
    id: string; // or number if you're sure
  };
};
export default function ResultsPage({ params }: PageProps) {
  const { id: resultId } = params;

  const { user } = useAuth();
  const [result, setResult] = useState<string | null>(null);
  const [followUpEmail, setFollowUpEmail] = useState<string | null>(null);
  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [savingToFirebase, setSavingToFirebase] = useState(false);
  const [savedToFirebase, setSavedToFirebase] = useState(false);
  const [cameFromJobHub, setCameFromJobHub] = useState(false);
  const coverLetterRef = useRef<HTMLDivElement>(null);
  const followUpEmailRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const resumeTwoRef = useRef<HTMLDivElement>(null);
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [editedResume, setEditedResume] = useState<string | null>(null);
  const [isEditingResumeTwo, setIsEditingResumeTwo] = useState(false);
  const [isFirstResumeVisible, setIsFirstResumeVisible] = useState(true);
  const [isEditingCoverLetter, setIsEditingCoverLetter] = useState(false);
  const [editedCoverLetter, setEditedCoverLetter] = useState<string | null>(null);

  const [editedResumeTwo, setEditedResumeTwo] = useState<string | null>(null);

  const [cvResume, setCvResume] = useState<null>(null);

  // Default structured resume template for editing form
  const defaultStructuredResume = {
    "summary": "A highly skilled Technical Application Engineer with a strong background in mechanical engineering.",
    "personalInformation": {
      "name": "YUNUS ALI",
      "phone": "+07429299862",
      "linkedin": "linkedin.com/in/yunusali",
      "address": "London, UK",
      "email": "youremail123@gmail.com"
    },
    "professionalExperience": [
      {
        "company": "Nosel",
        "position": "Technical Applications Engineer",
        "location": "London, UK",
        "duration": "2023-07-01 - Present",
        "responsibilities": [
          {
            "category": "Technical Support and Solutions",
            "details": [
              "Collaborate closely with customers and internal teams",
              "Offer strategically engineered solutions leveraging gained modes and saving frequency (Decoy FVDIs) with encoders, optimizing both technically and financially",
              "Provide valuable post-sales support, specializing in commissioning and root cause analysis"
            ]
          },
          {
            "category": "Troubleshooting and Development",
            "details": [
              "Collaborate with customers to resolve Technical Support incidents related to both operational and configuration issues",
              "Work with development and engineering teams to identify issues and provide recommendations/solutions for new and existing systems",
              "Position involves extensive travel for installation and testing issues remotely or on-site where necessary"
            ]
          }
        ]
      }
    ],
    "education": {
      "institution": "University of Engineering",
      "degree": "Bachelor of Science in Mechanical Engineering",
      "location": "London, UK",
      "duration": "2018-2022",
      "concentrations": ["Mechanical Design", "Fluid Dynamics"],
      "minor": "Business Administration",
      "gpa": "3.8",
      "achievements": [
        "Dean's List for Academic Excellence",
        "Senior Design Project Award for Innovative Solutions"
      ]
    },
    "skillsAndInterests": {
      "interests": ["Engineering", "Problem Solving", "Innovation", "Automation"],
      "languages": {
        "native": ["English"],
        "fluent": ["Arabic"]
      },
      "technical": ["CAD/CAM Software", "Engineering Analysis Tools", "Project Management", "Technical Documentation"]
    }
  };

  // Default resume template for fallback
  const defaultResumeTemplate = `YUNUS ALI
youremail123@gmail.com | +07429299862

SUMMARY
Yunus Ali is a highly skilled Technical Application Engineer with a strong background in mechanical engineering. He has extensive experience in providing strategically engineered solutions, technical support, and post-sales services. Yunus is proficient in various engineering software and has a proven track record in project management.

EXPERIENCE
Technical Applications Engineer | Nosel | 2023-07-01 - Present
- Collaborate closely with customers and internal teams
- Offer strategically engineered solutions leveraging gained modes and saving frequency (Decoy FVDIs) with encoders, optimizing both technically and financially
- Provide valuable post-sales support, specializing in commissioning and root cause analysis
- Collaborate with customers to resolve Technical Support incidents related to both operational and configuration issues
- Work with development and engineering teams to identify issues and provide recommendations / solutions for new and existing systems
- Position involves extensive travel for installation and testing issues remotely or on-site where necessary`;

  const router = useRouter();
  // const searchParams = useSearchParams();
  // const resultId = searchParams.get('id');

  // Check if user came from job-hub
  useEffect(() => {
    const referrer = document.referrer;
    if (referrer && referrer.includes('job-hub')) {
      setCameFromJobHub(true);
    }
  }, []);

  useEffect(() => {
    const storedResume = localStorage.getItem("resume");
    setCvResume(storedResume && JSON.parse(storedResume));
  }, []);

  // Keep both template data in sync when cvResume changes
  useEffect(() => {
    if (cvResume) {
      try {
        const resumeString = JSON.stringify(cvResume);
        setEditedResume(resumeString);
        setEditedResumeTwo(resumeString);
      } catch (e) {
        console.error("Error syncing resume data:", e);
      }
    }
  }, [cvResume]);

  const handleSwitchResume = () => {
    // If currently editing, apply those changes before switching templates
    if (isEditingResume) {
      handleResumeEdit();
    } else if (isEditingResumeTwo) {
      handleResumeTwoEdit();
    }
    
    // Switch the visible template
    setIsFirstResumeVisible(!isFirstResumeVisible);
  };

  useEffect(() => {
    // Try to load data from localStorage
    const loadData = () => {
      const storedResult = localStorage.getItem("cvAnalysisResult");
      const storedFollowUpEmail = localStorage.getItem("followUpEmail");
      const storedResume = localStorage.getItem("resume");
      const storedJobTitle = localStorage.getItem("jobTitle");
      const storedCompany = localStorage.getItem("company");

      if (storedResult) {
        setResult(storedResult);
        if (storedFollowUpEmail) {
          setFollowUpEmail(storedFollowUpEmail);
        }
        if (storedResume) {
          try {
            // Try to parse as JSON (for structured resume data)
            const resumeData = JSON.parse(storedResume);
            setResume(storedResume);
            setCvResume(resumeData);
          } catch (e) {
            // If not valid JSON, just use as string
            setResume(storedResume);
          }
        }
        if (storedJobTitle) {
          setJobTitle(storedJobTitle);
        }
        if (storedCompany) {
          setCompany(storedCompany);
        }
        setLoading(false);
        return true;
      }
      return false;
    };

    // Initial loading state
    setLoading(true); 
    setError(null);

    // First attempt to load data
    if (!loadData()) {
      // If no data found, retry several times with a delay
      let retryCount = 0;
      const maxRetries = 5;
      
      const retryInterval = setInterval(() => {
        retryCount++;
        console.log(`Retrying data load attempt ${retryCount}...`);
        
        if (loadData()) {
          // Data found, clear the interval
          clearInterval(retryInterval);
        } else if (retryCount >= maxRetries) {
          // Max retries reached, show error and stop trying
          clearInterval(retryInterval);
          setError("Result not found. Please try generating a new cover letter.");
          setLoading(false);
        }
      }, 800); // Retry every 800ms
      
      // Clean up the interval if component unmounts
      return () => clearInterval(retryInterval);
    }

    // Cleanup function for normal case
    return () => {
      setResult(null);
      setFollowUpEmail(null);
      setResume(null);
      setJobTitle("");
      setCompany("");
      setLoading(true);
      setError(null);
    };
  }, [resultId]);

  // Save to Firebase when mounted if user is logged in
  useEffect(() => {
    const saveToFirebase = async () => {
      if (!user || !result || savedToFirebase || savingToFirebase) {
        return;
      }
      
      try {
        console.log("Saving to Firebase...");
        setSavingToFirebase(true);
        
        const saveData = {
          jobTitle: jobTitle || "Job Application",
          company: company || "Company",
          status: "Interested",
          coverLetter: result,
          resume: resume || "",
          followUpEmail: followUpEmail || "",
          original: {
            cv: localStorage.getItem("cv") || "",
            jobDescription: localStorage.getItem("jobDescription") || "",
            formality: localStorage.getItem("formality") || "neutral",
          },
        };
        
        // Add some retry logic
        let retries = 0;
        const maxRetries = 3;
        let success = false;
        
        while (!success && retries < maxRetries) {
          try {
            await saveApplicationKit(user.uid, saveData);
            success = true;
          } catch (error) {
            retries++;
            console.error(`Error saving to Firebase (attempt ${retries}):`, error);
            
            if (retries >= maxRetries) {
              throw error;
            }
            
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
        setSavedToFirebase(true);
        console.log("Successfully saved to Firebase");
      } catch (error) {
        console.error("Final error saving to Firebase:", error);
      } finally {
        setSavingToFirebase(false);
      }
    };

    // Call the function
    saveToFirebase();
  }, [
    user,
    result,
    resume,
    followUpEmail,
    jobTitle,
    company,
    savedToFirebase,
    savingToFirebase,
  ]);

  const handleCopyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyEmailToClipboard = () => {
    if (followUpEmail) {
      navigator.clipboard.writeText(followUpEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const handleCopyResumeToClipboard = () => {
    if (resume) {
      navigator.clipboard.writeText(resume);
      // Add state for resume copy feedback if needed
    }
  };

  const handleResumeEdit = () => {
    // We're just toggling edit mode now - saving is handled by the form component
    setIsEditingResume(!isEditingResume);
  };

  const handleResumeTwoEdit = () => {
    // We're just toggling edit mode now - saving is handled by the form component
    setIsEditingResumeTwo(!isEditingResumeTwo);
  };

  const handleSaveResumeEdit = (updatedResume: any) => {
    setCvResume(updatedResume);
    const updatedResumeStr = JSON.stringify(updatedResume);
    setResume(updatedResumeStr);
    localStorage.setItem("resume", updatedResumeStr);
    
    // Update both template states with the same data
    setEditedResume(updatedResumeStr);
    setEditedResumeTwo(updatedResumeStr);
    setIsEditingResume(false);
  };

  const handleSaveResumeTwoEdit = (updatedResume: any) => {
    setCvResume(updatedResume);
    const updatedResumeStr = JSON.stringify(updatedResume);
    setResume(updatedResumeStr);
    localStorage.setItem("resume", updatedResumeStr);
    
    // Update both template states with the same data
    setEditedResume(updatedResumeStr);
    setEditedResumeTwo(updatedResumeStr);
    setIsEditingResumeTwo(false);
  };

  const handleCancelResumeEdit = () => {
    setIsEditingResume(false);
  };

  const handleCancelResumeTwoEdit = () => {
    setIsEditingResumeTwo(false);
  };

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
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();

      // Remove the loading toast after PDF generation is complete
      document.body.removeChild(loadingToast);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    }
  };

  const handleDownloadResumeTwoPdf = async () => {
    if (!resumeTwoRef.current) return;

    try {
      // Add a loading state for PDF generation
      const loadingToast = document.createElement("div");
      loadingToast.className =
        "fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50";
      loadingToast.innerText = "Generating Resume PDF...";
      document.body.appendChild(loadingToast);

      // Dynamically import html2pdf only on the client side
      const html2pdf = (await import("html2pdf.js")).default;

      const element = resumeTwoRef.current;
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(element).save();

      // Remove the loading toast after PDF generation is complete
      document.body.removeChild(loadingToast);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    }
  };

  const handleDownloadAsPdf = async () => {
    if (!result) return;

    // Dynamically import html2pdf only on the client side
    const html2pdf = (await import("html2pdf.js")).default;
    // const html2pdf = require('html2pdf.js') as any;

    // Create a clean PDF-specific template
    const container = document.createElement("div");
    container.style.width = "210mm";
    container.style.padding = "20mm";
    container.style.backgroundColor = "white";
    container.style.fontFamily = "Arial, sans-serif"; // Ensure Arial is used as font

    // Add a style element to enforce Arial font throughout the document
    const style = document.createElement("style");
    style.textContent = `
      * {
        font-family: Arial, sans-serif !important;
      }
      p, div, span {
        font-family: Arial, sans-serif !important;
      }
    `;
    container.appendChild(style);

    const content = document.createElement("div");
    content.className = "pdf-content";
    content.style.fontSize = "14px";
    content.style.lineHeight = "1.5";
    content.style.color = "#000";
    content.style.fontFamily = "Arial, sans-serif"; // Ensure content also uses Arial

    // First split by double newlines which separate paragraphs
    // Then for the first 6-7 lines (contact info), we'll treat each line separately
    const sections = result.split("\n\n");

    // Process each section
    sections.forEach((section, sectionIndex) => {
      // For the first several sections (contact info), split by single newlines
      if (sectionIndex < 7) {
        const lines = section.split("\n");
        lines.forEach((line) => {
          if (line.trim()) {
            const p = document.createElement("p");
            p.textContent = line.trim();
            p.style.margin = "0";
            p.style.marginBottom = "3px";
            p.style.fontFamily = "Arial, sans-serif"; // Set Arial for each paragraph
            content.appendChild(p);
          }
        });
      }
      // For Dear line (usually the 7th or 8th section)
      else if (section.includes("Dear")) {
        const p = document.createElement("p");
        p.textContent = section;
        p.style.marginTop = "20px";
        p.style.marginBottom = "15px";
        p.style.fontFamily = "Arial, sans-serif"; // Set Arial for greeting
        content.appendChild(p);
      }
      // Regular paragraphs for the rest of the content
      else {
        const p = document.createElement("p");
        p.textContent = section;
        p.style.marginBottom = "22px"; // Adjusted from 30px to 22px for better paragraph separation
        p.style.fontFamily = "Arial, sans-serif"; // Set Arial for body paragraphs
        content.appendChild(p);
      }
    });

    // Add some additional styling for better paragraph separation
    const additionalStyle = document.createElement("style");
    additionalStyle.textContent = `
      .pdf-content p {
        margin-bottom: 22px !important;
      }
      
      /* Add more space after greeting */
      .pdf-content p:nth-of-type(8) {
        margin-bottom: 30px !important;
      }
      
      /* Add space between paragraphs */
      .pdf-content p + p {
        margin-top: 15px !important;
      }
    `;
    container.appendChild(additionalStyle);

    container.appendChild(content);
    document.body.appendChild(container);

    // Add a loading state for PDF generation
    const loadingToast = document.createElement("div");
    loadingToast.className =
      "fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50";
    loadingToast.innerText = "Generating PDF...";
    document.body.appendChild(loadingToast);

    const opt = {
      margin: [0, 0, 0, 0],
      filename: "cover-letter.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .from(container)
      .set(opt)
      .save()
      .then(() => {
        // Clean up - remove the temp container
        document.body.removeChild(container);

        // Remove the loading toast
        document.body.removeChild(loadingToast);

        // Add a success toast
        const successToast = document.createElement("div");
        successToast.className =
          "fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50";
        successToast.innerText = "PDF downloaded successfully!";
        document.body.appendChild(successToast);

        // Remove the success toast after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successToast);
        }, 3000);
      });
  };

  const handleDownloadEmailAsPdf = async () => {
    if (!followUpEmail) return;

    // Dynamically import html2pdf only on the client side
    const html2pdf = (await import("html2pdf.js")).default as any;

    // Create a clean PDF-specific template
    const container = document.createElement("div");
    container.style.width = "210mm";
    container.style.padding = "20mm";
    container.style.backgroundColor = "white";
    container.style.fontFamily = "Arial, sans-serif"; // Ensure Arial is used as font

    // Add a style element to enforce Arial font throughout the document
    const style = document.createElement("style");
    style.textContent = `
      * {
        font-family: Arial, sans-serif !important;
      }
      p, div, span {
        font-family: Arial, sans-serif !important;
      }
    `;
    container.appendChild(style);

    const content = document.createElement("div");
    content.className = "pdf-content";
    content.style.fontSize = "12px";
    content.style.lineHeight = "1.5";
    content.style.color = "#000";
    content.style.fontFamily = "Arial, sans-serif"; // Ensure content also uses Arial

    // Split by double newlines which separate paragraphs
    const sections = followUpEmail.split("\n\n");

    // Process each section
    sections.forEach((section, sectionIndex) => {
      // For the subject line (usually the first section)
      if (sectionIndex === 0 && section.toLowerCase().includes("subject:")) {
        const p = document.createElement("p");
        p.textContent = section;
        p.style.fontWeight = "bold";
        p.style.marginBottom = "20px";
        p.style.fontFamily = "Arial, sans-serif"; // Set Arial for subject line
        content.appendChild(p);
      }
      // For all other sections
      else {
        const p = document.createElement("p");
        p.textContent = section;
        p.style.marginBottom = "15px";
        p.style.fontFamily = "Arial, sans-serif"; // Set Arial for body paragraphs
        content.appendChild(p);
      }
    });

    container.appendChild(content);
    document.body.appendChild(container);

    // Add a loading state for PDF generation
    const loadingToast = document.createElement("div");
    loadingToast.className =
      "fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50";
    loadingToast.innerText = "Generating PDF...";
    document.body.appendChild(loadingToast);

    const opt = {
      margin: [0, 0, 0, 0],
      filename: "follow-up-email.pdf",
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .from(container)
      .set(opt)
      .save()
      .then(() => {
        // Clean up - remove the temp container
        document.body.removeChild(container);

        // Remove the loading toast
        document.body.removeChild(loadingToast);

        // Add a success toast
        const successToast = document.createElement("div");
        successToast.className =
          "fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50";
        successToast.innerText = "PDF downloaded successfully!";
        document.body.appendChild(successToast);

        // Remove the success toast after 3 seconds
        setTimeout(() => {
          document.body.removeChild(successToast);
        }, 3000);
      });
  };

  const handleCoverLetterEdit = () => {
    setEditedCoverLetter(result);
    setIsEditingCoverLetter(true);
  };

  const handleSaveCoverLetterEdit = () => {
    if (editedCoverLetter) {
      setResult(editedCoverLetter);
      localStorage.setItem("cvAnalysisResult", editedCoverLetter);
    }
    setIsEditingCoverLetter(false);
  };

  const handleCancelCoverLetterEdit = () => {
    setIsEditingCoverLetter(false);
    setEditedCoverLetter(null);
  };

  const handleCoverLetterChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedCoverLetter(e.target.value);
  };

  const navigateToJobHub = () => {
    router.push("/job-hub");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-300 border-t-purple-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your Hire Me Pack...</p>
          <p className="mt-2 text-gray-500 text-sm">This may take a moment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <svg
            className="w-16 h-16 text-red-500 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="bg-purple-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-600 transition-colors"
          >
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gray-50 py-10 text-black">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            {user && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={navigateToJobHub}
                  className="flex items-center text-purple-600 hover:text-purple-800 font-medium"
                >
                  <FaArrowLeft className="mr-2" /> Back to Dashboard
                </button>
              </div>
            )}
            <h1 className="text-3xl text-black font-bold mb-2">
              Here is your Hire-Me Pack!
            </h1>
            <p className="text-gray-600">
              Everything you need for your job application
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
            <div className="flex justify-between items-center mb-8">
              <div className="h-4 w-64 bg-gray-200 rounded-full"></div>
              <span className="text-gray-500 text-sm uppercase tracking-wider">
                HIRE ME PACK
              </span>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-[1600px] mx-auto">
                <div className="flex flex-col space-y-6">
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                          <svg
                            className="w-4 h-4 text-yellow-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 00-3-3H5zm0 2a1 1 0 00-1 1v6a1 1 0 001 1h10a1 1 0 001-1V7a1 1 0 00-1-1H5z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </div>
                        <span className="font-medium">Cover Letter</span>
                      </div>
                      <div className="flex space-x-3">
                        {isEditingCoverLetter ? (
                          <>
                            <button 
                              className="text-green-600 hover:text-green-700 flex items-center"
                              onClick={handleSaveCoverLetterEdit}
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
                                  d="M5 13l4 4L19 7"
                                ></path>
                              </svg>
                              <span className="text-sm">Save</span>
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-700 flex items-center"
                              onClick={handleCancelCoverLetterEdit}
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
                                  d="M6 18L18 6M6 6l12 12"
                                ></path>
                              </svg>
                              <span className="text-sm">Cancel</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              className="text-gray-500 hover:text-gray-700 flex items-center"
                              onClick={handleCoverLetterEdit}
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
                                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                ></path>
                              </svg>
                              <span className="text-sm">Edit</span>
                            </button>
                            <button
                              className="text-gray-500 hover:text-gray-700"
                              onClick={handleDownloadAsPdf}
                              title="Download as PDF"
                            >
                              <svg
                                className="w-5 h-5"
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
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="relative h-[300px] w-full overflow-hidden rounded">
                      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                        <div className="bg-gradient-to-br from-white to-gray-200" />
                        <div className="bg-gradient-to-br from-white to-gray-200" />
                        <div className="bg-gradient-to-br from-white to-gray-200" />
                        <div className="bg-gradient-to-br from-white to-gray-200" />
                      </div>
                      <div className="relative z-10 h-full p-3 text-sm overflow-y-auto">
                        {isEditingCoverLetter ? (
                          <textarea
                            className="w-full h-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 font-sans"
                            value={editedCoverLetter || ""}
                            onChange={handleCoverLetterChange}
                            style={{ 
                              resize: "none", 
                              minHeight: "190px", 
                              lineHeight: "1.4",
                              fontSize: "0.85rem"
                            }}
                          />
                        ) : result ? (
                          <div
                            className="prose prose-sm flex justify-center items-center"
                            ref={coverLetterRef}
                          >
                            <style jsx global>{`
                              /* Remove all default margins */
                              .cover-letter-content p {
                                margin: 0;
                                line-height: 1.4;
                              }

                              /* Better paragraph spacing for body paragraphs */
                              .cover-letter-content .body-paragraph {
                                margin-top: 2px !important;
                                margin-bottom: 2px !important;
                                position: relative;
                              }
                              
                              /* Add visual separator between paragraphs */
                              .cover-letter-content .body-paragraph:after {
                                content: '';
                                display: block;
                                height: 2px;
                              }

                              /* Add spacing before and after "Dear Hiring Manager" */
                              .cover-letter-content p:nth-child(8),
                              .cover-letter-content .greeting-paragraph {
                                margin-top: 6px !important;
                                margin-bottom: 6px !important;
                                font-weight: 500;
                              }
                            `}</style>
                            <div className="cover-letter-content text-[0.85rem] max-w-full px-3">
                              <ReactMarkdown
                                components={{
                                  p: ({ node, children, ...props }) => {
                                    const content = (node?.children ?? [])
                                      .filter((child) => child.type === "text")
                                      .map((child) => child.value)
                                      .join("");

                                    const isDearParagraph =
                                      content.includes("Dear");

                                    // Check if it's a body paragraph (not header info or greeting)
                                    const isBodyParagraph = 
                                      !isDearParagraph && 
                                      !content.includes("@") && 
                                      !content.includes("linkedin") &&
                                      content.length > 30;
                                    
                                    // Return a fragment with paragraph + spacing div for body paragraphs
                                    return isBodyParagraph ? (
                                      <>
                                        <p
                                          {...props}
                                          className="body-paragraph"
                                        >
                                          {children}
                                        </p>
                                        <div style={{ height: '3px' }}></div>
                                      </>
                                    ) : (
                                      <p
                                        {...props}
                                        className={
                                          isDearParagraph ? "greeting-paragraph" : ""
                                        }
                                      >
                                        {children}
                                      </p>
                                    );
                                  },
                                }}
                              >
                                {result}
                              </ReactMarkdown>
                            </div>
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <p className="text-gray-400">
                              No cover letter generated
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                          <svg
                            className="w-4 h-4 text-purple-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path>
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                          </svg>
                        </div>
                        <span className="font-medium">Follow-up Email</span>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          className="text-gray-500 hover:text-gray-700 flex items-center"
                          onClick={handleCopyEmailToClipboard}
                          title="Copy to clipboard"
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
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            ></path>
                          </svg>
                          <span className="text-sm">
                            {copiedEmail ? "Copied!" : "Copy"}
                          </span>
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={handleDownloadEmailAsPdf}
                          title="Download as PDF"
                        >
                          <svg
                            className="w-5 h-5"
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
                        </button>
                      </div>
                    </div>
                    <div className="h-[300px] overflow-y-auto bg-gray-100 rounded p-3 text-sm">
                      {followUpEmail ? (
                        <div
                          className="prose prose-sm max-w-none"
                          ref={followUpEmailRef}
                        >
                          <style jsx global>{`
                            /* Remove all default margins */
                            .email-content p {
                              margin: 0;
                              line-height: 1.4;
                            }

                            /* Better paragraph spacing for body paragraphs */
                            .email-content .body-paragraph {
                              margin-top: 2px !important;
                              margin-bottom: 2px !important;
                              position: relative;
                            }
                            
                            /* Add visual separator between paragraphs */
                            .email-content .body-paragraph:after {
                              content: '';
                              display: block;
                              height: 2px;
                            }

                            /* Special styling for subject line */
                            .email-content .subject-line,
                            .email-content p:first-child {
                              font-weight: bold;
                              margin-bottom: 8px !important;
                              margin-top: 4px !important;
                            }
                            
                            /* Special styling for greeting */
                            .email-content .greeting-paragraph {
                              margin-top: 6px !important;
                              margin-bottom: 6px !important;
                              font-weight: 500;
                            }
                          `}</style>
                          <div className="email-content text-[0.85rem] max-w-full px-3">
                            <ReactMarkdown
                              components={{
                                p: ({ node, children, ...props }) => {
                                  const content = (node?.children ?? [])
                                    .filter((child) => child.type === "text")
                                    .map((child) => child.value)
                                    .join("");

                                  const isDearParagraph =
                                    content?.includes("Dear");

                                  // Check if it's a body paragraph (not header info or greeting)
                                  const isBodyParagraph = 
                                    !isDearParagraph && 
                                    !content?.includes("Subject:") &&
                                    !content?.includes("@") && 
                                    !content?.includes("linkedin") &&
                                    content?.length > 30;
                                  
                                  // Return a fragment with paragraph + spacing div for body paragraphs
                                  return isBodyParagraph ? (
                                    <>
                                      <p
                                        {...props}
                                        className="body-paragraph"
                                      >
                                        {children}
                                      </p>
                                      <div style={{ height: '3px' }}></div>
                                    </>
                                  ) : (
                                    <p
                                      {...props}
                                      className={
                                        isDearParagraph ? "greeting-paragraph" : 
                                        content?.includes("Subject:") ? "subject-line" : ""
                                      }
                                    >
                                      {children}
                                    </p>
                                  );
                                },
                              }}
                            >
                              {followUpEmail}
                            </ReactMarkdown>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <p className="text-gray-400">
                            No follow-up email generated
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isFirstResumeVisible ? (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <svg
                            className="w-4 h-4 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </div>
                        <span className="font-medium">Resume</span>
                      </div>
                      <div className="flex space-x-3">
                        <div className="flex justify-end">
                          <button
                            className="text-gray-500 hover:text-gray-700 text-sm hover:underline"
                            onClick={handleSwitchResume}
                          >
                            Next Template
                          </button>
                        </div>
                        <button
                          className="text-gray-500 hover:text-gray-700 flex items-center"
                          onClick={handleCopyResumeToClipboard}
                          title="Copy to clipboard"
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
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            ></path>
                          </svg>
                          <span className="text-sm">Copy</span>
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700 flex items-center"
                          onClick={handleResumeEdit}
                          title={isEditingResume ? "Save" : "Edit"}
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {isEditingResume ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              ></path>
                            )}
                          </svg>
                          <span className="text-sm">
                            {isEditingResume ? "Save" : "Edit"}
                          </span>
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={handleDownloadResumePdf}
                          title="Download as PDF"
                        >
                          <svg
                            className="w-5 h-5"
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
                        </button>
                      </div>
                    </div>
                    <div className="h-[700px] bg-white rounded relative overflow-y-auto">
                      {isEditingResume ? (
                        <div className="p-5 bg-white border rounded h-full overflow-auto">
                          <ResumeEditForm 
                            resume={editedResume ? JSON.parse(editedResume) : (cvResume || defaultStructuredResume)}
                            onSave={handleSaveResumeEdit}
                            onCancel={handleCancelResumeEdit}
                          />
                        </div>
                      ) : (
                        <div ref={resumeRef} className="bg-white w-full h-full">
                          <TemplateOne result={editedResume ? JSON.parse(editedResume) : cvResume} />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                          <svg
                            className="w-4 h-4 text-blue-500"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </div>
                        <span className="font-medium">Resume</span>
                      </div>
                      <div className="flex space-x-3">
                        <div className="flex justify-end">
                          <button
                            className="text-gray-500 hover:text-gray-700 text-sm hover:underline"
                            onClick={handleSwitchResume}
                          >
                            Next Template
                          </button>
                        </div>
                        <button
                          className="text-gray-500 hover:text-gray-700 flex items-center"
                          onClick={handleCopyResumeToClipboard}
                          title="Copy to clipboard"
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
                              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                            ></path>
                          </svg>
                          <span className="text-sm">Copy</span>
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700 flex items-center"
                          onClick={handleResumeTwoEdit}
                          title={isEditingResumeTwo ? "Save" : "Edit"}
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {isEditingResumeTwo ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              ></path>
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              ></path>
                            )}
                          </svg>
                          <span className="text-sm">
                            {isEditingResumeTwo ? "Save" : "Edit"}
                          </span>
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={handleDownloadResumeTwoPdf}
                          title="Download as PDF"
                        >
                          <svg
                            className="w-5 h-5"
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
                        </button>
                      </div>
                    </div>
                    <div className="h-[700px] bg-white rounded relative overflow-y-auto">
                      {isEditingResumeTwo ? (
                        <div className="p-5 bg-white border rounded h-full overflow-auto">
                          <ResumeEditForm 
                            resume={editedResumeTwo ? JSON.parse(editedResumeTwo) : (cvResume || defaultStructuredResume)}
                            onSave={handleSaveResumeTwoEdit}
                            onCancel={handleCancelResumeTwoEdit}
                          />
                        </div>
                      ) : (
                        <div ref={resumeTwoRef} className="bg-white w-full h-full">
                          <TemplateTwo result={editedResumeTwo ? JSON.parse(editedResumeTwo) : cvResume} />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center mt-12 mb-8">
            <div className="flex mb-2">⭐⭐⭐⭐⭐</div>
            <p className="text-center text-gray-700 max-w-2xl mb-4">
              "JobApplyAI transformed my job search completely! The tailored
              resume and cover letter helped me land interviews at top tech
              companies. The follow-up email was the perfect finishing touch - I
              got my dream job within 3 weeks!"
            </p>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-[#7046EC] rounded-full flex items-center justify-center text-white font-semibold mr-2">
                M
              </div>
              <span className="font-medium">Michael T.</span>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={navigateToJobHub}
              className="px-6 py-3 bg-purple-500 text-white rounded-full text-base font-medium hover:bg-purple-600 transition-colors flex items-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
              Create Another Application
            </button>
          </div>
        </div>
      </div>
    </Suspense>
  );
}
