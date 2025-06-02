/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { useAuth } from "@/lib/hooks/useAuth";
import { saveApplicationKit } from "@/lib/firebase/applicationKitUtils";
import { getUserSubscriptionStatus } from "@/lib/firebase/firebaseUtils";
import TemplateOne from "../components/template/TemplateOne";
import TemplateTwo from "../components/template/TemplateTwo";
import TemplateThree from "../components/template/TemplateThree";
import TemplateFour from "../components/template/TemplateFour";
import { FaArrowLeft } from "react-icons/fa";
import { AiFillCloseCircle } from "react-icons/ai";
import ResumeEditForm, { ResumeFormRef } from "../components/ResumeeditForm";

// Custom toast hook
function useToast() {
  const showToast = (props: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
    // Create a div element for the toast
    const toastEl = document.createElement('div');
    toastEl.className = `fixed bottom-4 right-4 p-4 rounded shadow-lg z-50 ${
      props.variant === 'destructive' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'
    }`;
    
    // Create the title
    const titleEl = document.createElement('div');
    titleEl.className = 'font-bold';
    titleEl.textContent = props.title;
    toastEl.appendChild(titleEl);
    
    // Add description if provided
    if (props.description) {
      const descEl = document.createElement('div');
      descEl.className = 'text-sm mt-1';
      descEl.textContent = props.description;
      toastEl.appendChild(descEl);
    }
    
    // Add to document
    document.body.appendChild(toastEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
      document.body.removeChild(toastEl);
    }, 3000);
  };
  
  return { toast: showToast };
}

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
  const [sessionId] = useState(() => Date.now().toString()); // Unique session identifier
  const coverLetterRef = useRef<HTMLDivElement>(null);
  const followUpEmailRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const resumeTwoRef = useRef<HTMLDivElement>(null);
  const resumeThreeRef = useRef<HTMLDivElement>(null);
  const resumeFourRef = useRef<HTMLDivElement>(null);
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  const [isEditingResume, setIsEditingResume] = useState(false);
  const [editedResume, setEditedResume] = useState<string | null>(null);
  const [isEditingResumeTwo, setIsEditingResumeTwo] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<1 | 2 | 3 | 4>(2);
  const [isEditingCoverLetter, setIsEditingCoverLetter] = useState(false);
  const [editedCoverLetter, setEditedCoverLetter] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState<boolean>(false);

  // Subscription status states
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const [editedResumeTwo, setEditedResumeTwo] = useState<string | null>(null);
  const [isEditingResumeThree, setIsEditingResumeThree] = useState(false);
  const [editedResumeThree, setEditedResumeThree] = useState<string | null>(null);
  const [isEditingResumeFour, setIsEditingResumeFour] = useState(false);
  const [editedResumeFour, setEditedResumeFour] = useState<string | null>(null);

  const [cvResume, setCvResume] = useState<any>(null);

  const resumeFormRef = useRef<ResumeFormRef>(null);
  const resumeTwoFormRef = useRef<ResumeFormRef>(null);
  const resumeThreeFormRef = useRef<ResumeFormRef>(null);
  const resumeFourFormRef = useRef<ResumeFormRef>(null);

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

  useEffect(() => {
    const storedResume = localStorage.getItem("resume");
    try {
      if (storedResume) {
        const parsedResume = JSON.parse(storedResume);
        setCvResume(parsedResume);
        // Also update the template states
        setEditedResume(storedResume);
        setEditedResumeTwo(storedResume);
        setEditedResumeThree(storedResume);
        setEditedResumeFour(storedResume);
      } else {
        // Set default resume if none exists
        setCvResume(defaultStructuredResume);
        const defaultResumeStr = JSON.stringify(defaultStructuredResume);
        setEditedResume(defaultResumeStr);
        setEditedResumeTwo(defaultResumeStr);
        setEditedResumeThree(defaultResumeStr);
        setEditedResumeFour(defaultResumeStr);
      }
    } catch (error) {
      console.error("Failed to parse resume from localStorage:", error);
      // Initialize with default resume structure if parsing fails
      setCvResume(defaultStructuredResume);
      const defaultResumeStr = JSON.stringify(defaultStructuredResume);
      setEditedResume(defaultResumeStr);
      setEditedResumeTwo(defaultResumeStr);
      setEditedResumeThree(defaultResumeStr);
      setEditedResumeFour(defaultResumeStr);
    }
  }, []);

  // Keep both template data in sync when cvResume changes
  useEffect(() => {
    if (cvResume) {
      try {
        const resumeString = JSON.stringify(cvResume);
        setEditedResume(resumeString);
        setEditedResumeTwo(resumeString);
        setEditedResumeThree(resumeString);
        setEditedResumeFour(resumeString);
      } catch (e) {
        console.error("Error syncing resume data:", e);
      }
    }
  }, [cvResume]);

  const { toast } = useToast();

  // Function to handle switching between templates
  const handleSwitchTemplate = () => {
    if (isEditingResume || isEditingResumeTwo || isEditingResumeThree || isEditingResumeFour) {
      toast({
        title: "Please save or cancel your changes before switching templates",
        description: "You have unsaved changes that will be lost if you switch templates now.",
        variant: "destructive",
      });
      return;
    }

    setActiveTemplate((prev) => {
      if (prev === 1) return 2;
      if (prev === 2) return 3;
      if (prev === 3) return 4;
      return 1; // If we're on template 4, go back to 1
    });
  };

  const handleToggleSummary = () => {
    setShowSummary(prev => !prev);
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
            
            // Also update template states for consistency
            setEditedResume(storedResume);
            setEditedResumeTwo(storedResume);
            setEditedResumeThree(storedResume);
            setEditedResumeFour(storedResume);
          } catch (e) {
            console.error("Error parsing resume from localStorage:", e);
            // If JSON parsing fails, initialize with default structure
            setCvResume(defaultStructuredResume);
            const defaultResumeStr = JSON.stringify(defaultStructuredResume);
            setResume(defaultResumeStr);
            setEditedResume(defaultResumeStr);
            setEditedResumeTwo(defaultResumeStr);
            setEditedResumeThree(defaultResumeStr);
            setEditedResumeFour(defaultResumeStr);
          }
        } else {
          // No stored resume, use default
          setCvResume(defaultStructuredResume);
          const defaultResumeStr = JSON.stringify(defaultStructuredResume);
          setResume(defaultResumeStr);
          setEditedResume(defaultResumeStr);
          setEditedResumeTwo(defaultResumeStr);
          setEditedResumeThree(defaultResumeStr);
          setEditedResumeFour(defaultResumeStr);
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

  // Save to Firebase when mounted if user is logged in - only once per session
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
          sessionId: sessionId, // Add unique session ID to prevent duplicates
          createdAt: new Date().toISOString(),
          original: {
            cv: localStorage.getItem("cv") || "",
            jobDescription: localStorage.getItem("jobDescription") || "",
            formality: localStorage.getItem("formality") || "neutral",
          },
        };
        
        // Simple single save - no retry logic to prevent duplicates
        await saveApplicationKit(user.uid, saveData);
        setSavedToFirebase(true);
        console.log("Successfully saved to Firebase");
      } catch (error) {
        console.error("Error saving to Firebase:", error);
        // Don't retry to prevent duplicates
      } finally {
        setSavingToFirebase(false);
      }
    };

    // Only save once when we have the initial data and user is authenticated
    // Use a timeout to ensure all data has been loaded
    const timeoutId = setTimeout(() => {
      if (user && result && !savedToFirebase && !savingToFirebase) {
        saveToFirebase();
      }
    }, 1000); // Wait 1 second after component mount to ensure all data is loaded

    return () => clearTimeout(timeoutId); // Cleanup timeout
  }, [user, result, sessionId]); // Only depend on core identifiers, not changing data

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
    // If we're already in edit mode, call the save function
    if (isEditingResume) {
      // Submit the form using the ref's submitForm method
      if (resumeFormRef.current) {
        resumeFormRef.current.submitForm();
      }
    } else {
      // Otherwise, toggle edit mode
      setIsEditingResume(true);
    }
  };

  const handleResumeTwoEdit = () => {
    // If we're already in edit mode, call the save function
    if (isEditingResumeTwo) {
      // Submit the form using the ref's submitForm method
      if (resumeTwoFormRef.current) {
        resumeTwoFormRef.current.submitForm();
      }
    } else {
      // Otherwise, toggle edit mode
      setIsEditingResumeTwo(true);
    }
  };

  const handleSaveResumeEdit = (updatedResume: any) => {
    // We might have already exited edit mode from the button click,
    // so we need to ensure all data updates still happen
    setCvResume(updatedResume);
    const updatedResumeStr = JSON.stringify(updatedResume);
    setResume(updatedResumeStr);
    localStorage.setItem("resume", updatedResumeStr);
    
    // Update both template states with the same data
    setEditedResume(updatedResumeStr);
    setEditedResumeTwo(updatedResumeStr);
    setEditedResumeThree(updatedResumeStr);
    setEditedResumeFour(updatedResumeStr);
    
    // Just in case edit mode is still active, turn it off
    setIsEditingResume(false);
  };

  const handleSaveResumeTwoEdit = (updatedResume: any) => {
    // We might have already exited edit mode from the button click,
    // so we need to ensure all data updates still happen
    setCvResume(updatedResume);
    const updatedResumeStr = JSON.stringify(updatedResume);
    setResume(updatedResumeStr);
    localStorage.setItem("resume", updatedResumeStr);
    
    // Update both template states with the same data
    setEditedResume(updatedResumeStr);
    setEditedResumeTwo(updatedResumeStr);
    setEditedResumeThree(updatedResumeStr);
    setEditedResumeFour(updatedResumeStr);
    
    // Just in case edit mode is still active, turn it off
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

    // Check download permissions for free users
    if (!checkDownloadPermission()) {
      return;
    }

    try {
      // Add a loading state for PDF generation
      const loadingToast = document.createElement("div");
      loadingToast.className =
        "fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50";
      loadingToast.innerText = "Generating Resume PDF...";
      document.body.appendChild(loadingToast);

      // Dynamically import html2pdf only on the client side
      let html2pdf;
      try {
        html2pdf = (await import("html2pdf.js")).default;
      } catch (importError) {
        console.error("Failed to import html2pdf.js:", importError);
        throw new Error("PDF library not available. Please refresh the page and try again.");
      }

      const element = resumeRef.current;
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: "resume.pdf",
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
      
      // Remove loading toast if it exists
      const existingToast = document.querySelector('.fixed.bottom-4.right-4');
      if (existingToast) {
        document.body.removeChild(existingToast);
      }
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : "There was an error generating the PDF. Please try again.";
      alert(errorMessage);
    }
  };

  const handleDownloadResumeTwoPdf = async () => {
    if (!resumeTwoRef.current) return;

    // Check download permissions for free users
    if (!checkDownloadPermission()) {
      return;
    }

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
        margin: [8, 8, 8, 8],
        filename: "resume.pdf",
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
          compress: true,
          hotfixes: ["px_scaling"]
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
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

    // Check download permissions for free users
    if (!checkDownloadPermission()) {
      return;
    }

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
      .pdf-content p:nth-child(8) {
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

    // Check download permissions for free users
    if (!checkDownloadPermission()) {
      return;
    }

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

  // Helper function to check download permissions
  const checkDownloadPermission = (): boolean => {
    if (!hasActiveSubscription) {
      setShowSubscriptionModal(true);
      return false;
    }
    return true;
  };

  const handleResumeThreeEdit = () => {
    // If we're already in edit mode, call the save function
    if (isEditingResumeThree) {
      // Submit the form using the ref's submitForm method
      if (resumeThreeFormRef.current) {
        resumeThreeFormRef.current.submitForm();
      }
    } else {
      // Otherwise, toggle edit mode
      setIsEditingResumeThree(true);
    }
  };

  const handleSaveResumeThreeEdit = (updatedResume: any) => {
    // We might have already exited edit mode from the button click,
    // so we need to ensure all data updates still happen
    setCvResume(updatedResume);
    const updatedResumeStr = JSON.stringify(updatedResume);
    setResume(updatedResumeStr);
    localStorage.setItem("resume", updatedResumeStr);
    
    // Update all template states with the same data
    setEditedResume(updatedResumeStr);
    setEditedResumeTwo(updatedResumeStr);
    setEditedResumeThree(updatedResumeStr);
    setEditedResumeFour(updatedResumeStr);
    
    // Just in case edit mode is still active, turn it off
    setIsEditingResumeThree(false);
  };

  const handleCancelResumeThreeEdit = () => {
    setIsEditingResumeThree(false);
  };

  const handleDownloadResumeThreePdf = async () => {
    if (!resumeThreeRef.current) return;

    // Check download permissions for free users
    if (!checkDownloadPermission()) {
      return;
    }

    try {
      // Add a loading state for PDF generation
      const loadingToast = document.createElement("div");
      loadingToast.className =
        "fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50";
      loadingToast.innerText = "Generating Resume PDF...";
      document.body.appendChild(loadingToast);

      // Dynamically import html2pdf only on the client side
      const html2pdf = (await import("html2pdf.js")).default as any;

      const element = resumeThreeRef.current;
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: "resume_template3.pdf",
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

  const handleResumeFourEdit = () => {
    // If we're already in edit mode, call the save function
    if (isEditingResumeFour) {
      // Submit the form using the ref's submitForm method
      if (resumeFourFormRef.current) {
        resumeFourFormRef.current.submitForm();
      }
    } else {
      // Otherwise, toggle edit mode
      setIsEditingResumeFour(true);
    }
  };

  const handleSaveResumeFourEdit = (updatedResume: any) => {
    // We might have already exited edit mode from the button click,
    // so we need to ensure all data updates still happen
    setCvResume(updatedResume);
    const updatedResumeStr = JSON.stringify(updatedResume);
    setResume(updatedResumeStr);
    localStorage.setItem("resume", updatedResumeStr);
    
    // Update all template states with the same data
    setEditedResume(updatedResumeStr);
    setEditedResumeTwo(updatedResumeStr);
    setEditedResumeThree(updatedResumeStr);
    setEditedResumeFour(updatedResumeStr);
    
    // Just in case edit mode is still active, turn it off
    setIsEditingResumeFour(false);
  };

  const handleCancelResumeFourEdit = () => {
    setIsEditingResumeFour(false);
  };

  const handleDownloadResumeFourPdf = async () => {
    if (!resumeFourRef.current) return;

    // Check download permissions for free users
    if (!checkDownloadPermission()) {
      return;
    }

    try {
      // Add a loading state for PDF generation
      const loadingToast = document.createElement("div");
      loadingToast.className =
        "fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50";
      loadingToast.innerText = "Generating Resume PDF...";
      document.body.appendChild(loadingToast);

      // Dynamically import html2pdf only on the client side
      const html2pdf = (await import("html2pdf.js")).default;

      const element = resumeFourRef.current;
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: "resume_template4.pdf",
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
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl text-black font-bold mb-1">
              Here is your Hire-Me Pack!
            </h1>
            <p className="text-gray-600 mb-4">
              Everything you need for your job application
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-lg font-medium text-gray-800" style={{ fontFamily: 'Cambria, serif' }}>
                {company && jobTitle ? `${company}, ${jobTitle}` : 'Your Job Application'}
              </h2>
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
                    <div className="relative h-[300px] w-full overflow-hidden rounded bg-[#f3f4f6]">
                      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                        {/* <div className="bg-gradient-to-br from-white to-gray-200" />
                        <div className="bg-gradient-to-br from-white to-gray-200" />
                        <div className="bg-gradient-to-br from-white to-gray-200" />
                        <div className="bg-gradient-to-br from-white to-gray-200" /> */}
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

                {activeTemplate === 1 && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-center gap-4 sm:gap-0 sm:justify-between mb-4 flex-wrap">
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
                      <div className="flex flex-wrap justify-around items-center max-sm:gap-y-2 sm:space-x-3">
                        <div className="flex justify-center sm:justify-end max-sm:w-1/2 max-sm:ml-auto">
                          <button
                            className="text-gray-500 hover:text-gray-700 text-sm hover:underline"
                            onClick={handleSwitchTemplate}
                          >
                            Next Template
                          </button>
                        </div>
                        <button
                          className="text-gray-500 hover:text-gray-700 flex items-center"
                          onClick={handleResumeEdit}
                          title="Edit"
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
                              d={isEditingResume ? "M5 13l4 4L19 7" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"}
                            ></path>
                          </svg>
                          <span className="text-sm">{isEditingResume ? "Save" : "Edit"}</span>
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
                        <div className="p-5 bg-white border rounded h-full overflow-auto resume-edit-form">
                          <ResumeEditForm 
                            ref={resumeFormRef}
                            resume={editedResume ? JSON.parse(editedResume) : (cvResume || defaultStructuredResume)}
                            onSave={handleSaveResumeEdit}
                            onCancel={handleCancelResumeEdit}
                          />
                        </div>
                      ) : (
                        <div ref={resumeRef} className="bg-white w-full h-full">
                          <TemplateOne result={cvResume || defaultStructuredResume} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTemplate === 2 && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-center gap-2 sm:gap-0 sm:justify-between mb-4 flex-wrap">
                      <div className="flex items-center max-sm:w-full max-sm:text-center">
                        <div className="max-sm:ml-auto w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
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
                        <span className="font-medium max-sm:mr-auto">Resume</span>
                      </div>
                      <div className="flex space-x-3">
                        <div className="flex justify-end">
                          <button
                            className="text-gray-500 hover:text-gray-700 text-sm hover:underline"
                            onClick={handleSwitchTemplate}
                          >
                            Next Template
                          </button>
                        </div>
                        <button
                          className="text-gray-500 hover:text-gray-700 flex items-center"
                          onClick={handleResumeTwoEdit}
                          title="Edit"
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
                              d={isEditingResumeTwo ? "M5 13l4 4L19 7" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"}
                            ></path>
                          </svg>
                          <span className="text-sm">{isEditingResumeTwo ? "Save" : "Edit"}</span>
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
                        <div className="p-5 bg-white border rounded h-full overflow-auto resume-edit-form">
                          <ResumeEditForm 
                            ref={resumeTwoFormRef}
                            resume={editedResumeTwo ? JSON.parse(editedResumeTwo) : (cvResume || defaultStructuredResume)}
                            onSave={handleSaveResumeTwoEdit}
                            onCancel={handleCancelResumeTwoEdit}
                          />
                        </div>
                      ) : (
                        <div ref={resumeTwoRef} className="bg-white w-full h-full">
                          <TemplateTwo result={cvResume || defaultStructuredResume} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTemplate === 3 && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-center gap-2 sm:gap-0 sm:justify-between mb-4 flex-wrap">
                      <div className="flex items-center max-sm:w-full max-sm:text-center">
                        <div className="max-sm:ml-auto w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
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
                        <span className="font-medium max-sm:mr-auto">Resume</span>
                      </div>
                      <div className="flex space-x-3">
                        <div className="flex justify-end">
                          <button
                            className="text-gray-500 hover:text-gray-700 text-sm hover:underline"
                            onClick={handleSwitchTemplate}
                          >
                            Next Template
                          </button>
                        </div>
                        <button
                          className="text-gray-500 hover:text-gray-700 flex items-center"
                          onClick={handleResumeThreeEdit}
                          title="Edit"
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
                              d={isEditingResumeThree ? "M5 13l4 4L19 7" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"}
                            ></path>
                          </svg>
                          <span className="text-sm">{isEditingResumeThree ? "Save" : "Edit"}</span>
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={handleDownloadResumeThreePdf}
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
                      {isEditingResumeThree ? (
                        <div className="p-5 bg-white border rounded h-full overflow-auto resume-edit-form">
                          <ResumeEditForm 
                            ref={resumeThreeFormRef}
                            resume={editedResumeThree ? JSON.parse(editedResumeThree) : (cvResume || defaultStructuredResume)}
                            onSave={handleSaveResumeThreeEdit}
                            onCancel={handleCancelResumeThreeEdit}
                          />
                        </div>
                      ) : (
                        <div ref={resumeThreeRef} className="bg-white w-full h-full">
                          <TemplateThree result={cvResume || defaultStructuredResume} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTemplate === 4 && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-center gap-2 sm:gap-0 sm:justify-between mb-4 flex-wrap">
                      <div className="flex items-center max-sm:w-full max-sm:text-center">
                        <div className="max-sm:ml-auto w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
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
                        <span className="font-medium max-sm:mr-auto">Resume</span>
                      </div>
                      <div className="flex space-x-3">
                        <div className="flex justify-end">
                          <button
                            className="text-gray-500 hover:text-gray-700 text-sm hover:underline"
                            onClick={handleSwitchTemplate}
                          >
                            Next Template
                          </button>
                        </div>
                        <button
                          className="text-gray-500 hover:text-gray-700 flex items-center"
                          onClick={handleResumeFourEdit}
                          title="Edit"
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
                              d={isEditingResumeFour ? "M5 13l4 4L19 7" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"}
                            ></path>
                          </svg>
                          <span className="text-sm">{isEditingResumeFour ? "Save" : "Edit"}</span>
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700"
                          onClick={handleDownloadResumeFourPdf}
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
                      {isEditingResumeFour ? (
                        <div className="p-5 bg-white border rounded h-full overflow-auto resume-edit-form">
                          <ResumeEditForm 
                            ref={resumeFourFormRef}
                            resume={editedResumeFour ? JSON.parse(editedResumeFour) : (cvResume || defaultStructuredResume)}
                            onSave={handleSaveResumeFourEdit}
                            onCancel={handleCancelResumeFourEdit}
                          />
                        </div>
                      ) : (
                        <div ref={resumeFourRef} className="bg-white w-full h-full">
                          <TemplateFour result={cvResume || defaultStructuredResume} />
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
    </Suspense>
  );
}


