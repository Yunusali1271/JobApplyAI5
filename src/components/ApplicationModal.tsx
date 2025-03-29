import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from "@/lib/hooks/useAuth";
import { useIpLimits } from "@/lib/hooks/useIpLimits";
import { saveApplicationKit } from "@/lib/firebase/applicationKitUtils";
import { useRouter } from "next/navigation";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationModal({ isOpen, onClose }: ApplicationModalProps) {
  const { user } = useAuth();
  const { hasCreatedPack, isLoading: checkingIpLimit, error: ipError, recordPackCreation } = useIpLimits();
  const router = useRouter();
  const [formality, setFormality] = useState('standard');
  const [cvText, setCvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [extractedJobDetails, setExtractedJobDetails] = useState({ jobTitle: '', company: '' });
  const [isExtractingDetails, setIsExtractingDetails] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const formalityOptions = [
    { value: 'informal', label: 'Informal', position: 0 },
    { value: 'casual', label: 'Casual', position: 25 },
    { value: 'standard', label: 'Standard', position: 50 },
    { value: 'formal', label: 'Formal', position: 75 },
    { value: 'professional', label: 'Professional', position: 100 }
  ];

  // Find percentage for the slider and get formality value
  const getPercentageAndFormality = (clientX: number) => {
    if (!trackRef.current) return { percentage: 50, value: 'standard' };
    
    const rect = trackRef.current.getBoundingClientRect();
    const rawPercentage = ((clientX - rect.left) / rect.width) * 100;
    const percentage = Math.max(0, Math.min(100, rawPercentage));
    
    let value = 'standard';
    if (percentage < 12.5) value = 'informal';
    else if (percentage < 37.5) value = 'casual';
    else if (percentage < 62.5) value = 'standard';
    else if (percentage < 87.5) value = 'formal';
    else value = 'professional';
    
    return { percentage, value };
  };

  // Handle track click
  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if ((hasCreatedPack && !user) || isProcessing || isDragging.current) return;
    
    const { value } = getPercentageAndFormality(e.clientX);
    setFormality(value);
  }, [hasCreatedPack, user, isProcessing]);

  // Handle thumb drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((hasCreatedPack && !user) || isProcessing) return;
    
    e.preventDefault();
    isDragging.current = true;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      
      const { value } = getPercentageAndFormality(moveEvent.clientX);
      setFormality(value);
    };
    
    const handleMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [hasCreatedPack, user, isProcessing]);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((hasCreatedPack && !user) || isProcessing) return;
    
    e.preventDefault();
    isDragging.current = true;
    
    const handleTouchMove = (moveEvent: TouchEvent) => {
      if (!isDragging.current || !moveEvent.touches[0]) return;
      
      const { value } = getPercentageAndFormality(moveEvent.touches[0].clientX);
      setFormality(value);
    };
    
    const handleTouchEnd = () => {
      isDragging.current = false;
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  }, [hasCreatedPack, user, isProcessing]);

  // Setup rest of component (job description extraction, etc.)
  useEffect(() => {
    const extractJobDetails = async () => {
      if (!jobDescription.trim()) {
        setExtractedJobDetails({ jobTitle: '', company: '' });
        return;
      }

      setIsExtractingDetails(true);
      try {
        const response = await fetch('/api/openai/extract-job-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobDescription }),
        });

        if (!response.ok) {
          throw new Error('Failed to extract job details');
        }

        const data = await response.json();
        setExtractedJobDetails({
          jobTitle: data.jobTitle === 'Unknown' ? '' : data.jobTitle,
          company: data.company === 'Unknown' ? '' : data.company,
        });
      } catch (error) {
        console.error('Error extracting job details:', error);
      } finally {
        setIsExtractingDetails(false);
      }
    };

    const timeoutId = setTimeout(extractJobDetails, 1000);
    return () => clearTimeout(timeoutId);
  }, [jobDescription]);

  if (!isOpen) return null;

  // Get position for the thumb
  const getThumbPosition = () => {
    switch (formality) {
      case 'informal': return '0%';
      case 'casual': return '25%';
      case 'standard': return '50%';
      case 'formal': return '75%';
      case 'professional': return '100%';
      default: return '50%';
    }
  };

  const handleCvTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCvText(e.target.value);
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

  // Generate button click handler
  const handleGenerateClick = async () => {
    if (!cvText.trim()) {
      alert('Please enter your CV text');
      return;
    }

    if (!jobDescription.trim()) {
      alert('Please enter a job description');
      return;
    }

    if (!extractedJobDetails.jobTitle || !extractedJobDetails.company) {
      alert('Please wait for job details to be extracted');
      return;
    }
    
    if (!user) {
      const allowed = await recordPackCreation();
      if (!allowed) {
        return;
      }
    }

    setIsProcessing(true);
    
    try {
      const data = {
        cv: cvText,
        jobDescription,
        formality
      };
      
      const response = await fetch('/api/openai/analyze-cv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error || 'Unknown error'}`);
      }
      
      const result = await response.json();
      
      if (!result.result) {
        throw new Error('No result returned from API');
      }
      
      localStorage.setItem('cvAnalysisResult', result.result);
      localStorage.setItem('jobTitle', extractedJobDetails.jobTitle);
      localStorage.setItem('company', extractedJobDetails.company);
      localStorage.setItem('cv', cvText);
      localStorage.setItem('jobDescription', jobDescription);
      localStorage.setItem('formality', formality);
      
      if (result.followUpEmail) {
        localStorage.setItem('followUpEmail', result.followUpEmail);
      }
      if (result.resume) {
        localStorage.setItem('resume', result.resume);
      }
      
      if (user) {
        try {
          await saveApplicationKit(user.uid, {
            jobTitle: extractedJobDetails.jobTitle,
            company: extractedJobDetails.company,
            status: "Interested",
            coverLetter: result.result,
            resume: result.resume || "",
            followUpEmail: result.followUpEmail || "",
            original: {
              cv: cvText,
              jobDescription: jobDescription,
              formality: formality
            }
          });
        } catch (error) {
          console.error("Error saving to Firebase:", error);
        }
      }
      
      onClose();
      window.location.href = '/results';
      
    } catch (error) {
      console.error('Error with OpenAI processing:', error);
      alert(`Error processing your request: ${error.message}. Please try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-center mb-6">Create a new Hire Me Pack</h2>
          
          {hasCreatedPack && !user && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">You have already created a Hire Me Pack. Please log in to create more.</p>
              <p className="text-sm mt-2">
                <a href="/login" className="text-blue-600 font-medium">
                  Log in or create an account
                </a> to create unlimited Hire Me Packs.
              </p>
            </div>
          )}
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="font-medium mb-2">Enter your CV text</p>
            <textarea 
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[150px]" 
              placeholder="Copy and paste your CV text here"
              value={cvText}
              onChange={handleCvTextChange}
              disabled={isProcessing || (hasCreatedPack && !user)}
            />
            <p className="text-xs text-gray-500 mt-2">
              Include your name, contact information, skills, education, and work experience
            </p>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="font-medium mb-2">Job Description you'd like to tailor your application to</p>
            <textarea 
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[150px]" 
              placeholder="Copy and paste the job description here"
              value={jobDescription}
              onChange={handleJobDescriptionChange}
              disabled={isProcessing || (hasCreatedPack && !user)}
            />
            {isExtractingDetails && (
              <p className="text-sm text-purple-600 mt-2">
                Extracting job details...
              </p>
            )}
            {(extractedJobDetails.jobTitle || extractedJobDetails.company) && !isExtractingDetails && (
              <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  Detected Job Details:
                </p>
                <p className="text-sm text-gray-600">
                  {extractedJobDetails.jobTitle && (
                    <span className="block">Title: {extractedJobDetails.jobTitle}</span>
                  )}
                  {extractedJobDetails.company && (
                    <span className="block">Company: {extractedJobDetails.company}</span>
                  )}
                </p>
              </div>
            )}
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="font-medium mb-4">Select formality level</p>
            
            {/* Minimal Slider */}
            <div className="mt-6 mb-2">
              {/* Track */}
              <div 
                ref={trackRef}
                className="w-full h-1 bg-gray-200 rounded-full relative cursor-pointer mb-6"
                onClick={handleTrackClick}
              >
                {/* Colored track portion */}
                <div 
                  className="absolute top-0 left-0 h-1 bg-purple-600 rounded-full"
                  style={{ width: getThumbPosition() }}
                ></div>
                
                {/* Thumb - small and minimal */}
                <div
                  className="absolute top-0 h-4 w-4 -mt-1.5 -ml-2 bg-purple-600 rounded-full cursor-grab active:cursor-grabbing"
                  style={{ left: getThumbPosition() }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                  role="slider"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={formalityOptions.find(o => o.value === formality)?.position || 50}
                  aria-valuetext={formality}
                  tabIndex={0}
                  aria-label="Formality level"
                ></div>
              </div>
              
              {/* Simple text labels only */}
              <div className="flex justify-between w-full">
                {formalityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`text-xs ${
                      formality === option.value 
                        ? 'font-medium text-purple-600' 
                        : 'text-gray-500'
                    }`}
                    onClick={() => setFormality(option.value)}
                    disabled={isProcessing || (hasCreatedPack && !user)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-between pt-4 mt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isProcessing || (hasCreatedPack && !user)}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateClick}
              disabled={isProcessing || isExtractingDetails || !extractedJobDetails.jobTitle || !extractedJobDetails.company || (hasCreatedPack && !user)}
              className={`px-6 py-2 bg-purple-600 text-white rounded-lg flex items-center space-x-2
                ${(isProcessing || isExtractingDetails || !extractedJobDetails.jobTitle || !extractedJobDetails.company || (hasCreatedPack && !user)) ? 
                  'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'}`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                'Generate Hire Me Pack'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 