import React, { useState } from "react";

function TemplateThree({ result }: { result: any }) {
  const [selectedColor, setSelectedColor] = useState("#374151"); // Default to gray-700

  // Color options
  const colorOptions = [
    { name: "Gray", value: "#374151" }, // gray-700
    { name: "Blue", value: "#3b82f6" }, // blue-500
    { name: "Purple", value: "#8b5cf6" }, // violet-500
    { name: "Teal", value: "#14b8a6" }, // teal-500
    { name: "Green", value: "#22c55e" }, // green-500
    { name: "Red", value: "#ef4444" }, // red-500
    { name: "Amber", value: "#f59e0b" }, // amber-500
    { name: "Indigo", value: "#6366f1" }, // indigo-500
  ];

  // Extract data from result
  const personalInformation = result?.personalInformation || {};
  const professionalExperience = result?.professionalExperience || [];
  const education = result?.education || {};
  const skillsAndInterests = result?.skillsAndInterests || {};
  const summary = result?.summary || "";

  return (
    <div className="relative bg-white text-black px-8 py-6 h-full" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Resume Content */}
      <div className="w-full flex flex-col items-center">
        {/* Name Header */}
        <h1 className="text-3xl uppercase tracking-widest font-normal mb-2 text-center" style={{ letterSpacing: '0.25em' }}>
          {personalInformation?.name || "AVA MORRISON"}
        </h1>
        
        {/* Divider Line */}
        <div className="w-full h-px bg-gray-300 my-2"></div>
        
        {/* Contact Information */}
        <div className="text-center text-sm mb-4">
          {personalInformation?.phone && (
            <span>{personalInformation.phone}</span>
          )}
          {personalInformation?.phone && personalInformation?.email && (
            <span> | </span>
          )}
          {personalInformation?.email && (
            <span>{personalInformation.email}</span>
          )}
          {(personalInformation?.phone || personalInformation?.email) && personalInformation?.address && (
            <span> | </span>
          )}
          {personalInformation?.address && (
            <span>{personalInformation.address}</span>
          )}
          {(personalInformation?.phone || personalInformation?.email || personalInformation?.address) && personalInformation?.linkedin && (
            <span> | </span>
          )}
          {personalInformation?.linkedin && (
            <span>{personalInformation.linkedin}</span>
          )}
        </div>
        
        {/* Professional Summary Section */}
        <div className="w-full mb-4">
          <div className="bg-gray-200 py-2 px-2 text-center mb-2 flex items-center justify-center">
            <h2 className="uppercase font-semibold tracking-wider m-0" style={{ color: selectedColor }}>
              Professional Summary
            </h2>
          </div>
          <div className="px-1 text-sm">
            {summary ? (
              <p>{summary}</p>
            ) : (
              <ul className="list-disc ml-5 space-y-1">
                <li>Use this section to highlight your strongest accomplishments right off the bat — and be sure to include numbers or metrics where you can.</li>
                <li>You can choose bullet points or a short paragraph format, whichever feels natural.</li>
                <li>Skip the outdated objective statement — instead, focus on showing how you'll make an impact and bring value to the company from day one.</li>
              </ul>
            )}
          </div>
        </div>
        
        {/* Experience Section */}
        <div className="w-full mb-4">
          <div className="bg-gray-200 py-2 px-2 text-center mb-2 flex items-center justify-center">
            <h2 className="uppercase font-semibold tracking-wider m-0" style={{ color: selectedColor }}>
              Experience
            </h2>
          </div>
          
          {professionalExperience && professionalExperience.length > 0 ? (
            professionalExperience.map((exp: any, index: number) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-sm uppercase">{exp?.position || "POSITION TITLE HERE"}</h3>
                  <span className="text-sm">{exp?.duration || "Date – Present"}</span>
                </div>
                <p className="text-sm mb-1">{exp?.company}{exp?.location ? `, ${exp?.location}` : ""}</p>
                
                {exp?.responsibilities && exp.responsibilities.length > 0 ? (
                  <ul className="list-disc ml-5 text-sm space-y-1">
                    {exp.responsibilities.flatMap((resp: any, idx: number) => {
                      // Handle both string and object formats
                      if (typeof resp === 'string') {
                        return <li key={idx}>{resp}</li>;
                      } else if (resp.category) {
                        // Create a list item for the category
                        const items = [<li key={`${idx}-cat`}>{resp.category}</li>];
                        
                        // If there are details, add them as sub-items
                        if (resp.details && Array.isArray(resp.details)) {
                          resp.details.forEach((detail: string, detailIdx: number) => {
                            items.push(
                              <li key={`${idx}-det-${detailIdx}`} className="ml-4">
                                {detail}
                              </li>
                            );
                          });
                        }
                        return items;
                      }
                      return null;
                    }).filter(Boolean)}
                  </ul>
                ) : (
                  <div className="text-sm px-1">
                    <p className="mb-1">This opening section is a great spot to briefly summarize your role, highlight key contributions, or explain how you arrived in the position—such as through a promotion or internal transfer.</p>
                    <ul className="list-disc ml-5 space-y-1">
                      <li>List your most impressive and relevant achievements first. If you can add specific numbers or results to back them up — even better.</li>
                      <li>Use strong action verbs like "managed," "led," or "spearheaded" instead of passive phrases like "responsible for."</li>
                      <li>Think about how your work helped the company: Did you increase revenue, cut costs, or save time? That's what employers care about.</li>
                    </ul>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="mb-4">
              <div className="flex justify-between items-baseline mb-1">
                <h3 className="font-bold text-sm uppercase">POSITION TITLE HERE</h3>
                <span className="text-sm">Date – Present</span>
              </div>
              <p className="text-sm mb-1">Company, Location</p>
              <div className="text-sm px-1">
                <p className="mb-1">This opening section is a great spot to briefly summarize your role, highlight key contributions, or explain how you arrived in the position.</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>List your most impressive and relevant achievements first.</li>
                  <li>Use strong action verbs like "managed," "led," or "spearheaded".</li>
                  <li>Think about how your work helped the company.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        {/* Education Section */}
        <div className="w-full">
          <div className="bg-gray-200 py-2 px-2 text-center mb-2 flex items-center justify-center">
            <h2 className="uppercase font-semibold tracking-wider m-0" style={{ color: selectedColor }}>
              Education & Certifications
            </h2>
          </div>
          
          {/* Display education - handle both object and array format */}
          {education ? (
            Array.isArray(education) ? (
              education.map((edu: any, index: number) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <div className="text-sm">
                      <span className="font-bold">{edu?.degree}</span>
                      {edu?.institution ? <span className="font-bold"> / {edu.institution}</span> : ""}
                      {edu?.location ? <span className="font-bold">, {edu.location}</span> : ""}
                    </div>
                    <span className="text-sm">{edu?.duration || edu?.graduationDate || "Date"}</span>
                  </div>
                  
                  {/* Additional education details */}
                  <div className="text-sm ml-2">
                    {edu?.concentrations && Array.isArray(edu.concentrations) && edu.concentrations.length > 0 && (
                      <>
                        <span className="font-medium">Concentrations:</span> {edu.concentrations.join(", ")}
                        {edu?.minor ? '; Minor in ' + edu?.minor : ''}
                        {edu?.gpa ? ' | GPA: ' + edu?.gpa : ''}
                      </>
                    )}
                  </div>
                  
                  {/* Education achievements */}
                  {edu?.achievements && Array.isArray(edu.achievements) && edu.achievements.length > 0 && (
                    <ul className="list-disc ml-5 text-sm space-y-1 mt-1">
                      {edu.achievements.map((achievement: string, idx: number) => (
                        <li key={idx}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <div className="mb-3">
                <div className="flex justify-between mb-1">
                  <div className="text-sm">
                    <span className="font-bold">{education?.degree}</span>
                    {education?.institution ? <span className="font-bold"> / {education.institution}</span> : ""}
                    {education?.location ? <span className="font-bold">, {education.location}</span> : ""}
                  </div>
                  <span className="text-sm">{education?.duration || education?.graduationDate || "Date"}</span>
                </div>
                
                {/* Additional education details */}
                <div className="text-sm ml-2">
                  {education?.concentrations && Array.isArray(education.concentrations) && education.concentrations.length > 0 && (
                    <>
                      <span className="font-medium">Concentrations:</span> {education.concentrations.join(", ")}
                      {education?.minor ? '; Minor in ' + education?.minor : ''}
                      {education?.gpa ? ' | GPA: ' + education?.gpa : ''}
                    </>
                  )}
                </div>
                
                {/* Education achievements */}
                {education?.achievements && Array.isArray(education.achievements) && education.achievements.length > 0 && (
                  <ul className="list-disc ml-5 text-sm space-y-1 mt-1">
                    {education.achievements.map((achievement: string, idx: number) => (
                      <li key={idx}>{achievement}</li>
                    ))}
                  </ul>
                )}
              </div>
            )
          ) : (
            <div>
              <div className="flex justify-between mb-1">
                <div className="text-sm">
                  <span className="font-bold">Master of Business Administration</span> / Your University, City, State
                </div>
                <span className="text-sm">Date</span>
              </div>
              <div className="text-sm italic mb-2">Summa cum laude, President of XYZ Club</div>
              
              <div className="flex justify-between mb-1">
                <div className="text-sm">
                  <span className="font-bold">Certification Here</span> / Organization
                </div>
                <span className="text-sm">Date</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateThree;