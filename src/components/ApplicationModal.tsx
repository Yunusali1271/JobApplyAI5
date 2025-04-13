/* eslint-disable react/no-unescaped-entities */
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { saveApplicationKit } from '@/lib/firebase/applicationKitUtils';
import { Upload } from 'antd';
import CvText from './CvText';
import JobDescription from './JobDescription';

const { Dragger } = Upload;
interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationModal({
  isOpen,
  onClose,
}: ApplicationModalProps) {
  const { user } = useAuth();
  const [formality, setFormality] = useState('informal');
  const [cvText, setCvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [jobDescription, setJobDescription] = useState('');
  const [extractedJobDetails, setExtractedJobDetails] = useState({
    jobTitle: '',
    company: '',
  });
  const [isExtractingDetails, setIsExtractingDetails] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(
    null
  );


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
    { value: 'professional', label: 'Professional', position: '100%' },
  ];

  const handleFormalityChange = (value: string) => {
    setFormality(value);
  };

  const handleCvTextChange = (value: string) => {
    setCvText(value);
  };

  const handleJobDescriptionChange = (
    value:string
  ) => {
    setJobDescription(value);
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

    if (!extractedJobDetails?.jobTitle || !extractedJobDetails?.company) {
      alert('Please wait for job details to be extracted');
      return;
    }

    // Clear previous results from localStorage to avoid stale data
    localStorage.removeItem('cvAnalysisResult');
    localStorage.removeItem('followUpEmail');
    localStorage.removeItem('resume');
    localStorage.removeItem('jobTitle');
    localStorage.removeItem('company');
    localStorage.removeItem('cv');
    localStorage.removeItem('jobDescription');
    localStorage.removeItem('formality');

    setIsProcessing(true);

    try {
      const data = {
        cv: cvText,
        jobDescription,
        formality,
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

      // Store the results in localStorage immediately
      localStorage.setItem('cvAnalysisResult', result.result);
      localStorage.setItem('jobTitle', extractedJobDetails?.jobTitle);
      localStorage.setItem('company', extractedJobDetails?.company);
      localStorage.setItem('cv', cvText);
      localStorage.setItem('jobDescription', jobDescription);
      localStorage.setItem('formality', formality);

      if (result.followUpEmail) {
        localStorage.setItem('followUpEmail', result.followUpEmail);
      }
      if (result.resume) {
        localStorage.setItem('resume', result.resume);
      }

      // Always reset processing state once data is ready
      setIsProcessing(false);
      
      // Create a success message
      const successToast = document.createElement("div");
      successToast.className = "fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center";
      successToast.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span>Your Hire Me Pack was created successfully! Redirecting...</span>
      `;
      document.body.appendChild(successToast);
      
      // Close modal immediately
      onClose();
      
      // Redirect immediately to results page
      window.location.href = '/results';
      
      // If user is logged in, save to Firebase in the background without blocking UI
      if (user) {
        try {
          // This happens after redirect, so it doesn't block the UI
          setTimeout(async () => {
            try {
              await saveApplicationKit(user.uid, {
                jobTitle: extractedJobDetails?.jobTitle,
                company: extractedJobDetails?.company,
                status: 'Interested',
                coverLetter: result.result,
                resume: result.resume || '',
                followUpEmail: result.followUpEmail || '',
                original: {
                  cv: cvText,
                  jobDescription: jobDescription,
                  formality: formality,
                },
              });
              console.log('Successfully saved to Firebase in background');
            } catch (error) {
              console.error('Error saving to Firebase in background:', error);
            }
          }, 100);
        } catch (error) {
          console.error('Error setting up Firebase save:', error);
          // Continue without blocking the UI
        }
      }
    } catch (error) {
      console.error('Error with OpenAI processing:', error);
      alert(`Error processing your request: ${error}. Please try again.`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 text-black bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-center mb-6">
            {window.location.pathname.includes('job-hub') ? 'Create New Hire Me Pack' : 'Create a new Hire Me Pack'}
          </h2>

          <CvText
            cvText={cvText}
            handleCvTextChange={handleCvTextChange}
            isProcessing={isProcessing}
            setFile={setFile}
          />
          <JobDescription
            jobDescription={jobDescription}
            handleJobDescriptionChange={handleJobDescriptionChange}
            isProcessingisProcessing
            isExtractingDetails={isExtractingDetails}
            extractedJobDetails={extractedJobDetails}
            setJobDescriptionFile={setJobDescriptionFile}
          />

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
                    width:
                      formality === 'informal'
                        ? '0%'
                        : formality === 'casual'
                        ? '25%'
                        : formality === 'standard'
                        ? '50%'
                        : formality === 'formal'
                        ? '75%'
                        : '100%',
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
                      const percentage = Math.max(
                        0,
                        Math.min(100, (x / rect.width) * 100)
                      );

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
                        ${
                          formality === option.value
                            ? 'bg-purple-500 ring-2 ring-purple-200 ring-offset-2'
                            : 'bg-white border border-gray-300 hover:border-purple-300'
                        }`}
                      style={{
                        transform: 'translateX(-50%)',
                        left: option.position,
                      }}
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
                    ${
                      formality === option.value
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
              disabled={
                isProcessing ||
                isExtractingDetails ||
                !extractedJobDetails?.jobTitle ||
                !extractedJobDetails?.company
              }
              className={`px-6 py-2 bg-purple-600 text-white rounded-lg flex items-center space-x-2
                ${
                  isProcessing ||
                  isExtractingDetails ||
                  !extractedJobDetails?.jobTitle ||
                  !extractedJobDetails?.company
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-purple-700'
                }`}
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
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
