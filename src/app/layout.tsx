import "./globals.css";
import { Metadata } from "next";
import AuthWrapper from "@/lib/components/AuthWrapper";

export const metadata: Metadata = {
  title: "JobApplyAI - AI-Powered Job Search Assistant",
  description: "Create personalized, job-specific cover letters and resumes with ease using AI.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthWrapper>
          {children}
        </AuthWrapper>
      </body>
    </html>
  );
}
