import React from "react";

function TemplateOne({ result }: { result: any }) {
  const professionalExperience = result?.professionalExperience;
  const education = result?.education;
  const skillsAndInterests = result?.skillsAndInterests;
  const personalInformation = result?.personalInformation;
  return (
    <div className="bg-white text-black flex justify-center px-2">
      <div className="w-full pt-12 py-6">
        {/* Name */}
        <h1 className="text-3xl font-bold text-center uppercase">
          {personalInformation?.name}
        </h1>

        {/* Contact Info */}
        <div className="flex justify-between text-sm mt-2 border-b-2 border-black pb-2">
          <div>
            <p className="font-semibold">
              <span className="text-green-600">Email me:</span>{" "}
              {personalInformation?.email}
            </p>
            <p className="font-semibold">
              <span className="text-green-600">Call me:</span>{" "}
              {personalInformation?.phone}
            </p>
          </div>
          <div className="text-right flex justify-start flex-col items-start">
            <p className="font-semibold">
              <span className="text-green-600">LinkedIn:</span>{" "}
              <a
                href={personalInformation?.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                {personalInformation?.linkedin}
              </a>
            </p>
            <p className="font-semibold">
              <span className="text-green-600">Address:</span>{" "}
              {personalInformation?.address}
            </p>
          </div>
        </div>

        {/* ============== professional experience ============== */}
        <h2 className="text-[18px] font-bold text-green-600 mt-4 uppercase">
          Professional Experience
        </h2>

        {professionalExperience?.map((experience: any, index: any) => (
          <div key={index} className="!mt-[1px] w-full">
            <div className="flex w-full justify-between items-center">
              <h3>
                <span className="font-bold">
                  {experience?.company} - {experience?.position}:
                </span>{" "}
                {experience?.location}
              </h3>
              <span className="italic font-400">{experience?.duration}</span>
            </div>
            <ul className="list-disc list-inside text-sm ml-6 mb-4">
              {experience?.responsibilities?.map(
                (responsibility: any, Idx: any) => (
                  <li key={Idx}>
                    {responsibility?.category} <br />
                    <ul className="empty-circle list-inside mt-1">
                      {responsibility.details.map(
                        (detail: any, detailIdx: any) => (
                          <li key={detailIdx}>{detail}</li>
                        )
                      )}
                    </ul>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}

        {/* ============== education ============== */}
        <h2 className="text-[18px] font-bold text-green-600 mt-4 uppercase">
          Education
        </h2>
        <div className="!mt-[1px] w-full">
          <div className="flex w-full justify-between items-center">
            <h3 className="!mt-0 max-w-[50%]">
              <span className="font-bold">
                {education?.institution} | {education?.degree}
              </span>{" "}
              | {education?.location}
            </h3>
            <span className="italic font-400">
              {" "}
              {education?.duration || education?.graduationDate}
            </span>
          </div>
          <div>
            Concentrations: {education?.concentrations?.join(", ")} Minor in{" "}
            {education?.minor} | GPA: {education?.gpa}
          </div>
          <ul className="list-disc list-inside text-sm ml-6 mb-4">
            {education?.achievements?.map((achievement: any, Idx: any) => (
              <li key={Idx}>{achievement}</li>
            ))}
          </ul>
        </div>

        {/* ============== skills ============== */}
        <h2 className="text-[18px] font-bold text-green-600 mt-4 uppercase">
          Skills & Interests
        </h2>
        <div className="!mt-[1px]"> 
          <span className="font-bold">Interests: </span>
          {skillsAndInterests?.interests?.join(", ")}
        </div>
        <div>
          <span className="font-bold">Languages: </span>Native in{" "}
          {skillsAndInterests?.languages?.native?.join(", ")}; Fluent in{" "}
          {skillsAndInterests?.languages?.fluent?.join(", ")}
        </div>
        <div>
          <span className="font-bold">Technical: </span>
          {skillsAndInterests?.technical?.join(", ")}
        </div>
      </div>
    </div>
  );
}

export default TemplateOne;
