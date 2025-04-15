import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

interface ResumeEditFormProps {
  resume: any;
  onSave: (updatedResume: any) => void;
  onCancel: () => void;
}

// Define a ref type that exposes a submit method
export interface ResumeFormRef {
  submitForm: () => void;
}

const ResumeEditForm = forwardRef<ResumeFormRef, ResumeEditFormProps>(({ resume, onSave, onCancel }, ref) => {
  const [formData, setFormData] = useState(resume);

  useEffect(() => {
    setFormData(resume);
  }, [resume]);

  // Expose the submitForm method to the parent component
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      onSave(formData);
    }
  }));

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      personalInformation: {
        ...formData.personalInformation,
        [name]: value
      }
    });
  };

  const handleExperienceChange = (index: number, field: string, value: string) => {
    const updatedExperience = [...formData.professionalExperience];
    updatedExperience[index] = {
      ...updatedExperience[index],
      [field]: value
    };
    setFormData({
      ...formData,
      professionalExperience: updatedExperience
    });
  };

  const handleResponsibilityChange = (expIndex: number, respIndex: number, field: string, value: string) => {
    const updatedExperience = [...formData.professionalExperience];
    if (field === 'category') {
      updatedExperience[expIndex].responsibilities[respIndex].category = value;
    }
    setFormData({
      ...formData,
      professionalExperience: updatedExperience
    });
  };

  const handleDetailChange = (expIndex: number, respIndex: number, detailIndex: number, value: string) => {
    const updatedExperience = [...formData.professionalExperience];
    updatedExperience[expIndex].responsibilities[respIndex].details[detailIndex] = value;
    setFormData({
      ...formData,
      professionalExperience: updatedExperience
    });
  };

  const handleEducationChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      education: {
        ...formData.education,
        [field]: value
      }
    });
  };

  const handleEducationConcentrationsChange = (value: string) => {
    setFormData({
      ...formData,
      education: {
        ...formData.education,
        concentrations: value.split(',').map((item: string) => item.trim())
      }
    });
  };

  const handleEducationAchievementChange = (index: number, value: string) => {
    const updatedAchievements = [...(formData.education?.achievements || [])];
    updatedAchievements[index] = value;
    setFormData({
      ...formData,
      education: {
        ...formData.education,
        achievements: updatedAchievements
      }
    });
  };

  const handleAddEducationAchievement = () => {
    setFormData({
      ...formData,
      education: {
        ...formData.education,
        achievements: [...(formData.education?.achievements || []), ""]
      }
    });
  };

  const handleRemoveEducationAchievement = (index: number) => {
    const updatedAchievements = [...(formData.education?.achievements || [])];
    updatedAchievements.splice(index, 1);
    setFormData({
      ...formData,
      education: {
        ...formData.education,
        achievements: updatedAchievements
      }
    });
  };

  const handleSkillsChange = (field: string, value: string) => {
    // For fields that are arrays, split by commas
    if (field === 'interests' || field === 'technical') {
      setFormData({
        ...formData,
        skillsAndInterests: {
          ...formData.skillsAndInterests,
          [field]: value.split(',').map((item: string) => item.trim())
        }
      });
    } 
    // Handle languages separately as they have a nested structure
    else if (field === 'native' || field === 'fluent') {
      setFormData({
        ...formData,
        skillsAndInterests: {
          ...formData.skillsAndInterests,
          languages: {
            ...formData.skillsAndInterests.languages,
            [field]: value.split(',').map((item: string) => item.trim())
          }
        }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Handle key press events to submit form on Enter only when within input fields
  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Allow Enter key to work normally in textarea elements
    if (e.key === 'Enter' && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm" onKeyPress={handleKeyPress}>
      <div className="border-b pb-3">
        <h3 className="font-semibold text-md mb-2 text-gray-800">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.personalInformation?.name || ''}
              onChange={handlePersonalInfoChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.personalInformation?.email || ''}
              onChange={handlePersonalInfoChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.personalInformation?.phone || ''}
              onChange={handlePersonalInfoChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">LinkedIn</label>
            <input
              type="text"
              name="linkedin"
              value={formData.personalInformation?.linkedin || ''}
              onChange={handlePersonalInfoChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.personalInformation?.address || ''}
              onChange={handlePersonalInfoChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="border-b pb-3">
        <h3 className="font-semibold text-md mb-2 text-gray-800">Professional Experience</h3>
        {formData.professionalExperience?.map((exp: any, index: number) => (
          <div key={index} className="mb-4 border p-3 rounded">
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div>
                <label className="block text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={exp.company || ''}
                  onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  value={exp.position || ''}
                  onChange={(e) => handleExperienceChange(index, 'position', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={exp.location || ''}
                  onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={exp.duration || ''}
                  onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {/* Responsibilities */}
            <div className="mt-3">
              <h4 className="font-medium text-gray-700 mb-2">Responsibilities</h4>
              {exp.responsibilities?.map((resp: any, respIndex: number) => (
                <div key={respIndex} className="mb-4 border-l-2 pl-3 border-gray-300">
                  <input
                    type="text"
                    value={resp.category || ''}
                    onChange={(e) => handleResponsibilityChange(index, respIndex, 'category', e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                    placeholder="Responsibility Category"
                  />
                  
                  {/* Details */}
                  <div className="pl-3">
                    <h5 className="text-xs text-gray-600 mb-1">Details</h5>
                    {resp.details?.map((detail: string, detailIndex: number) => (
                      <div key={detailIndex} className="mb-2">
                        <input
                          type="text"
                          value={detail || ''}
                          onChange={(e) => handleDetailChange(index, respIndex, detailIndex, e.target.value)}
                          className="w-full p-2 border rounded text-xs"
                          placeholder="Detail"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="border-b pb-3">
        <h3 className="font-semibold text-md mb-2 text-gray-800">Education</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">Institution</label>
            <input
              type="text"
              value={formData.education?.institution || ''}
              onChange={(e) => handleEducationChange('institution', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Degree</label>
            <input
              type="text"
              value={formData.education?.degree || ''}
              onChange={(e) => handleEducationChange('degree', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Location</label>
            <input
              type="text"
              value={formData.education?.location || ''}
              onChange={(e) => handleEducationChange('location', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Duration/Graduation</label>
            <input
              type="text"
              value={formData.education?.duration || formData.education?.graduationDate || ''}
              onChange={(e) => handleEducationChange('duration', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">GPA</label>
            <input
              type="text"
              value={formData.education?.gpa || ''}
              onChange={(e) => handleEducationChange('gpa', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Minor</label>
            <input
              type="text"
              value={formData.education?.minor || ''}
              onChange={(e) => handleEducationChange('minor', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1">Concentrations (comma-separated)</label>
            <input
              type="text"
              value={formData.education?.concentrations?.join(', ') || ''}
              onChange={(e) => handleEducationConcentrationsChange(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Finance, Marketing, etc."
            />
          </div>
        </div>

        {/* Education Achievements */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700">Achievements</label>
            <button
              type="button"
              onClick={handleAddEducationAchievement}
              className="text-blue-600 text-sm hover:underline"
            >
              + Add Achievement
            </button>
          </div>
          
          {formData.education?.achievements?.map((achievement: string, index: number) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={achievement}
                onChange={(e) => handleEducationAchievementChange(index, e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Achievement"
              />
              <button
                type="button"
                onClick={() => handleRemoveEducationAchievement(index)}
                className="ml-2 text-red-500 hover:text-red-700"
                title="Remove"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-md mb-2 text-gray-800">Skills & Interests</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-gray-700 mb-1">Interests (comma-separated)</label>
            <input
              type="text"
              value={formData.skillsAndInterests?.interests?.join(', ') || ''}
              onChange={(e) => handleSkillsChange('interests', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Native Languages (comma-separated)</label>
            <input
              type="text"
              value={formData.skillsAndInterests?.languages?.native?.join(', ') || ''}
              onChange={(e) => handleSkillsChange('native', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Fluent Languages (comma-separated)</label>
            <input
              type="text"
              value={formData.skillsAndInterests?.languages?.fluent?.join(', ') || ''}
              onChange={(e) => handleSkillsChange('fluent', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Technical Skills (comma-separated)</label>
            <input
              type="text"
              value={formData.skillsAndInterests?.technical?.join(', ') || ''}
              onChange={(e) => handleSkillsChange('technical', e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
});

export default ResumeEditForm; 