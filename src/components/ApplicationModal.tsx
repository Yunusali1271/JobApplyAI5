import { useState, useEffect } from 'react';
import { useAuth } from "@/lib/hooks/useAuth";
import { saveApplicationKit } from "@/lib/firebase/applicationKitUtils";
import { useRouter } from "next/navigation";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationModal({ isOpen, onClose }: ApplicationModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [formality, setFormality] = useState('informal');
  const [cvText, setCvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [extractedJobDetails, setExtractedJobDetails] = useState({ jobTitle: '', company: '' });
  const [isExtractingDetails, setIsExtractingDetails] = useState(false);
  
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

    // Debounce the extraction to avoid too many API calls
    const timeoutId = setTimeout(extractJobDetails, 1000);
    return () => clearTimeout(timeoutId);
  }, [jobDescription]);

  if (!isOpen) return null;

  const formalityOptions = [
    { value: 'informal', label: 'Informal', position: '0%' },
    { value: 'casual', label: 'Casual', position: '25%' },
    { value: 'standard', label: 'Standard', position: '50%' },
    { value: 'formal', label: 'Formal', position: '75%' },
    { value: 'professional', label: 'Professional', position: '100%' }
  ];

  const handleFormalityChange = (value: string) => {
    setFormality(value);
  };

  const handleCvTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCvText(e.target.value);
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value);
  };

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
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="font-medium mb-2">Enter your CV text</p>
            <textarea 
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[150px]" 
              placeholder="Copy and paste your CV text here"
              value={cvText}
              onChange={handleCvTextChange}
              disabled={isProcessing}
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
              disabled={isProcessing}
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
            <div className="mb-4 relative">
              <div 
                className="w-full bg-gray-200 h-1 rounded-full cursor-pointer"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = (x / rect.width) * 100;
                  let newFormality = 'standard';
                  if (percentage <= 12.5) newFormality = 'informal';
                  else if (percentage <= 37.5) newFormality = 'casual';
                  else if (percentage <= 62.5) newFormality = 'standard';
                  else if (percentage <= 87.5) newFormality = 'formal';
                  else newFormality = 'professional';
                  handleFormalityChange(newFormality);
                }}
              >
                <div 
                  className="bg-purple-500 h-1 rounded-full transition-all duration-200"
                  style={{ 
                    width: formality === 'informal' ? '0%' : 
                           formality === 'casual' ? '25%' : 
                           formality === 'standard' ? '50%' : 
                           formality === 'formal' ? '75%' : '100%' 
                  }}
                />
                <div 
                  className="absolute -top-2 left-0 w-full flex justify-between"
                  onMouseDown={(e) => {
                    if (isProcessing) return;
                    const slider = e.currentTarget.parentElement;
                    if (!slider) return;
                    
                    const handleDrag = (moveEvent: MouseEvent) => {
                      const rect = slider.getBoundingClientRect();
                      const x = moveEvent.clientX - rect.left;
                      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                      
                      let newFormality = 'standard';
                      if (percentage <= 12.5) newFormality = 'informal';
                      else if (percentage <= 37.5) newFormality = 'casual';
                      else if (percentage <= 62.5) newFormality = 'standard';
                      else if (percentage <= 87.5) newFormality = 'formal';
                      else newFormality = 'professional';
                      
                      handleFormalityChange(newFormality);
                    };

                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleDrag);
                      document.removeEventListener('mouseup', handleMouseUp);
                      document.body.style.cursor = 'default';
                    };

                    document.addEventListener('mousemove', handleDrag);
                    document.addEventListener('mouseup', handleMouseUp);
                    document.body.style.cursor = 'grabbing';
                  }}
                >
                  {formalityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFormalityChange(option.value)}
                      className={`w-4 h-4 rounded-full transition-all duration-200 transform hover:scale-110 cursor-grab active:cursor-grabbing
                        ${formality === option.value 
                          ? 'bg-purple-500 ring-2 ring-purple-200 ring-offset-2' 
                          : 'bg-white border border-gray-300 hover:border-purple-300'
                        }`}
                      style={{ transform: 'translateX(-50%)', left: option.position }}
                      disabled={isProcessing}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              {formalityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleFormalityChange(option.value)}
                  className={`transition-colors duration-200 px-2 py-1 rounded hover:bg-purple-50
                    ${formality === option.value 
                      ? 'text-purple-600 font-medium' 
                      : 'text-gray-500 hover:text-purple-500'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateClick}
              disabled={isProcessing || isExtractingDetails || !extractedJobDetails.jobTitle || !extractedJobDetails.company}
              className={`px-6 py-2 bg-purple-600 text-white rounded-lg flex items-center space-x-2
                ${(isProcessing || isExtractingDetails || !extractedJobDetails.jobTitle || !extractedJobDetails.company) ? 
                  'opacity-50 cursor-not-allowed' : 'hover:bg-purple-700'}`}
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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