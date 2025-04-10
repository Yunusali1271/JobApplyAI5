import { message, Upload } from 'antd';
import mammoth from "mammoth";
import React from 'react';
import pdfToText from "react-pdftotext";

const { Dragger } = Upload;

const JobDescription = ({
  jobDescription,
  handleJobDescriptionChange,
  isProcessing,
  isExtractingDetails,
  extractedJobDetails,
  setJobDescriptionFile,
}: any) => {
  const beforeJobDescriptionUpload = (file: File) => {
      const isFileTypeValid =
        file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/pdf";
  
      if (!isFileTypeValid) {
        message.error("You can only upload DOCX or PDF files!");
      }
      return isFileTypeValid|| Upload.LIST_IGNORE;
    };

  const extractTextFromFile = async (file: File) => {
    const fileType = file?.type;
    if (fileType === "application/pdf") {
      pdfToText(file)
        .then((text) => handleJobDescriptionChange(text))
        .catch((err) => { message.error("PDF error:"); console.log("PDF error:", err) });
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const reader = new FileReader();

      reader.onload = async (e: any) => {
        const arrayBuffer = e.target.result;
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        handleJobDescriptionChange(value);
      };
      reader.readAsArrayBuffer(file);
    } else {
      message.info("Only PDF and DOCX files are supported.");
    }
  };
const handleChange = async (info: any) => {
    if (info?.file.type !== "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      info?.file.type !== "application/pdf"){ return
}    const { status } = info.file;
    const selectedFile = info.file.originFileObj;
    if (status === "done" || status === "uploading" || status === "removed") {
      setJobDescriptionFile(selectedFile);
      extractTextFromFile(selectedFile);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };
  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-6 hire-me-pack">
      <p className="font-medium mb-2 text-black">
        Job Description you&apos;d like to tailor your application to
      </p>
      <textarea
        className="w-full text-black border border-gray-300 rounded-lg p-3 min-h-[150px]"
        placeholder="Copy and paste the job description here"
        value={jobDescription}
        onChange={(e) => handleJobDescriptionChange(e.target.value)} // <-- FIXED
        disabled={isProcessing}
      />
      {isExtractingDetails && (
        <p className="text-sm text-purple-600 mt-2">
          Extracting job details...
        </p>
      )}
      {(extractedJobDetails.jobTitle || extractedJobDetails.company) &&
        !isExtractingDetails && (
          <div className="mt-2 p-3 bg-white rounded-lg border border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              Detected Job Details:
            </p>
            <p className="text-sm text-gray-600">
              {extractedJobDetails.jobTitle && (
                <span className="block">
                  Title: {extractedJobDetails.jobTitle}
                </span>
              )}
              {extractedJobDetails.company && (
                <span className="block">
                  Company: {extractedJobDetails.company}
                </span>
              )}
            </p>
          </div>
        )}
      <Dragger
        name="jobDescriptionFile"
        multiple={false}
        beforeUpload={beforeJobDescriptionUpload}
        onChange={handleChange}
        showUploadList={false}
        customRequest={({ file, onSuccess }) => {
          setTimeout(() => {
            onSuccess && onSuccess('ok');
          }, 500);
        }}
      >
        <p className="text-black font-medium">Drag & drop your file here</p>
      </Dragger>
    </div>
  );
};

export default JobDescription;
