"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { logoutUser } from "@/lib/firebase/firebaseUtils";
import { 
  FaBriefcase, 
  FaFile, 
  FaFileAlt,
  FaCog, 
  FaGlobe,
  FaQuestionCircle 
} from "react-icons/fa";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

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
      ]
    },
    {
      group: "Extra",
      items: [
        { name: "Auto apply", icon: <FaCog />, path: "/auto-apply" },
      ]
    }
  ];

  return (
    <div className="w-56 bg-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-4 font-bold text-xl">JobApplyAI</div>

      <div className="flex-1 overflow-y-auto">
        {navItems.map((group) => (
          <div key={group.group} className="mb-4">
            <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {group.group}
            </div>
            <nav>
              {group.items.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`flex items-center px-4 py-3 text-sm ${
                    isActive(item.path)
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        ))}
      </div>

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
            className="flex items-center py-2 px-4 hover:bg-gray-700 cursor-pointer rounded"
          >
            <FaQuestionCircle className="mr-3" />
            <span>Login</span>
          </Link>
        )}
        <div className="flex items-center py-2 px-4 hover:bg-gray-700 cursor-pointer rounded">
          <FaQuestionCircle className="mr-3" />
          <span>Support</span>
        </div>
      </div>
    </div>
  );
} 