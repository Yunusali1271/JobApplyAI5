import React, { useState, useEffect } from "react";

function TemplateFour({ result }: { result: any }) {
  const [selectedColor, setSelectedColor] = useState("#374151"); // Default to gray-700
  const [jobTitle, setJobTitle] = useState<string>("");

  // Load job title from localStorage
  useEffect(() => {
    const storedJobTitle = localStorage.getItem("jobTitle");
    if (storedJobTitle) {
      setJobTitle(storedJobTitle);
    }
  }, []);

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

  // Use the job title from the application, or fall back to personal info title, or default
  const professionalTitle = jobTitle || personalInformation?.title || "PROFESSIONAL TITLE";

  return (
    <div className="relative bg-white text-black px-8 py-6 h-full" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Resume Content */}
      <div className="w-full">
        {/* Name Header - Centered and Spaced */}
        <h1 className="text-5xl text-center font-normal mb-6" style={{ letterSpacing: '0.3em', color: selectedColor, marginTop: '-0.5rem' }}>
          {personalInformation?.name || "CAMILLE ZHANG"}
        </h1>
        
        {/* Professional Title - Centered */}
        <div className="text-center text-sm mb-3" style={{ letterSpacing: '0.1em' }}>
          {professionalTitle}
        </div>
        
        {/* First Divider Line */}
        <div className="w-full h-px bg-gray-400 mb-3"></div>
        
        {/* Contact Information - Single Line */}
        <div className="text-center text-sm mb-3">
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
        
        {/* Second Divider Line */}
        <div className="w-full h-px bg-gray-400 mb-4"></div>
        
        {/* Professional Overview Section */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold mb-2 tracking-wider" style={{ color: selectedColor }}>
            PROFESSIONAL OVERVIEW
          </h2>
          <div className="text-sm leading-relaxed">
            {summary ? (
              <p>{summary}</p>
            ) : (
              <p>
                Seasoned strategist with 15+ years steering growth and innovation across B2B and real estate landscapes. Known for 
                turning complex challenges into actionable roadmaps, I forge high-impact partnerships and lead teams with clarity and 
                conviction. My track record? Scaling brands from the ground up, navigating cutthroat markets, and aligning 
                cross-functional forces around ambitious, long-view objectives. I don&apos;t just plan—I build momentum, and I get results.
              </p>
            )}
          </div>
        </div>
        
        {/* Education Section */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold mb-2 tracking-wider" style={{ color: selectedColor }}>
            EDUCATION
          </h2>
          
          {education ? (
            Array.isArray(education) ? (
              education.map((edu: any, index: number) => (
                <div key={index} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <div>
                      <span className="font-bold">{edu?.institution || "University"}</span>
                      {edu?.location && <span className="font-bold"> / {edu.location}</span>}
                      <span className="font-bold"> | {edu?.degree || "Degree"}</span>
                    </div>
                    <span>{edu?.duration || edu?.graduationDate || "Date"}</span>
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
                    <ul className="text-sm ml-4 space-y-1 mt-1">
                      {edu.achievements.map((achievement: string, idx: number) => (
                        <li key={idx} className="flex"><span className="mr-2">•</span><span>{achievement}</span></li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            ) : (
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <div>
                    <span className="font-bold">{education?.institution || "University"}</span>
                    {education?.location && <span className="font-bold"> / {education.location}</span>}
                    <span className="font-bold"> | {education?.degree || "Master&apos;s in Economics"}</span>
                  </div>
                  <span>{education?.duration || education?.graduationDate || "Date"}</span>
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
                  <ul className="text-sm ml-4 space-y-1 mt-1">
                    {education.achievements.map((achievement: string, idx: number) => (
                      <li key={idx} className="flex"><span className="mr-2">•</span><span>{achievement}</span></li>
                    ))}
                  </ul>
                )}
              </div>
            )
          ) : (
            <div className="flex justify-between text-sm mb-1">
              <div>University /College | Location | Master&apos;s in Economics</div>
              <span>Date</span>
            </div>
          )}
        </div>
        
        {/* Work Experience Section */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold mb-2 tracking-wider" style={{ color: selectedColor }}>
            WORK EXPERIENCE
          </h2>
          
          {professionalExperience && professionalExperience.length > 0 ? (
            professionalExperience.map((exp: any, index: number) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <div>
                    <strong>{exp?.company || "Company Name"}</strong>
                    {exp?.location && <span> | {exp.location}</span>}
                    <span>, {exp?.position || "Your Position Title"}</span>
                  </div>
                  <span>{exp?.duration || "Jan 2017 - Present"}</span>
                </div>
                
                {exp?.responsibilities && exp.responsibilities.length > 0 ? (
                  <ul className="text-sm ml-4 space-y-1">
                    {exp.responsibilities.flatMap((resp: any, idx: number) => {
                      if (typeof resp === 'string') {
                        return <li key={idx} className="flex"><span className="mr-2">•</span><span>{resp}</span></li>;
                      } else if (resp.category) {
                        const items = [<li key={`${idx}-cat`} className="flex"><span className="mr-2">•</span><span>{resp.category}</span></li>];
                        
                        if (resp.details && Array.isArray(resp.details)) {
                          resp.details.forEach((detail: string, detailIdx: number) => {
                            items.push(
                              <li key={`${idx}-det-${detailIdx}`} className="flex ml-3">
                                <span className="mr-2">•</span><span>{detail}</span>
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
                  <ul className="text-sm ml-4 space-y-1">
                    <li className="flex"><span className="mr-2">•</span><span><strong>Don&apos;t skip the Skills section — it&apos;s crucial.</strong> Including a clearly defined Skills section boosts your chances of passing through Applicant Tracking Systems (ATS), especially when applying online.</span></li>
                    <li className="flex"><span className="mr-2">•</span><span><strong>Always read the job description carefully and check the submission format:</strong> if they request a Word document, they&apos;re almost certainly using an ATS. If there&apos;s no format specified, a PDF is usually the safest and cleanest option.</span></li>
                    <li className="flex"><span className="mr-2">•</span><span>It is true that your resume should be 1-2 pages but if you have a lot of experience and many results, don&apos;t limit yourself; write everything down; I&apos;m always here for you if you need tips, advice, help</span></li>
                  </ul>
                )}
              </div>
            ))
          ) : (
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <div>
                  <strong>Company Name</strong> | Location, Head of Digital Marketing
                </div>
                <span>Jan 2017 - Present</span>
              </div>
              <ul className="text-sm ml-4 space-y-1">
                <li className="flex"><span className="mr-2">•</span><span><strong>Don&apos;t skip the Skills section — it&apos;s crucial.</strong> Including a clearly defined Skills section boosts your chances of passing through Applicant Tracking Systems (ATS), especially when applying online.</span></li>
                <li className="flex"><span className="mr-2">•</span><span><strong>Always read the job description carefully and check the submission format:</strong> if they request a Word document, they&apos;re almost certainly using an ATS. If there&apos;s no format specified, a PDF is usually the safest and cleanest option.</span></li>
                <li className="flex"><span className="mr-2">•</span><span>It is true that your resume should be 1-2 pages but if you have a lot of experience and many results, don&apos;t limit yourself; write everything down; I&apos;m always here for you if you need tips, advice, help</span></li>
              </ul>
            </div>
          )}
        </div>
        
        {/* Skills Section */}
        <div className="mb-4">
          <h2 className="text-sm font-semibold mb-2 tracking-wider" style={{ color: selectedColor }}>
            SKILLS
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-2 text-sm">
            {skillsAndInterests?.technical && skillsAndInterests.technical.length > 0 ? (
              skillsAndInterests.technical.map((skill: string, index: number) => (
                <div key={index}>{skill}</div>
              ))
            ) : (
              <>
                <div>Product Communication</div>
                <div>Campaign Execution</div>
                <div>Resource Management</div>
                <div>Data Analysis</div>
                <div>Decision Framework</div>
                <div>Agile Methodology</div>
                <div>UX Writing</div>
                <div>Issue Resolution</div>
                <div>Cross-functional Teams</div>
                <div>Product Backlog</div>
                <div>Stakeholder Management</div>
                <div>Sprint Planning</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateFour; 