import type { Metadata } from 'next';
import BasicNavigation from '@/components/BasicNavigation';
import Footer from '@/app/components/Footer';

export const metadata: Metadata = {
  title: 'Career Blog | CoverAI',
  description: 'Expert advice on resumes, cover letters, and job applications',
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <BasicNavigation />
      {children}
      <Footer />
    </div>
  );
}