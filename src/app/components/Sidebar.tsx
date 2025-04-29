"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { logoutUser } from "@/lib/firebase/firebaseUtils";
import { useState } from "react";
import {
  FaBriefcase,
  FaFile,
  FaFileAlt,
  FaCog,
  FaGlobe,
  FaQuestionCircle,
  FaBars,
  FaTimes,
} from "react-icons/fa";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [showSupportPopup, setShowSupportPopup] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => pathname === path;
  const toggleSupportPopup = () => setShowSupportPopup(!showSupportPopup);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const navItems = [
    {
      group: "Tools",
      items: [
        { name: "Job Hub", icon: <FaBriefcase />, path: "/job-hub" },
        { name: "Resumes", icon: <FaFile />, path: "/resumes" },
        { name: "Cover Letters", icon: <FaFileAlt />, path: "/cover-letters" },
      ],
    },
    {
      group: "Premium",
      items: [
        { name: "Interview Assistant", icon: <FaCog />, path: "/auto-apply" },
      ],
    },
  ];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-8 z-50 p-2 bg-[#1a1f2b] rounded-md text-white lg:hidden"
      >
        {sidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Overlay - click outside to close */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-[#1a1f2b] text-white flex flex-col z-50
    transform transition-transform duration-300 ease-in-out
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
    ${!sidebarOpen ? "hidden lg:flex" : ""}
    lg:translate-x-0 lg:relative lg:w-56 lg:min-h-screen`}
      >
        <Link href="/" className="p-4 hover:text-gray-300 transition-colors">
          <span className="text-xl font-bold">JobApply</span>
        </Link>

        <div className="flex-1 overflow-y-auto">
          {navItems.map((group) => (
            <div key={group.group} className="mb-4">
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {group.group}
              </div>
              <nav>
                {group.items.map((item) =>
                  item.name === "Interview Assistant" ? (
                    <div
                      key={item.name}
                      className="flex items-center px-4 py-3 text-sm text-gray-300 cursor-default"
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </div>
                  ) : (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={() => setSidebarOpen(false)} // close on mobile nav click
                      className={`flex items-center px-4 py-3 text-sm ${
                        isActive(item.path)
                          ? "bg-gray-900 text-white"
                          : "text-gray-300 hover:bg-gray-700"
                      }`}
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  )
                )}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center py-2 px-4 hover:bg-gray-700 cursor-pointer rounded">
            <FaGlobe className="mr-3" />
            <span>English</span>
          </div>
          {user ? (
            <div
              onClick={handleLogout}
              className="flex items-center py-2 px-4 hover:bg-gray-700 cursor-pointer rounded"
            >
              <FaQuestionCircle className="mr-3" />
              <span>Logout</span>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center py-2 px-4 hover:bg-gray-700 cursor-pointer rounded"
            >
              <FaQuestionCircle className="mr-3" />
              <span>Login</span>
            </Link>
          )}
          <div className="relative">
            <div
              className="flex items-center py-2 px-4 hover:bg-gray-700 cursor-pointer rounded"
              onClick={toggleSupportPopup}
            >
              <FaQuestionCircle className="mr-3" />
              <span>Support</span>
            </div>

            {showSupportPopup && (
              <div className="absolute bottom-full left-0 mb-2 w-60 bg-white text-gray-800 rounded-md shadow-lg p-3 z-10">
                <p className="text-sm font-medium">Need help? Contact us at:</p>
                <p className="text-sm mt-1 text-blue-600 break-all">
                  jobapplyAIservice@gmail.com
                </p>
                <div
                  className="absolute top-full left-4 w-3 h-3 bg-white transform rotate-45"
                  style={{ marginTop: "-6px" }}
                ></div>
              </div>
            )}
          </div>
          <Link
            href="/manage-subscription"
            onClick={() => setSidebarOpen(false)}
            className="block text-xs text-gray-500 hover:text-gray-400 mt-3 ml-4"
          >
            Manage Subscription
          </Link>
        </div>
      </div>
    </>
  );
}
