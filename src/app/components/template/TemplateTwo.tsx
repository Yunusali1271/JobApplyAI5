/* eslint-disable react/no-unescaped-entities */
"use client";
import { Typography, Divider, Row, Col, Space } from "antd";

const { Title, Text, Paragraph } = Typography;

export default function TemplateTwo({ result }: { result: any }) {
  const professionalExperience = result?.professionalExperience || [];
  const summary = result?.summary || "";
  const education = result?.education || {};
  const skillsAndInterests = result?.skillsAndInterests || {};
  const personalInformation = result?.personalInformation || {};

  return (
    <div className="max-w-4xl mx-auto py-3 px-8 bg-white h-full" style={{ 
      fontFamily: 'Times New Roman, serif', 
      color: '#333333', 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100%',
      height: 'auto'
    }}>
      {/* Header - More compact name and contact details */}
      <div className="mb-2">
        <Title level={2} style={{ color: '#333333', fontFamily: 'Times New Roman, serif', textAlign: 'center', margin: 0, marginBottom: '4px', fontSize: '32px', fontWeight: 'bold' }}>
          {personalInformation?.name || ""}
        </Title>
        
        <div className="flex justify-center items-center text-sm" style={{ color: '#333333' }}>
          {/* City - Display as first item */}
          {personalInformation?.city && (
            <div className="flex items-center mx-1">
              <span style={{ marginRight: '3px' }}>📍</span>
              <Text style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px' }}>
                {personalInformation.city}
              </Text>
            </div>
          )}
          
          {/* Address/Location */}
          {personalInformation?.address && (
            <div className="flex items-center mx-1">
              <span style={{ marginRight: '3px' }}>◉</span>
              <Text style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px' }}>
                {personalInformation.address}
              </Text>
            </div>
          )}
          
          {/* Phone */}
          {personalInformation?.phone && (
            <div className="flex items-center mx-1">
              <span style={{ marginRight: '3px' }}>☎</span>
              <Text style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px' }}>
                {personalInformation.phone}
              </Text>
            </div>
          )}
          
          {/* Email */}
          {personalInformation?.email && (
            <div className="flex items-center mx-1">
              <span style={{ marginRight: '3px' }}>✉</span>
              <Text style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px' }}>
                <a href={`mailto:${personalInformation.email}`} style={{ color: '#333333', textDecoration: 'none' }}>
                  {personalInformation.email}
                </a>
              </Text>
            </div>
          )}
          
          {/* Job Title or Role - only show if specified */}
          {personalInformation?.title && (
            <div className="flex items-center mx-1">
              <span style={{ marginRight: '3px' }}>💼</span>
              <Text style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px' }}>
                {personalInformation.title}
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Add subtle divider after header */}
      <Divider style={{ margin: '4px 0', borderColor: '#e0e0e0', backgroundColor: '#e0e0e0', height: '1px' }} />

      {/* Summary */}
      <div className="mb-1">
        <Title
          level={5}
          style={{ color: '#333333', fontFamily: 'Times New Roman, serif', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginTop: '2px', fontWeight: 'bold', fontSize: '16px' }}
        >
          Summary
        </Title>
        <Divider className="my-0.5" style={{ borderColor: '#333333', backgroundColor: '#333333', height: '1px', marginTop: '0' }} />
        <Paragraph style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px', marginBottom: '4px', marginTop: '6px' }}>{summary}</Paragraph>
      </div>

      {/* Experience */}
      <div className="mb-1">
        <Title
          level={5}
          style={{ color: '#333333', fontFamily: 'Times New Roman, serif', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginTop: '2px', fontWeight: 'bold', fontSize: '16px' }}
        >
          Experience
        </Title>
        <Divider className="my-0.5" style={{ borderColor: '#333333', backgroundColor: '#333333', height: '1px', marginTop: '0' }} />

        {Array.isArray(professionalExperience) && professionalExperience.length > 0 ? (
          professionalExperience.map((experience: any, index: number) => (
            <div className={index === professionalExperience.length - 1 ? "mb-1" : "mb-1"} key={index}>
              <div className="flex justify-between items-center">
                <Text strong style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>
                  {experience?.company || ""} | {experience?.position || ""}
                </Text>
                <Text style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px' }}>
                  {experience?.duration || ""}
                </Text>
              </div>
             
              <div className="ml-5 text-[14px] text-[#333333]" style={{
                fontFamily: 'Times New Roman, serif',
                marginTop: '0.15em'
              }}>
                {Array.isArray(experience?.responsibilities) && experience.responsibilities.map(
                  (responsibility: any, idx: number) => (
                    <div key={idx} className="mb-0.5 flex">
                      <span className="inline-block mr-2 flex-shrink-0" style={{ marginTop: '0.2em' }}>•</span>
                      <div className="flex-1">
                        {responsibility?.category || ""}
                        
                        {/* Sub bullet points */}
                        {Array.isArray(responsibility?.details) && (
                          <div className="ml-1 mt-0.5">
                            {responsibility.details.map(
                              (detail: any, detailIdx: number) => (
                                <div key={detailIdx} className="mb-0.5 flex">
                                  <span className="inline-block mr-2 ml-3 flex-shrink-0" style={{ lineHeight: '1.4' }}>○</span>
                                  <div className="flex-1" style={{ fontSize: '14px', color: '#333333', fontFamily: 'Times New Roman, serif' }}>
                                    {detail}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))
        ) : (
          <Text style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px', marginBottom: '6px' }}>
            No professional experience listed
          </Text>
        )}
        
      </div>

      {/* Education */}
      <div className="mb-1">
        <Title
          level={5}
          style={{ color: '#333333', fontFamily: 'Times New Roman, serif', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginTop: '2px', fontWeight: 'bold', fontSize: '16px' }}
        >
          Education
        </Title>
        <Divider className="my-0.5" style={{ borderColor: '#333333', backgroundColor: '#333333', height: '1px', marginTop: '0' }} />
        
        {Array.isArray(education) ? (
          // If education is an array, map through each education item
          education.map((edu: any, index: number) => (
            <div key={index} className={index === education.length - 1 ? "mb-1" : "mb-1"}>
              <div className="flex justify-between items-center">
                <Text strong style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontWeight: 'bold', fontSize: '14px' }}>
                  {edu?.degree || ""} | {edu?.institution || ""}
                </Text>
                <Text style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px' }}>
                  {edu?.duration || edu?.graduationDate || ""}
                </Text>
              </div>
              
              <div style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px' }}>
                {edu?.concentrations && Array.isArray(edu.concentrations) && edu.concentrations.length > 0 && (
                  <>Concentrations: {edu.concentrations.join(', ')}</>
                )}
                {edu?.minor && (<>; Minor in {edu.minor}</>)}
                {edu?.gpa && (<> | GPA: {edu.gpa}</>)}
              </div>

              {edu?.achievements && Array.isArray(edu.achievements) && edu.achievements.length > 0 && (
                <div className="ml-5 text-[14px] mt-1" style={{ 
                  color: '#333333', 
                  fontFamily: 'Times New Roman, serif'
                }}>
                  {edu.achievements.map((achievement: string, idx: number) => (
                    <div key={idx} className="mb-0.5 flex">
                      <span className="inline-block mr-2 flex-shrink-0" style={{ marginTop: '0.2em' }}>•</span>
                      <div className="flex-1">{achievement}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          // Fall back to the original behavior if education is a single object
          <div className="mb-1">
            <div className="flex justify-between items-center">
              <Text strong style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontWeight: 'bold', fontSize: '14px' }}>
                {education?.degree || ""} | {education?.institution || ""}
              </Text>
              <Text style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px' }}>
                {education?.duration || education?.graduationDate || ""}
              </Text>
            </div>
            
            <div style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px' }}>
              {education?.concentrations && Array.isArray(education.concentrations) && education.concentrations.length > 0 && (
                <>Concentrations: {education.concentrations.join(', ')}</>
              )}
              {education?.minor && (<>; Minor in {education.minor}</>)}
              {education?.gpa && (<> | GPA: {education.gpa}</>)}
            </div>

            {education?.achievements && Array.isArray(education.achievements) && education.achievements.length > 0 && (
              <ul style={{ 
                listStyleType: 'disc', 
                paddingLeft: '1.5em', 
                color: '#333333', 
                fontFamily: 'Times New Roman, serif',
                fontSize: '14px',
                marginTop: '0.5em',
                position: 'relative',
                listStylePosition: 'outside'
              }}>
                {education.achievements.map((achievement: string, idx: number) => (
                  <li key={idx} style={{ 
                    marginBottom: '0.25em',
                    paddingLeft: '0.25em',
                    display: 'list-item',
                    position: 'relative'
                  }}>{achievement}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Skills & Interests */}
      <div className="mb-0">
        <Title
          level={5}
          style={{ color: '#333333', fontFamily: 'Times New Roman, serif', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', marginTop: '2px', fontWeight: 'bold', fontSize: '16px' }}
        >
          Skills & Interests
        </Title>
        <Divider className="my-0.5" style={{ borderColor: '#333333', backgroundColor: '#333333', height: '1px', marginTop: '0' }} />
        
        {skillsAndInterests?.technical && Array.isArray(skillsAndInterests.technical) && skillsAndInterests.technical.length > 0 && (
          <Row gutter={[16, 4]} className="mb-2">
            <Col span={8}>
              <Text strong style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>
                Technical{" "}
              </Text>{" "}
            </Col>
            <Col span={16}>
              <Text style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px' }}>
                {skillsAndInterests.technical.join(",  ")}
              </Text>
            </Col>
          </Row>
        )}
        
        {skillsAndInterests?.interests && Array.isArray(skillsAndInterests.interests) && skillsAndInterests.interests.length > 0 && (
          <Row gutter={[16, 4]} className="mb-2">
            <Col span={8}>
              <Text strong style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>
                Interests{" "}
              </Text>{" "}
            </Col>
            <Col span={16}>
              <Text style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px' }}>
                {skillsAndInterests.interests.join(",  ")}
              </Text>
            </Col>
          </Row>
        )}
        
        {/* Languages section aligned on same line like other sections */}
        <Row gutter={[16, 4]} className="mb-2">
          <Col span={8}>
            <Text strong style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>
              Languages{" "}
            </Text>{" "}
          </Col>
          <Col span={16}>
            <Text style={{ color: '#333333', fontFamily: 'Times New Roman, serif', fontSize: '14px' }}>
              {skillsAndInterests?.languages?.native && Array.isArray(skillsAndInterests.languages.native) && skillsAndInterests.languages.native.length > 0 
                ? `Native in ${skillsAndInterests.languages.native.join(", ")}` 
                : "Native in English"}
              {skillsAndInterests?.languages?.fluent && Array.isArray(skillsAndInterests.languages.fluent) && skillsAndInterests.languages.fluent.length > 0 && 
                `; Fluent in ${skillsAndInterests.languages.fluent.join(", ")}`}
            </Text>
          </Col>
        </Row>
      </div>
    </div>
  );
}
