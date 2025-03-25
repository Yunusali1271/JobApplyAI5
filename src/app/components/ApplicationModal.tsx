"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { createApplicationKit } from "@/lib/firebase/applicationKitUtils";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ApplicationModal({ isOpen, onClose }: ApplicationModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [resume, setResume] = useState("");
  const [formality, setFormality] = useState("informal");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      // Call your API to analyze the CV and job description
      const response = await fetch("/api/openai/analyze-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cv: resume,
          jobDescription,
          formality,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze application");
      }

      const data = await response.json();

      // Create a new application kit with the generated content
      await createApplicationKit(user.uid, {
        jobTitle: "New Position", // You might want to extract this from the job description
        company: "Company Name", // You might want to extract this from the job description
        status: "Interested",
        coverLetter: data.result,
        resume: data.resume,
        followUpEmail: data.followUpEmail,
        createdAt: new Date(),
      });

      onClose();
      window.location.reload(); // Refresh to show the new kit
    } catch (error) {
      console.error("Error creating application kit:", error);
      alert("Failed to create application kit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-semibold text-center mb-6">Create a new Hire Me Pack</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* CV Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg mb-2">Enter your CV text</h3>
              <textarea
                value={resume}
                onChange={(e) => setResume(e.target.value)}
                className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Copy and paste your CV text here"
                required
              />
              <p className="text-sm text-gray-500 mt-2">
                Include your name, contact information, skills, education, and work experience
              </p>
            </div>

            {/* Job Description Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg mb-2">Job Description you'd like to tailor your application to</h3>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full h-40 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="Copy and paste the job description here"
                required
              />
            </div>

            {/* Formality Level Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg mb-4">Select formality level</h3>
              <div className="flex items-center justify-between relative">
                {/* Progress Bar Background */}
                <div className="absolute h-1 bg-gray-200 left-0 right-0 top-1/2 -translate-y-1/2"></div>
                
                {/* Formality Options */}
                <div className="flex justify-between w-full relative">
                  {["Informal", "Casual", "Standard", "Formal", "Professional"].map((level, index) => (
                    <div key={level} className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={() => setFormality(level.toLowerCase())}
                        className={`w-4 h-4 rounded-full ${
                          formality === level.toLowerCase()
                            ? "bg-indigo-600 ring-4 ring-indigo-100"
                            : "bg-gray-300"
                        } mb-2 relative z-10`}
                      />
                      <span className={`text-sm ${
                        formality === level.toLowerCase()
                          ? "text-indigo-600"
                          : "text-gray-500"
                      }`}>
                        {level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Hire Me Pack"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 