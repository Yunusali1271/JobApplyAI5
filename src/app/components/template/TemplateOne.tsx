import React, { useEffect, useMemo, useState } from "react";

function TemplateOne({ result }: { result: any }) {
  const [selectedColor, setSelectedColor] = useState("#10b981"); // Updated to lighter green (green-500)
  
  useEffect(() => {
    console.log("TemplateOne received data:", result);
  }, [result]);

  // Create a clean version of the data to render
  const cleanResult = useMemo(() => {
    if (!result) return {};
    
    // Create a copy without the timestamp property
    const { _timestamp, ...cleanData } = result;
    return cleanData;
  }, [result]);

  // Helper function for color palette
  const colorOptions = [
    { name: "Green", value: "#10b981" }, // green-500 (lighter)
    { name: "Blue", value: "#3b82f6" },  // blue-500 (lighter)
    { name: "Purple", value: "#8b5cf6" }, // violet-500 (lighter)
    { name: "Red", value: "#ef4444" },    // red-500 (lighter)
    { name: "Amber", value: "#f59e0b" },  // amber-500 (lighter)
    { name: "Teal", value: "#14b8a6" },   // teal-500 (lighter)
    { name: "Indigo", value: "#6366f1" }, // indigo-500 (lighter)
    { name: "Cyan", value: "#06b6d4" },   // cyan-500 (lighter)
  ];

  // Helper function to format address into multiple lines
  const formatAddress = (address: string) => {
    if (!address) return "";
    
    // Try to split the address into parts
    const parts = address.split(',').map(part => part.trim());
    
    if (parts.length >= 2) {
      // Assume first part is street, remaining parts are city, postal code, etc.
      const streetAddress = parts[0];
      const cityPostalParts = parts.slice(1).join(', ');
      
      return (
        <span>
          {streetAddress}<br/>
          {cityPostalParts}
        </span>
      );
    }
    
    // If we can't split nicely, just return the original
    return address;
  };

  const professionalExperience = cleanResult?.professionalExperience;
  const education = cleanResult?.education;
  const skillsAndInterests = cleanResult?.skillsAndInterests;
  const personalInformation = cleanResult?.personalInformation;

  return (
    <div className="relative bg-white text-black px-6 h-full" style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}>
      <div className="sticky xl:fixed right=1/2 top-0 xl:right-2 xl:top-32 flex justify-center  xl:flex-col xl:justify-start items-center max-xl:space-x-2 space-y-2 z-50" style={{ marginRight: '10px' }} data-html2canvas-ignore="true">
        <div className="text-[11px] font-semibold text-gray-600 xl:mb-1 text-center">Color Theme</div>
        <div className="flex flex-row xl:flex-col gap-2">
          {colorOptions.map((color) => (
            <button
              key={color.value}
              className={`w-4 h-4 sm:w-6 sm:h-6 xl:w-8 xl:h-8 rounded-full border-2 shadow-md transition-all ${selectedColor === color.value ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'}`}
              style={{ 
                backgroundColor: color.value,
                borderColor: selectedColor === color.value ? color.value : 'transparent' 
              }}
              title={color.name}
              aria-label={`Set ${color.name} theme`}
              onClick={() => setSelectedColor(color.value)}
            />
          ))}
        </div>
      </div>

      <div className="w-full py-3 flex flex-col h-full" style={{ minHeight: '100%' }}>
        {/* Name - Bold uppercase centered */}
        <h1 className="text-[28px] font-bold text-center mb-1">
          {personalInformation?.name}
        </h1>

        {/* Contact Info - Similar to Jeffrey Su resume */}
        <div className="flex justify-between text-[13px] mt-0 pb-1">
          {/* Left Column */}
          <div>
            <p>
              <span style={{ color: selectedColor }} className="font-semibold">Email me:</span>{" "}
              <span className="font-semibold">{personalInformation?.email}</span>
            </p>
            <p>
              <span style={{ color: selectedColor }} className="font-semibold">Call me:</span>{" "}
              <span className="font-semibold">{personalInformation?.phone}</span>
            </p>
          </div>
          
          {/* Right Column */}
          <div className="text-right">
            {personalInformation?.linkedin ? (
              // If LinkedIn exists, show LinkedIn and address on separate lines
              <>
                <p>
                  <span style={{ color: selectedColor }} className="font-semibold">LinkedIn:</span>{" "}
                  <span className="font-semibold">{personalInformation.linkedin}</span>
                </p>
                <p>
                  <span style={{ color: selectedColor }} className="font-semibold">Address:</span>{" "}
                  <span className="font-semibold">{personalInformation?.address || ""}</span>
                </p>
              </>
            ) : (
              // If LinkedIn doesn't exist, show address with two lines
              <>
                <p>
                  <span style={{ color: selectedColor }} className="font-semibold">Address:</span>{" "}
                  <span className="font-semibold">
                    {formatAddress(personalInformation?.address || "")}
                  </span>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Gray divider */}
        <div className="h-[1px] bg-gray-300 w-full mb-2 mt-1"></div>

        {/* ============== professional experience ============== */}
        <h2 style={{ color: selectedColor }} className="text-[14px] font-bold mb-0.5 uppercase">
          PROFESSIONAL EXPERIENCE
        </h2>

        {professionalExperience?.map((experience: any, index: any) => (
          <div key={index} className="mb-2 w-full">
            <div className="flex w-full justify-between items-baseline mb-0.5">
              <h3 className="text-[14px] font-bold">
                {experience?.company} - {experience?.position}
                {experience?.location ? '; ' + experience?.location : ''}
              </h3>
              <span className="italic text-[13px]">{experience?.duration}</span>
            </div>
            
            {/* Main bullet points - using a styled list for proper PDF alignment */}
            <div className="ml-5 text-[13px] text-black">
              {experience?.responsibilities?.map(
                (responsibility: any, Idx: any) => (
                  <div key={Idx} className="mb-0.5 flex">
                    <span className="inline-block mr-2 flex-shrink-0" style={{ 
                      lineHeight: '1.5',
                      marginTop: '0.15em' 
                    }}>•</span>
                    <div className="flex-1">
                      {responsibility?.category}
                      
                      {/* Sub bullet points (hollow circles) */}
                      {responsibility?.details && Array.isArray(responsibility.details) && (
                        <ul className="list-none ml-1 mt-0.5">
                          {responsibility.details.map(
                            (detail: any, detailIdx: any) => (
                              <li key={detailIdx} className="mb-0.5 flex" style={{ 
                                position: 'relative',
                                paddingLeft: '1.2em'
                              }}>
                                <span style={{ 
                                  position: 'absolute', 
                                  left: 0,
                                  top: '0.15em',
                                  display: 'inline-block'
                                }}>○</span>
                                <span style={{ flex: 1, fontSize: '13px' }}>{detail}</span>
                              </li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ))}

        {/* ============== education ============== */}
        <h2 style={{ color: selectedColor }} className="text-[14px] font-bold mb-0.5 uppercase">
          EDUCATION
        </h2>
        
        {/* Handle education as either an array or a single object */}
        {Array.isArray(education) ? (
          // If education is an array, map through each education item
          education.map((edu: any, index: number) => (
            <div key={index} className="mb-2 w-full">
              <div className="flex w-full justify-between items-baseline mb-0.5">
                <h3 className="max-w-[70%] text-[14px] font-bold">
                  {edu?.institution}, {edu?.degree}
                  {edu?.location ? ' | ' + edu?.location : ''}
                </h3>
                <span className="italic text-[13px]">
                  {edu?.duration || edu?.graduationDate}
                </span>
              </div>
              <div className="text-[13px] mt-0.5 ml-4">
                {edu?.concentrations && edu.concentrations.length > 0 && (
                  <>
                    <span className="font-medium">Concentrations:</span> {edu.concentrations.join(", ")}
                    {edu?.minor ? '; Minor in ' + edu?.minor : ''}
                    {edu?.gpa ? ' | GPA: ' + edu?.gpa : ''}
                  </>
                )}
              </div>
              
              {/* Style achievements like bullet points */}
              {edu?.achievements && edu.achievements.length > 0 && (
                <div className="text-[13px] mt-2 ml-4">
                  {edu.achievements.map((achievement: string, idx: number) => (
                    <div key={idx} className="mb-1 flex">
                      <span className="inline-block mr-2 flex-shrink-0" style={{ 
                        lineHeight: '1.5',
                        marginTop: '0.15em' 
                      }}>○</span>
                      <div className="flex-1">{achievement}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          // Fall back to the original behavior if education is a single object
          <div className="mb-2 w-full">
            <div className="flex w-full justify-between items-baseline mb-0.5">
              <h3 className="max-w-[70%] text-[14px] font-bold">
                {education?.institution}, {education?.degree}
                {education?.location ? ' | ' + education?.location : ''}
              </h3>
              <span className="italic text-[13px]">
                {education?.duration || education?.graduationDate}
              </span>
            </div>
            <div className="text-[13px] mt-0.5 ml-4">
              {education?.concentrations && (
                <>
                  <span className="font-medium">Concentrations:</span> {education.concentrations.join(", ")}
                  {education?.minor ? '; Minor in ' + education?.minor : ''}
                  {education?.gpa ? ' | GPA: ' + education?.gpa : ''}
                </>
              )}
            </div>
            
            {/* Style achievements like bullet points */}
            {education?.achievements && education.achievements.length > 0 && (
              <div className="text-[13px] mt-2 ml-4">
                {education.achievements.map((achievement: string, idx: number) => (
                  <div key={idx} className="mb-1 flex">
                    <span className="inline-block mr-2 flex-shrink-0" style={{ 
                      lineHeight: '1.5',
                      marginTop: '0.15em' 
                    }}>○</span>
                    <div className="flex-1">{achievement}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============== skills ============== */}
        <h2 style={{ color: selectedColor }} className="text-[14px] font-bold mb-0.5 uppercase">
          SKILLS & INTERESTS
        </h2>
        
        <div className="ml-2">
          <div className="text-[13px] text-black mb-0.5"> 
            <span className="font-bold">Interests:</span> {skillsAndInterests?.interests?.join(", ")}
          </div>
          <div className="text-[13px] text-black mb-0.5">
            <span className="font-bold">Languages:</span>{" "}
            {skillsAndInterests?.languages?.native && skillsAndInterests.languages.native.length > 0 ? (
              <>Native {skillsAndInterests.languages.native.join(", ")}</>
            ) : (
              <>Native English</>
            )}
            {skillsAndInterests?.languages?.fluent && skillsAndInterests.languages.fluent.length > 0 && (
              <>; Fluent in {skillsAndInterests.languages.fluent.join(", ")}</>
            )}
          </div>
          <div className="text-[13px] text-black">
            <span className="font-bold">Technical:</span> {skillsAndInterests?.technical?.join(", ")}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateOne; 