import Link from "next/link"; // Although not used in the current footer, might be useful for future links
import Image from "next/image"; // Although not used in the current footer, might be useful for future images

const Footer = () => {
  return (
    <footer className="w-full border-t border-gray-200 py-8">
      <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 justify-items-center gap-6">
        <div className="flex items-center sm:justify-self-start">
          <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span className="text-gray-500">jobapplyai</span>
        </div>
        <div className="text-sm text-gray-500 sm:justify-self-center text-center">
          © 2023 JobApplyAI. All rights reserved.
        </div>
        <div className="flex gap-4 sm:justify-self-end">
          <Link href="/contact" className="text-sm text-gray-500 hover:underline">Contact Us</Link>
          <Link href="/privacy" className="text-sm text-gray-500 hover:underline">Privacy</Link>
          <Link href="/terms" className="text-sm text-gray-500 hover:underline">Terms of Service</Link>
          <Link href="/security" className="text-sm text-gray-500 hover:underline">Security</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;