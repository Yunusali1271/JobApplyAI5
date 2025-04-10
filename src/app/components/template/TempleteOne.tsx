import React from 'react';

function TemplateOne({ result }: { result: any }) {
  const professionalExperience = result?.professionalExperience;
  const education = result?.education;
  const skillsAndInterests = result?.skillsAndInterests;
  const personalInformation = result?.personalInformation;
  return (
    <div className="bg-white text-black p-4 flex justify-center">
      <div className="w-full pt-12 p-6 max-w-[1200px]">
        {/* Name */}
        <h1 className="text-3xl font-bold text-center uppercase">
          {personalInformation?.name}
        </h1>

        {/* Contact Info */}
        <div className="flex justify-between text-sm mt-2 border-b-2 border-black pb-2">
          <div>
            <p className="font-semibold">
              <span className="text-green-600">Email me:</span>{' '}
              {personalInformation?.email}
            </p>
            <p className="font-semibold">
              <span className="text-green-600">Call me:</span>{' '}
              {personalInformation?.phone}
            </p>
          </div>
          <div className="text-right flex justify-start flex-col items-start">
            <p className="font-semibold">
              <span className="text-green-600">LinkedIn:</span>{' '}
              <a
                href={personalInformation?.linkedin}
                target="_blank"
                rel="noopener noreferrer"
              >
                {personalInformation?.linkedin}
              </a>
            </p>
            <p className="font-semibold">
              <span className="text-green-600">Address:</span>{' '}
              {personalInformation?.address}
            </p>
          </div>
        </div>

        {/* ============== professional experience ============== */}
        <h2 className="text-xl font-bold text-green-700 mt-4 uppercase">
          Professional Experience
        </h2>

        {professionalExperience?.map((experience: any, index: any) => (
          <div key={index} className="mt-[5px] w-full">
            <h3>
              <span className="font-bold">
                {experience?.company} - {experience?.position}:
              </span>{' '}
              {experience?.location}
              <span className="italic font-400">{experience?.duration}</span>
            </h3>
            <ul className="list-disc list-inside text-sm mt-2">
              {experience?.responsibilities?.map(
                (responsibility: any, Idx: any) => (
                  <li key={Idx}>
                    {responsibility.category} <br />
                    <ul className="empty-circle list-inside ml-6 mt-1">
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
        <h2 className="text-xl font-bold text-green-700 mt-4 uppercase">
          Education
        </h2>
        <div className="mt-[5px] w-full">
          <h3 className="!mt-0">
            <span className="font-bold">
              {education?.institution} | {education?.degree}
            </span>{' '}
            | {education?.location} |{' '}
            {education?.duration || education?.graduationDate}
          </h3>
          <div>
            Concentrations: {education?.concentrations?.join(', ')} Minor in{' '}
            {education?.minor} | GPA: {education?.gpa} / 4.0
          </div>
          <ul className="list-disc list-inside text-sm mt-2">
            {education?.achievements?.map((achievement: any, Idx: any) => (
              <li key={Idx}>{achievement}</li>
            ))}
          </ul>
        </div>

        {/* ============== skills ============== */}
        <h2 className="text-xl font-bold text-green-700 mt-4 uppercase">
          Skills & Interests
        </h2>
        <div className="mt-[5px]">
          <span className="font-bold">Interests: </span>
          {skillsAndInterests?.interests?.join(', ')}
        </div>
        <div>
          <span className="font-bold">Languages: </span>Native in{' '}
          {skillsAndInterests?.languages?.native?.join(', ')}; Fluent in{' '}
          {skillsAndInterests?.languages?.fluent?.join(', ')}
        </div>
        <div>
          <span className="font-bold">Technical: </span>
          {skillsAndInterests?.technical?.join(', ')}
        </div>
      </div>
    </div>
  );
}

export default TemplateOne;
