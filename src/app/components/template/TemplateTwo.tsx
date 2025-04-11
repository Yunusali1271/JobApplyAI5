/* eslint-disable react/no-unescaped-entities */
"use client";
import { Typography, Divider, Row, Col, Space } from "antd";

const { Title, Text, Paragraph } = Typography;

export default function TemplateTwo({ result }: { result: any }) {
  const professionalExperience = result?.professionalExperience;
  const summary = result?.summary;
  const education = result?.education;
  const skillsAndInterests = result?.skillsAndInterests;
  const personalInformation = result?.personalInformation;
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 bg-white">
      {/* Header */}
      <div className="text-center mb-6">
        <Title level={2} className="text-gray-800 m-0 font-serif">
          {personalInformation?.name}
        </Title>
        <div className="flex justify-center items-center gap-1 text-sm mt-1">
          <Space>
            <Text className="text-gray-600 font-semibold !text-[12px]">
              {personalInformation?.address
                ? personalInformation?.address
                : "London"}
            </Text>
            <span className="text-gray-400 !mx-[2px]">•</span>
            <Text className="text-gray-600 font-semibold !text-[12px]">
              {" "}
              {personalInformation?.phone}
            </Text>
            <span className="text-gray-400 !mx-[2px]">•</span>
            <Text className="text-gray-600 font-semibold !text-[12px]">
              {" "}
              {personalInformation?.email}
            </Text>
            <span className="text-gray-400 !mx-[2px]">•</span>

            <Text className="text-gray-600 font-semibold !text-[12px]">
              {professionalExperience[0]?.position}
            </Text>
          </Space>
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6">
        <Title
          level={5}
          className="uppercase font-serif tracking-wider mb-1 text-gray-800"
        >
          Summary
        </Title>
        <Divider className="my-1 bg-gray-300" />
        <Paragraph className="text-sm text-gray-700">{summary}</Paragraph>
      </div>

      {/* Experience */}
      <div className="mb-6">
        <Title
          level={5}
          className="uppercase font-serif tracking-wider mb-1 text-gray-800"
        >
          Experience
        </Title>
        <Divider className="my-1 bg-gray-300" />

        {professionalExperience?.map((experience: any, index: any) => (
          <div className="mb-4" key={index}>
            <div className="flex justify-between items-center">
              <Text strong className="text-gray-800">
                {experience?.company} | {experience?.position}
              </Text>
              <Text className="text-gray-600 text-sm font-semibold">
                {experience?.duration}
              </Text>
            </div>
           
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
        
      </div>

      {/* Education */}
      <div className="mb-6">
        <Title
          level={5}
          className="uppercase font-serif tracking-wider mb-1 text-gray-800"
        >
          Education
        </Title>
        <Divider className="my-1 bg-gray-300" />
        <div className="mb-2">
          <div className="flex justify-between items-center">
            <Text strong className="text-gray-800">
              {education?.degree} | {education?.institution}
            </Text>
          </div>
          
          <div>
            Concentrations: {education?.concentrations?.join(', ')}; Minor in{' '}
            {education?.minor} | GPA: {education?.gpa} / 4.0
          </div>
        </div>
      </div>

      {/* Skills */}
      <div>
        <Title
          level={5}
          className="uppercase font-serif tracking-wider mb-1 text-gray-800"
        >
          Skills
        </Title>
        <Divider className="my-1 bg-gray-300" />
        <Row gutter={[16, 16]} className="mb-5">
          <Col span={8}>
            <Text strong className="text-gray-800">
              Technical{" "}
            </Text>{" "}
          </Col>
          <Col span={16}>
            <Text className="text-gray-700 text-sm">
              {skillsAndInterests?.technical?.join(",  ")}
            </Text>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]} className="mb-5">
          <Col span={8}>
            <Text strong className="text-gray-800">
              Interests{" "}
            </Text>{" "}
          </Col>
          <Col span={16}>
            <Text className="text-gray-700 text-sm">
              {skillsAndInterests?.interests?.join(",  ")}
            </Text>
          </Col>
        </Row>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Text strong className="text-gray-800">
              Languages{" "}
            </Text>{" "}
          </Col>
          <Col span={8}>
            <Text className="text-gray-700 text-sm">Native in </Text>
          </Col>
          <Col span={8}>
            <Text className="text-gray-700 text-sm">
              {skillsAndInterests?.languages?.native?.join(", ")}{" "}
            </Text>
          </Col>
          <Col span={8}></Col>
          <Col span={8}>
            <Text className="text-gray-700 text-sm">Fluent in</Text>
          </Col>
          <Col span={8}>
            <Text className="text-gray-700 text-sm">
              {skillsAndInterests?.languages?.fluent?.join(", ")}
            </Text>
          </Col>
        </Row>
      </div>
    </div>
  );
}
