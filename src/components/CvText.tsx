"use client";
import { message, Upload } from "antd";
import React from "react";
import * as mammoth from "mammoth";
import pdfToText from "react-pdftotext";

const { Dragger } = Upload;

const CvText = ({ cvText, handleCvTextChange, isProcessing, setFile }: any) => {
  const beforeUpload = (file: File) => {
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
        .then((text) => handleCvTextChange(text))
        .catch((err) => { message.error("PDF error, see console for details"); console.log("PDF error:", err)});
    } else if (
      fileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const reader = new FileReader();

      reader.onload = async (e: any) => {
        const arrayBuffer = e.target.result;
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        handleCvTextChange(value);
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
      setFile(selectedFile);
      extractTextFromFile(selectedFile);
    } else if (status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-6 hire-me-pack space-y-4">
      <p className="font-medium text-black">Enter your CV text</p>
      <textarea
        className="w-full border text-black border-gray-300 rounded-lg p-3 min-h-[150px]"
        placeholder="Copy and paste your CV text here"
        value={cvText}
        onChange={(e) => handleCvTextChange(e.target.value)}
        disabled={isProcessing}
      />
      <p className="text-xs text-gray-500">
        Include your name, contact information, skills, education, and work
        experience
      </p>
      <Dragger
        name="file"
        multiple={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        showUploadList={false}
        customRequest={({ file, onSuccess }) => {
          setTimeout(() => {
            onSuccess && onSuccess("ok");
          }, 500);
        }}
      >
        <p className="text-black font-medium">Drag & drop your file here</p>
      </Dragger>
    </div>
  );
};

export default CvText;
