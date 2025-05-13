import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";
import { FaUser } from "react-icons/fa";
//import { useIpLimits } from "@/lib/hooks/useIpLimits";

const Desktop = () => {
  const { user } = useAuth();
  //const { hasCreatedPack, isLoading: checkingIpStatus } = useIpLimits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Add scroll to section functionality
  const scrollToSection = (sectionId: any) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      <div className="flex items-center">
        <Image
          src="/jobapply-logo.jpg"
          alt="JobApply Logo"
          width={450}
          height={99}
          priority
          className="h-auto w-auto"
          style={{
            objectFit: "contain",
            maxWidth: "450px",
            maxHeight: "99px",
          }}
          quality={100}
          unoptimized
        />
      </div>
      <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-8">
        <button
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("pricing");
          }}
          className="text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          Pricing
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("features");
          }}
          className="text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          Features
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            scrollToSection("about");
          }}
          className="text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          About
        </button>
        <Link
          href="/blog"
          className="text-gray-600 hover:text-gray-900 cursor-pointer"
        >
          Blog
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link
              href="/job-hub"
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <FaUser className="mr-2" /> My Dashboard
            </Link>
            <button
              onClick={openModal}
              className="bg-[#7046EC] text-white px-4 py-2 rounded-lg hover:bg-[#5e3bc4] transition-colors"
            >
              Create Hire Me Pack
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-gray-600 hover:text-gray-900">
              Log in
            </Link>
            (<button
                onClick={openModal}
                className="bg-[#7046EC] text-white px-4 py-2 rounded-lg hover:bg-[#5e3bc4] transition-colors"
              >
                Start now
              </button>)
          </>
        )}
      </div>
    </nav>
  );
};

export default Desktop;
