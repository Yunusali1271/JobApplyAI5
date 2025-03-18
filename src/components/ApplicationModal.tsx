import { useState } from 'react';
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
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  
  if (!isOpen) return null;

  const formalityOptions = [
    { value: 'informal', label: 'Informal', position: '20%' },
    { value: 'semi-casual', label: 'Semi-Casual', position: '40%' },
    { value: 'neutral', label: 'Neutral', position: '60%' },
    { value: 'semi-formal', label: 'Semi-Formal', position: '80%' },
    { value: 'formal', label: 'Formal', position: '100%' }
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

  const handleJobTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJobTitle(e.target.value);
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompany(e.target.value);
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

    if (!jobTitle.trim()) {
      alert('Please enter a job title');
      return;
    }

    if (!company.trim()) {
      alert('Please enter the company name');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Prepare data to send to OpenAI API
      const data = {
        cv: cvText,
        jobDescription,
        formality
      };
      
      console.log('Sending data to OpenAI API:');
      console.log('CV length:', cvText.length);
      console.log('Job Description length:', jobDescription.length);
      console.log('Formality:', formality);
      
      // Call the API route that will interact with OpenAI
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
      
      // Handle the response
      const result = await response.json();
      
      if (!result.result) {
        throw new Error('No result returned from API');
      }
      
      // Store the results in localStorage for immediate use
      localStorage.setItem('cvAnalysisResult', result.result);
      localStorage.setItem('jobTitle', jobTitle);
      localStorage.setItem('company', company);
      localStorage.setItem('cv', cvText);
      localStorage.setItem('jobDescription', jobDescription);
      localStorage.setItem('formality', formality);
      
      if (result.followUpEmail) {
        localStorage.setItem('followUpEmail', result.followUpEmail);
      }
      if (result.resume) {
        localStorage.setItem('resume', result.resume);
      }
      
      // Save to Firebase if user is logged in
      if (user) {
        try {
          await saveApplicationKit(user.uid, {
            jobTitle: jobTitle,
            company: company,
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
          // Continue with the flow even if Firebase save fails
        }
      }
      
      // Close the modal
      onClose();
      
      // Navigate to the results page
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
          <h2 className="text-xl font-bold text-center mb-6">Create a new application kit</h2>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="font-medium mb-2">Job Details</p>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="e.g. Software Engineer"
                  value={jobTitle}
                  onChange={handleJobTitleChange}
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  placeholder="e.g. Google"
                  value={company}
                  onChange={handleCompanyChange}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>
          
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
            <p className="font-medium mb-2">Job Description you'd like to tailor the application kit to</p>
            <textarea 
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[150px]" 
              placeholder="Copy and paste the job description here"
              value={jobDescription}
              onChange={handleJobDescriptionChange}
              disabled={isProcessing}
            />
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-6">
            <p className="font-medium mb-2">Select formality level</p>
            <div className="mb-2 relative">
              <div className="w-full bg-gray-300 h-2 rounded-full">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: formality === 'informal' ? '20%' : 
                           formality === 'semi-casual' ? '40%' : 
                           formality === 'neutral' ? '60%' : 
                           formality === 'semi-formal' ? '80%' : '100%' }}
                />
                <div className="absolute -top-1 left-0 w-full flex justify-between">
                  {formalityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFormalityChange(option.value)}
                      className={`w-5 h-5 rounded-full ${formality === option.value ? 'bg-purple-500' : 'bg-white border-2 border-gray-300'}`}
                      style={{ transform: 'translateX(-50%)', left: option.position }}
                      disabled={isProcessing}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm mt-4">
              {formalityOptions.map((option) => (
                <span 
                  key={option.value}
                  className={`${formality === option.value ? 'font-medium text-purple-500' : 'text-gray-500'}`}
                >
                  {option.label}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
              disabled={isProcessing}
            >
              Close
            </button>
            <button 
              onClick={handleGenerateClick}
              className={`px-6 py-2 bg-purple-500 text-white rounded-lg font-medium flex items-center hover:bg-purple-600 transition-colors ${isProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 