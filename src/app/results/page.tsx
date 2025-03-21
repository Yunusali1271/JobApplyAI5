"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import { useAuth } from "@/lib/hooks/useAuth";
import { saveApplicationKit } from "@/lib/firebase/applicationKitUtils";

export default function ResultsPage() {
  const { user } = useAuth();
  const [result, setResult] = useState<string | null>(null);
  const [followUpEmail, setFollowUpEmail] = useState<string | null>(null);
  const [resume, setResume] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [savingToFirebase, setSavingToFirebase] = useState(false);
  const [savedToFirebase, setSavedToFirebase] = useState(false);
  const coverLetterRef = useRef<HTMLDivElement>(null);
  const followUpEmailRef = useRef<HTMLDivElement>(null);
  const resumeRef = useRef<HTMLDivElement>(null);
  const resumePreviewRef = useRef<HTMLDivElement>(null);
  
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
  const searchParams = useSearchParams();
  const resultId = searchParams.get('id');
  
  useEffect(() => {
    // In a real app, you would fetch the result from a database using the resultId
    // For now, we'll just retrieve it from localStorage
    try {
      const storedResult = localStorage.getItem('cvAnalysisResult');
      const storedFollowUpEmail = localStorage.getItem('followUpEmail');
      const storedResume = localStorage.getItem('resume');
      const storedJobTitle = localStorage.getItem('jobTitle');
      const storedCompany = localStorage.getItem('company');
      
      if (storedResult) {
        setResult(storedResult);
        if (storedFollowUpEmail) {
          setFollowUpEmail(storedFollowUpEmail);
        }
        if (storedResume) {
          setResume(storedResume);
        }
        if (storedJobTitle) {
          setJobTitle(storedJobTitle);
        }
        if (storedCompany) {
          setCompany(storedCompany);
        }
        setLoading(false);
      } else {
        setError('Result not found. Please try generating a new cover letter.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Error retrieving result:', err);
      setError('An error occurred while retrieving your cover letter. Please try again.');
      setLoading(false);
    }
  }, [resultId]);

  // Save to Firebase when mounted if user is logged in
  useEffect(() => {
    const saveToFirebase = async () => {
      if (user && result && !savedToFirebase && !savingToFirebase) {
        try {
          setSavingToFirebase(true);
          await saveApplicationKit(user.uid, {
            jobTitle: jobTitle || 'Job Application',
            company: company || 'Company',
            status: "Interested",
            coverLetter: result,
            resume: resume || "",
            followUpEmail: followUpEmail || "",
            original: {
              cv: localStorage.getItem('cv') || "",
              jobDescription: localStorage.getItem('jobDescription') || "",
              formality: localStorage.getItem('formality') || "neutral"
            }
          });
          setSavedToFirebase(true);
          setSavingToFirebase(false);
        } catch (error) {
          console.error("Error saving to Firebase:", error);
          setSavingToFirebase(false);
        }
      }
    };
    
    saveToFirebase();
  }, [user, result, resume, followUpEmail, jobTitle, company, savedToFirebase, savingToFirebase]);

  // Generate formatted resume preview when modal is opened
  useEffect(() => {
    if (showResumePreview && resumePreviewRef.current && (resume || defaultResumeTemplate)) {
      // Clear previous content first
      resumePreviewRef.current.innerHTML = '';
      
      // Use the resume text or the default template if no resume
      const resumeText = resume || defaultResumeTemplate;
      const resumeLines = resumeText.split('\n');
      
      // Find all section headers to create the proper Harvard-style formatting
      const sectionHeaders = [];
      resumeLines.forEach((line, index) => {
        if (line.match(/^[A-Z\s]+$/) && line.trim().length > 0 && index > 2) {
          sectionHeaders.push(index);
        }
      });
      
      // Set global styles for the container
      resumePreviewRef.current.style.fontFamily = 'Arial, sans-serif';
      
      // Process each line with Harvard-style formatting
      resumeLines.forEach((line, index) => {
        // Check if this is a section header
        if (sectionHeaders.includes(index)) {
          // Create section header with blue underline
          const headerDiv = document.createElement('div');
          headerDiv.style.marginTop = '20px';
          headerDiv.style.marginBottom = '8px';
          
          const headerText = document.createElement('h2');
          headerText.textContent = line;
          headerText.style.fontSize = '14px';
          headerText.style.fontWeight = 'bold';
          headerText.style.textTransform = 'uppercase';
          headerText.style.margin = '0';
          headerText.style.padding = '0';
          headerText.style.fontFamily = 'Arial, sans-serif';
          headerDiv.appendChild(headerText);
          
          // Add the blue underline
          const underline = document.createElement('div');
          underline.style.height = '1px';
          underline.style.backgroundColor = '#1e5180';
          underline.style.width = '100%';
          underline.style.marginTop = '3px';
          headerDiv.appendChild(underline);
          
          resumePreviewRef.current.appendChild(headerDiv);
        } 
        // Handle name at the top (centered)
        else if (index === 0) {
          const nameHeader = document.createElement('h1');
          nameHeader.textContent = line;
          nameHeader.style.fontSize = '24px';
          nameHeader.style.fontWeight = 'bold';
          nameHeader.style.textAlign = 'center';
          nameHeader.style.marginBottom = '6px';
          nameHeader.style.color = '#1e5180';
          nameHeader.style.fontFamily = 'Arial, sans-serif';
          resumePreviewRef.current.appendChild(nameHeader);
        }
        // Handle contact info (centered on one line)
        else if (index === 1 || index === 2) {
          // Only process the first contact info line
          if (index === 1) {
            const contactDiv = document.createElement('div');
            contactDiv.style.textAlign = 'center';
            contactDiv.style.fontSize = '11px';
            contactDiv.style.marginBottom = '12px';
            contactDiv.style.display = 'flex';
            contactDiv.style.justifyContent = 'center';
            contactDiv.style.alignItems = 'center';
            contactDiv.style.flexWrap = 'wrap';
            
            // Extract contact details from both lines
            const contactInfo = [];
            const line1Parts = resumeLines[1].split(/[•|]/).filter(part => part.trim());
            const line2Parts = index + 1 < resumeLines.length ? resumeLines[2].split(/[•|]/).filter(part => part.trim()) : [];
            
            // Also check if there's a LinkedIn line
            let linkedInInfo = null;
            for (let i = 1; i < 5; i++) {
              if (index + i < resumeLines.length && resumeLines[index + i].includes('LinkedIn')) {
                linkedInInfo = resumeLines[index + i].trim();
                break;
              }
            }
            
            const allParts = [...line1Parts, ...line2Parts];
            if (linkedInInfo) {
              allParts.push(linkedInInfo);
            }
            
            // Process and display all contact information on one line
            allParts.forEach((part, partIndex) => {
              if (part.trim()) {
                // Check if it's an email and make it a mailto link
                if (part.trim().includes('@')) {
                  const emailLink = document.createElement('a');
                  emailLink.href = `mailto:${part.trim()}`;
                  emailLink.textContent = part.trim();
                  emailLink.style.color = '#1e5180';
                  emailLink.style.textDecoration = 'none';
                  contactDiv.appendChild(emailLink);
                } 
                // Check if it's LinkedIn and make it a link
                else if (part.trim().includes('LinkedIn')) {
                  // Try to extract URL if present
                  const match = part.match(/\[([^\]]+)\]/);
                  const linkedInUrl = match ? match[1] : 'https://linkedin.com/in/';
                  const linkedInLink = document.createElement('a');
                  linkedInLink.href = linkedInUrl.startsWith('http') ? linkedInUrl : 'https://' + linkedInUrl;
                  linkedInLink.textContent = 'LinkedIn';
                  linkedInLink.style.color = '#1e5180';
                  linkedInLink.style.textDecoration = 'none';
                  linkedInLink.target = '_blank';
                  contactDiv.appendChild(linkedInLink);
                }
                else {
                  const span = document.createElement('span');
                  span.textContent = part.trim();
                  contactDiv.appendChild(span);
                }
                
                // Add bullet separator between items (except for the last item)
                if (partIndex < allParts.length - 1) {
                  const bullet = document.createElement('span');
                  bullet.textContent = ' • ';
                  bullet.style.margin = '0 4px';
                  contactDiv.appendChild(bullet);
                }
              }
            });
            
            resumePreviewRef.current.appendChild(contactDiv);
            
            // Add a gray horizontal line after contact info
            const grayLine = document.createElement('div');
            grayLine.style.height = '1px';
            grayLine.style.backgroundColor = '#dddddd';
            grayLine.style.width = '100%';
            grayLine.style.margin = '12px 0 20px 0';
            resumePreviewRef.current.appendChild(grayLine);
          }
        }
        // Skip the LinkedIn line since we've already processed it
        else if (line.includes('LinkedIn')) {
          // Do nothing, already handled in contact info
        }
        // Handle job entries (bold job title and dates aligned right)
        else if (line.includes('|') && !line.startsWith('-') && !sectionHeaders.includes(index)) {
          const jobDiv = document.createElement('div');
          jobDiv.style.display = 'flex';
          jobDiv.style.justifyContent = 'space-between';
          jobDiv.style.fontWeight = 'bold';
          jobDiv.style.marginTop = '15px';
          jobDiv.style.marginBottom = '5px';
          
          const parts = line.split('|');
          
          const titleSpan = document.createElement('span');
          titleSpan.textContent = parts[0].trim();
          jobDiv.appendChild(titleSpan);
          
          if (parts.length > 1) {
            const dateSpan = document.createElement('span');
            dateSpan.textContent = parts[1].trim();
            jobDiv.appendChild(dateSpan);
          }
          
          resumePreviewRef.current.appendChild(jobDiv);
        }
        // Handle bullet points
        else if (line.startsWith('-')) {
          const bulletDiv = document.createElement('div');
          bulletDiv.style.display = 'flex';
          bulletDiv.style.marginBottom = '5px';
          bulletDiv.style.paddingLeft = '20px';
          
          const bulletPoint = document.createElement('span');
          bulletPoint.textContent = '•';
          bulletPoint.style.marginRight = '8px';
          bulletPoint.style.minWidth = '8px';
          bulletDiv.appendChild(bulletPoint);
          
          const bulletText = document.createElement('span');
          bulletText.textContent = line.substring(1).trim();
          bulletDiv.appendChild(bulletText);
          
          resumePreviewRef.current.appendChild(bulletDiv);
        }
        // Everything else
        else if (line.trim() && !sectionHeaders.includes(index) && index > 2) {
          const p = document.createElement('p');
          p.textContent = line;
          p.style.margin = '0';
          p.style.marginBottom = '5px';
          resumePreviewRef.current.appendChild(p);
        }
      });
    }
  }, [showResumePreview, resume, defaultResumeTemplate]);

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

  const handleDownloadResumePdf = async () => {
    if (!resume) return;

    // Dynamically import html2pdf only on the client side
    const html2pdf = (await import('html2pdf.js')).default;

    // Create a clean PDF-specific template for resume
    const container = document.createElement('div');
    container.style.width = '210mm';
    container.style.padding = '20mm';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    
    const content = document.createElement('div');
    content.className = 'pdf-content';
    content.style.fontSize = '12px';
    content.style.lineHeight = '1.5';
    content.style.color = '#000';
    content.style.fontFamily = 'Arial, sans-serif';
    
    // Find all section headers to create the proper Harvard-style formatting
    const resumeLines = resume.split('\n');
    const sectionHeaders = [];
    resumeLines.forEach((line, index) => {
      if (line.match(/^[A-Z\s]+$/) && line.trim().length > 0 && index > 2) {
        sectionHeaders.push(index);
      }
    });
    
    // Process each line with Harvard-style formatting
    resumeLines.forEach((line, index) => {
      // Check if this is a section header
      if (sectionHeaders.includes(index)) {
        // Create section header with blue underline
        const headerDiv = document.createElement('div');
        headerDiv.style.marginTop = '20px';
        headerDiv.style.marginBottom = '8px';
        
        const headerText = document.createElement('h2');
        headerText.textContent = line;
        headerText.style.fontSize = '14px';
        headerText.style.fontWeight = 'bold';
        headerText.style.textTransform = 'uppercase';
        headerText.style.margin = '0';
        headerText.style.padding = '0';
        headerText.style.fontFamily = 'Arial, sans-serif';
        headerDiv.appendChild(headerText);
        
        // Add the blue underline
        const underline = document.createElement('div');
        underline.style.height = '1px';
        underline.style.backgroundColor = '#1e5180';
        underline.style.width = '100%';
        underline.style.marginTop = '3px';
        headerDiv.appendChild(underline);
        
        content.appendChild(headerDiv);
      } 
      // Handle name at the top (centered)
      else if (index === 0) {
        const nameHeader = document.createElement('h1');
        nameHeader.textContent = line;
        nameHeader.style.fontSize = '24px';
        nameHeader.style.fontWeight = 'bold';
        nameHeader.style.textAlign = 'center';
        nameHeader.style.marginBottom = '6px';
        nameHeader.style.color = '#1e5180';
        nameHeader.style.fontFamily = 'Arial, sans-serif';
        content.appendChild(nameHeader);
      }
      // Handle contact info (centered on one line)
      else if (index === 1 || index === 2) {
        // Only process the first contact info line
        if (index === 1) {
          const contactDiv = document.createElement('div');
          contactDiv.style.textAlign = 'center';
          contactDiv.style.fontSize = '11px';
          contactDiv.style.marginBottom = '12px';
          contactDiv.style.display = 'flex';
          contactDiv.style.justifyContent = 'center';
          contactDiv.style.alignItems = 'center';
          contactDiv.style.flexWrap = 'wrap';
          
          // Extract contact details from both lines
          const contactInfo = [];
          const line1Parts = resumeLines[1].split(/[•|]/).filter(part => part.trim());
          const line2Parts = index + 1 < resumeLines.length ? resumeLines[2].split(/[•|]/).filter(part => part.trim()) : [];
          
          // Also check if there's a LinkedIn line
          let linkedInInfo = null;
          for (let i = 1; i < 5; i++) {
            if (index + i < resumeLines.length && resumeLines[index + i].includes('LinkedIn')) {
              linkedInInfo = resumeLines[index + i].trim();
              break;
            }
          }
          
          const allParts = [...line1Parts, ...line2Parts];
          if (linkedInInfo) {
            allParts.push(linkedInInfo);
          }
          
          // Process and display all contact information on one line
          allParts.forEach((part, partIndex) => {
            if (part.trim()) {
              // Check if it's an email and make it a mailto link
              if (part.trim().includes('@')) {
                const emailLink = document.createElement('a');
                emailLink.href = `mailto:${part.trim()}`;
                emailLink.textContent = part.trim();
                emailLink.style.color = '#1e5180';
                emailLink.style.textDecoration = 'none';
                contactDiv.appendChild(emailLink);
              } 
              // Check if it's LinkedIn and make it a link
              else if (part.trim().includes('LinkedIn')) {
                // Try to extract URL if present
                const match = part.match(/\[([^\]]+)\]/);
                const linkedInUrl = match ? match[1] : 'https://linkedin.com/in/';
                const linkedInLink = document.createElement('a');
                linkedInLink.href = linkedInUrl.startsWith('http') ? linkedInUrl : 'https://' + linkedInUrl;
                linkedInLink.textContent = 'LinkedIn';
                linkedInLink.style.color = '#1e5180';
                linkedInLink.style.textDecoration = 'none';
                linkedInLink.target = '_blank';
                contactDiv.appendChild(linkedInLink);
              }
              else {
                const span = document.createElement('span');
                span.textContent = part.trim();
                contactDiv.appendChild(span);
              }
              
              // Add bullet separator between items (except for the last item)
              if (partIndex < allParts.length - 1) {
                const bullet = document.createElement('span');
                bullet.textContent = ' • ';
                bullet.style.margin = '0 4px';
                contactDiv.appendChild(bullet);
              }
            }
          });
          
          content.appendChild(contactDiv);
          
          // Add a gray horizontal line after contact info
          const grayLine = document.createElement('div');
          grayLine.style.height = '1px';
          grayLine.style.backgroundColor = '#dddddd';
          grayLine.style.width = '100%';
          grayLine.style.margin = '12px 0 20px 0';
          content.appendChild(grayLine);
        }
      }
      // Skip the LinkedIn line since we've already processed it
      else if (line.includes('LinkedIn')) {
        // Do nothing, already handled in contact info
      }
      // Handle job entries (bold job title and dates aligned right)
      else if (line.includes('|') && !line.startsWith('-') && !sectionHeaders.includes(index)) {
        const jobDiv = document.createElement('div');
        jobDiv.style.display = 'flex';
        jobDiv.style.justifyContent = 'space-between';
        jobDiv.style.fontWeight = 'bold';
        jobDiv.style.marginTop = '15px';
        jobDiv.style.marginBottom = '5px';
        
        const parts = line.split('|');
        
        const titleSpan = document.createElement('span');
        titleSpan.textContent = parts[0].trim();
        jobDiv.appendChild(titleSpan);
        
        if (parts.length > 1) {
          const dateSpan = document.createElement('span');
          dateSpan.textContent = parts[1].trim();
          jobDiv.appendChild(dateSpan);
        }
        
        content.appendChild(jobDiv);
      }
      // Handle bullet points
      else if (line.startsWith('-')) {
        const bulletDiv = document.createElement('div');
        bulletDiv.style.display = 'flex';
        bulletDiv.style.marginBottom = '5px';
        bulletDiv.style.paddingLeft = '20px';
        
        const bulletPoint = document.createElement('span');
        bulletPoint.textContent = '•';
        bulletPoint.style.marginRight = '8px';
        bulletPoint.style.minWidth = '8px';
        bulletDiv.appendChild(bulletPoint);
        
        const bulletText = document.createElement('span');
        bulletText.textContent = line.substring(1).trim();
        bulletDiv.appendChild(bulletText);
        
        content.appendChild(bulletDiv);
      }
      // Everything else
      else if (line.trim() && !sectionHeaders.includes(index) && index > 2) {
        const p = document.createElement('p');
        p.textContent = line;
        p.style.margin = '0';
        p.style.marginBottom = '5px';
        content.appendChild(p);
      }
    });
    
    container.appendChild(content);
    document.body.appendChild(container);
    
    // Add a loading state for PDF generation
    const loadingToast = document.createElement('div');
    loadingToast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50';
    loadingToast.innerText = 'Generating Resume PDF...';
    document.body.appendChild(loadingToast);

    const opt = {
      margin: [0, 0, 0, 0],
      filename: 'resume.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(container).set(opt).save().then(() => {
      // Clean up - remove the temp container
      document.body.removeChild(container);
      
      // Remove the loading toast
      document.body.removeChild(loadingToast);
      
      // Add a success toast
      const successToast = document.createElement('div');
      successToast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50';
      successToast.innerText = 'Resume PDF downloaded successfully!';
      document.body.appendChild(successToast);
      
      // Remove the success toast after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successToast);
      }, 3000);
    });
  };

  const handleDownloadAsPdf = async () => {
    if (!result) return;

    // Dynamically import html2pdf only on the client side
    const html2pdf = (await import('html2pdf.js')).default;

    // Create a clean PDF-specific template
    const container = document.createElement('div');
    container.style.width = '210mm';
    container.style.padding = '20mm';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    
    const content = document.createElement('div');
    content.className = 'pdf-content';
    content.style.fontSize = '12px';
    content.style.lineHeight = '1.5';
    content.style.color = '#000';
    
    // First split by double newlines which separate paragraphs
    // Then for the first 6-7 lines (contact info), we'll treat each line separately
    const sections = result.split('\n\n');
    
    // Process each section
    sections.forEach((section, sectionIndex) => {
      // For the first several sections (contact info), split by single newlines
      if (sectionIndex < 7) {
        const lines = section.split('\n');
        lines.forEach((line) => {
          if (line.trim()) {
            const p = document.createElement('p');
            p.textContent = line.trim();
            p.style.margin = '0';
            p.style.marginBottom = '3px';
            content.appendChild(p);
          }
        });
      } 
      // For Dear line (usually the 7th or 8th section)
      else if (section.includes('Dear')) {
        const p = document.createElement('p');
        p.textContent = section;
        p.style.marginTop = '20px';
        p.style.marginBottom = '15px';
        content.appendChild(p);
      }
      // Regular paragraphs for the rest of the content
      else {
        const p = document.createElement('p');
        p.textContent = section;
        p.style.marginBottom = '15px';
        content.appendChild(p);
      }
    });
    
    container.appendChild(content);
    document.body.appendChild(container);
    
    // Add a loading state for PDF generation
    const loadingToast = document.createElement('div');
    loadingToast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50';
    loadingToast.innerText = 'Generating PDF...';
    document.body.appendChild(loadingToast);

    const opt = {
      margin: [0, 0, 0, 0],
      filename: 'cover-letter.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(container).set(opt).save().then(() => {
      // Clean up - remove the temp container
      document.body.removeChild(container);
      
      // Remove the loading toast
      document.body.removeChild(loadingToast);
      
      // Add a success toast
      const successToast = document.createElement('div');
      successToast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50';
      successToast.innerText = 'PDF downloaded successfully!';
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
    const html2pdf = (await import('html2pdf.js')).default;

    // Create a clean PDF-specific template
    const container = document.createElement('div');
    container.style.width = '210mm';
    container.style.padding = '20mm';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    
    const content = document.createElement('div');
    content.className = 'pdf-content';
    content.style.fontSize = '12px';
    content.style.lineHeight = '1.5';
    content.style.color = '#000';
    
    // Split by double newlines which separate paragraphs
    const sections = followUpEmail.split('\n\n');
    
    // Process each section
    sections.forEach((section, sectionIndex) => {
      // For the subject line (usually the first section)
      if (sectionIndex === 0 && section.toLowerCase().includes('subject:')) {
        const p = document.createElement('p');
        p.textContent = section;
        p.style.fontWeight = 'bold';
        p.style.marginBottom = '20px';
        content.appendChild(p);
      }
      // For all other sections
      else {
        const p = document.createElement('p');
        p.textContent = section;
        p.style.marginBottom = '15px';
        content.appendChild(p);
      }
    });
    
    container.appendChild(content);
    document.body.appendChild(container);
    
    // Add a loading state for PDF generation
    const loadingToast = document.createElement('div');
    loadingToast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg z-50';
    loadingToast.innerText = 'Generating PDF...';
    document.body.appendChild(loadingToast);

    const opt = {
      margin: [0, 0, 0, 0],
      filename: 'follow-up-email.pdf',
      image: { type: 'jpeg', quality: 1 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(container).set(opt).save().then(() => {
      // Clean up - remove the temp container
      document.body.removeChild(container);
      
      // Remove the loading toast
      document.body.removeChild(loadingToast);
      
      // Add a success toast
      const successToast = document.createElement('div');
      successToast.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50';
      successToast.innerText = 'PDF downloaded successfully!';
      document.body.appendChild(successToast);
      
      // Remove the success toast after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successToast);
      }, 3000);
    });
  };
  
  const navigateToJobHub = () => {
    router.push('/job-hub');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-600">Loading your Hire Me Pack...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-lg">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
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
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Here is your Hire-Me Pack!</h1>
          <p className="text-gray-600">Everything you need for your job application</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-10">
          <div className="flex justify-between items-center mb-8">
            <div className="h-4 w-64 bg-gray-200 rounded-full"></div>
            <span className="text-gray-500 text-sm uppercase tracking-wider">HIRE ME PACK</span>
          </div>
          
          <div className="flex flex-col gap-4">
            {/* Top Row: Cover Letter and Resume */}
            <div className="grid grid-cols-2 gap-6">
              {/* Cover Letter Section */}
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm0 2a1 1 0 00-1 1v6a1 1 0 001 1h10a1 1 0 001-1V7a1 1 0 00-1-1H5z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Cover Letter</span>
                  </div>
                  <div className="flex space-x-3">
                    <button className="text-gray-500 hover:text-gray-700 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                      <span className="text-sm">Edit</span>
                    </button>
                    <button 
                      className="text-gray-500 hover:text-gray-700" 
                      onClick={handleDownloadAsPdf}
                      title="Download as PDF"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="h-[300px] overflow-y-auto bg-gray-100 rounded p-3 text-sm">
                  {result && (
                    <div className="prose prose-sm max-w-none" ref={coverLetterRef}>
                      <style jsx global>{`
                        /* Remove all default margins */
                        .cover-letter-content p {
                          margin: 0;
                          line-height: 1.4;
                        }
                        
                        /* Better paragraph spacing for content paragraphs */
                        .cover-letter-content p:not(:first-child):not(:nth-child(2)):not(:nth-child(3)):not(:nth-child(4)):not(:nth-child(5)):not(:nth-child(6)):not(:nth-child(7)) {
                          margin-bottom: 1rem;
                        }
                        
                        /* Add spacing before and after "Dear Hiring Manager" */
                        .cover-letter-content p:nth-child(8) {
                          margin-top: 1.5rem;
                          margin-bottom: 1rem;
                        }
                        
                        /* Special styling for greeting paragraph */
                        .greeting-paragraph {
                          margin-top: 1.5rem !important;
                          margin-bottom: 1rem !important;
                        }
                      `}</style>
                      <div className="cover-letter-content text-[0.85rem]">
                        <ReactMarkdown
                          components={{
                            p: ({node, children, ...props}) => {
                              const content = node.children
                                .filter(child => child.type === 'text')
                                .map(child => child.value)
                                .join('');
                              
                              const isDearParagraph = content.includes('Dear');
                              
                              return (
                                <p 
                                  {...props} 
                                  className={isDearParagraph ? 'greeting-paragraph' : ''}
                                >
                                  {children}
                                </p>
                              );
                            }
                          }}
                        >
                          {result}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Resume Section */}
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                    <span className="font-medium">Resume</span>
                  </div>
                  <div className="flex space-x-3">
                    <button 
                      className="text-gray-500 hover:text-gray-700 flex items-center"
                      onClick={handleCopyResumeToClipboard}
                      title="Copy to clipboard"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                      </svg>
                      <span className="text-sm">Copy</span>
                    </button>
                    <button 
                      className="text-gray-500 hover:text-gray-700 flex items-center" 
                      onClick={() => setShowResumePreview(true)}
                      title="Preview"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      <span className="text-sm">Preview</span>
                    </button>
                    <button 
                      className="text-gray-500 hover:text-gray-700" 
                      onClick={handleDownloadResumePdf}
                      title="Download as PDF"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="h-[300px] bg-gray-50 rounded relative">
                  <div className="relative h-full">
                    {resume ? (
                      <div 
                        className="w-full h-full p-4 overflow-auto text-sm" 
                        ref={resumeRef}
                        style={{ 
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'Arial, sans-serif'
                        }}
                      >
                        <ReactMarkdown>
                          {resume}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <pre 
                        className="w-full h-full p-4 overflow-auto text-sm font-mono"
                        style={{ 
                          whiteSpace: 'pre-wrap',
                          fontFamily: 'Georgia, serif',
                          textAlign: 'left'
                        }}
                      >
                        {defaultResumeTemplate}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bottom Row: Follow-up Email (Centered) */}
            <div className="w-2/5 mx-auto">
              {/* Follow-up Email Section */}
              <div className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                      <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
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
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
                      </svg>
                      <span className="text-sm">{copiedEmail ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button 
                      className="text-gray-500 hover:text-gray-700" 
                      onClick={handleDownloadEmailAsPdf}
                      title="Download as PDF"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="h-[300px] overflow-y-auto bg-gray-100 rounded p-3 text-sm">
                  {followUpEmail ? (
                    <div className="prose prose-sm max-w-none" ref={followUpEmailRef}>
                      <style jsx global>{`
                        /* Remove all default margins */
                        .email-content p {
                          margin: 0;
                          line-height: 1.4;
                        }
                        
                        /* Better paragraph spacing for content paragraphs */
                        .email-content p:not(:first-child) {
                          margin-bottom: 1rem;
                        }
                        
                        /* Special styling for subject line */
                        .email-content p:first-child {
                          font-weight: bold;
                          margin-bottom: 1.5rem;
                        }
                      `}</style>
                      <div className="email-content text-[0.85rem]">
                        <ReactMarkdown>
                          {followUpEmail}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-400">No follow-up email generated</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Review Section */}
        <div className="flex flex-col items-center mt-12 mb-8">
          <div className="flex mb-2">⭐⭐⭐⭐⭐</div>
          <p className="text-center text-gray-700 max-w-2xl mb-4">
            "JobApplyAI transformed my job search completely! The tailored resume and cover letter helped me land interviews at top tech companies. The follow-up email was the perfect finishing touch - I got my dream job within 3 weeks!"
          </p>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-[#7046EC] rounded-full flex items-center justify-center text-white font-semibold mr-2">
              M
            </div>
            <span className="font-medium">Michael T.</span>
          </div>
        </div>
        
        {/* Resume Preview Modal */}
        {showResumePreview && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-xl font-semibold">Resume Preview</h3>
                <button 
                  onClick={() => setShowResumePreview(false)}
                  className="text-gray-500 hover:text-gray-700"
                  aria-label="Close preview"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-8 bg-gray-100 flex justify-center">
                <div 
                  className="w-[210mm] h-[297mm] bg-white shadow-lg p-[20mm] overflow-hidden flex-shrink-0"
                  style={{ 
                    fontFamily: 'Arial, sans-serif',
                  }}
                >
                  <div 
                    ref={resumePreviewRef}
                    className="pdf-content"
                    style={{ 
                      fontSize: '12px',
                      lineHeight: '1.5',
                      color: '#000',
                      fontFamily: 'Arial, sans-serif'
                    }}
                  >
                    {/* Content will be populated by useEffect */}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex justify-between">
                <div className="text-sm text-gray-500">
                  PDF preview showing exact A4 layout and formatting
                </div>
                <button 
                  onClick={() => setShowResumePreview(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center mt-8">
          <button 
            onClick={navigateToJobHub}
            className="px-6 py-3 bg-purple-500 text-white rounded-full text-base font-medium hover:bg-purple-600 transition-colors flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Create Another Application
          </button>
        </div>
      </div>
    </div>
  );
} 