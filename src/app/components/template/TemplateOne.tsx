import React from "react";

function TemplateOne({ result }: { result: any }) {
  const professionalExperience = result?.professionalExperience;
  const education = result?.education;
  const skillsAndInterests = result?.skillsAndInterests;
  const personalInformation = result?.personalInformation;

  return (
    <div className="bg-white text-black flex justify-center px-6 h-full" style={{ fontFamily: 'Arial, sans-serif', color: '#000000' }}>
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
              <span className="text-green-600 font-semibold">Email me:</span>{" "}
              <span className="font-semibold">{personalInformation?.email}</span>
            </p>
            <p>
              <span className="text-green-600 font-semibold">Call me:</span>{" "}
              <span className="font-semibold">{personalInformation?.phone}</span>
            </p>
          </div>
          
          {/* Right Column */}
          <div className="text-right">
            <p>
              <span className="text-green-600 font-semibold">LinkedIn:</span>{" "}
              <span className="font-semibold">{personalInformation?.linkedin || ""}</span>
            </p>
            <p>
              <span className="text-green-600 font-semibold">Address:</span>{" "}
              <span className="font-semibold">{personalInformation?.address || ""}</span>
            </p>
          </div>
        </div>

        {/* Gray divider */}
        <div className="h-[1px] bg-gray-300 w-full mb-2 mt-1"></div>

        {/* ============== professional experience ============== */}
        <h2 className="text-[14px] font-bold text-green-600 mb-0.5 uppercase">
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
            
            {/* Main bullet points */}
            <ul className="list-disc ml-5 text-[13px] text-black">
              {experience?.responsibilities?.map(
                (responsibility: any, Idx: any) => (
                  <li key={Idx} className="mb-0.5 pl-1 text-black" style={{ 
                    paddingLeft: '0.25em' 
                  }}>
                    {responsibility?.category}
                    
                    {/* Sub bullet points (hollow circles) */}
                    {responsibility?.details && Array.isArray(responsibility.details) && (
                      <ul className="list-none ml-1 mt-0.5">
                        {responsibility.details.map(
                          (detail: any, detailIdx: any) => (
                            <li key={detailIdx} className="mb-0.5 relative pl-4" style={{ 
                              display: 'flex',
                            }}>
                              <span style={{ 
                                position: 'absolute', 
                                left: 0, 
                                display: 'inline-block',
                                width: '1em',
                                textAlign: 'center'
                              }}>○</span>
                              <span style={{ flex: 1, fontSize: '13px' }}>{detail}</span>
                            </li>
                          )
                        )}
                      </ul>
                    )}
                  </li>
                )
              )}
            </ul>
          </div>
        ))}

        {/* ============== education ============== */}
        <h2 className="text-[14px] font-bold text-green-600 mb-0.5 uppercase">
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
                <ul className="text-[13px] mt-2 ml-4">
                  {edu.achievements.map((achievement: string, idx: number) => (
                    <li key={idx} className="relative pl-5 mb-1" style={{ 
                      listStyleType: 'none',
                      textIndent: '-1em',
                      paddingLeft: '1em'
                    }}>
                      <span className="absolute" style={{ left: '-0.75em' }}>○</span> {achievement}
                    </li>
                  ))}
                </ul>
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
              <ul className="text-[13px] mt-2 ml-4">
                {education.achievements.map((achievement: string, idx: number) => (
                  <li key={idx} className="relative pl-5 mb-1" style={{ 
                    listStyleType: 'none',
                    textIndent: '-1em',
                    paddingLeft: '1em'
                  }}>
                    <span className="absolute" style={{ left: '-0.75em' }}>○</span> {achievement}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* ============== skills ============== */}
        <h2 className="text-[14px] font-bold text-green-600 mb-0.5 uppercase">
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