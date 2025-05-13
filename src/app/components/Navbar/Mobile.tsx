import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaBars, FaTimes, FaUser } from "react-icons/fa";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
//import { useIpLimits } from "@/lib/hooks/useIpLimits";

const Mobile = () => {
  const { user } = useAuth();
    const router = useRouter();
  //const { hasCreatedPack } = useIpLimits();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const openModal = () => {
    setIsModalOpen(true);
    setMenuOpen(false); // Optional: close menu when modal opens
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false);
    }
  };

  const handleStartNowClick = () => {
    router.push('/job-hub');
    setMenuOpen(false);
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
      {/* Logo */}
      <div className="flex items-center">
        <Image
          src="/jobapply-logo.jpg"
          alt="JobApply Logo"
          width={150}
          height={33}
          priority
          className="h-auto w-auto"
          style={{ objectFit: "contain", maxWidth: "150px", maxHeight: "33px" }}
          quality={100}
          unoptimized
        />
      </div>

      {/* Hamburger Icon */}
      <div className="text-2xl text-gray-600 cursor-pointer" onClick={toggleMenu}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white shadow-lg flex flex-col items-center gap-6 py-8 z-50">
          <button
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("pricing");
            }}
            className="text-gray-600 hover:text-gray-900"
          >
            Pricing
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("features");
            }}
            className="text-gray-600 hover:text-gray-900"
          >
            Features
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("about");
            }}
            className="text-gray-600 hover:text-gray-900"
          >
            About
          </button>
          <Link
            href="/blog"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => setMenuOpen(false)}
          >
            Blog
          </Link>

          <div className="flex flex-col gap-4 items-center mt-4">
            {user ? (
              <>
                <Link
                  href="/job-hub"
                  className="text-gray-600 hover:text-gray-900 flex items-center"
                  onClick={() => setMenuOpen(false)}
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
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <button
                    onClick={handleStartNowClick}
                    className="bg-[#7046EC] text-white px-4 py-2 rounded-lg hover:bg-[#5e3bc4] transition-colors"
                  >
                    Start now
                  </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Mobile;
