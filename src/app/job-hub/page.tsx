"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { getUserApplicationKits } from "@/lib/firebase/applicationKitUtils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa";
import Sidebar from "@/app/components/Sidebar";

interface ApplicationKit {
  id: string;
  jobTitle: string;
  company: string;
  status: string;
  coverLetter: string;
  resume: string;
  followUpEmail: string;
  createdAt: Date;
}

export default function JobHub() {
  const { user } = useAuth();
  const router = useRouter();
  const [applicationKits, setApplicationKits] = useState<ApplicationKit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplicationKits = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        const kits = await getUserApplicationKits(user.uid);
        // Convert Firestore timestamps to Date objects
        const formattedKits = kits.map((kit: any) => ({
          ...kit,
          createdAt: kit.createdAt?.toDate() || new Date(),
        }));
        
        setApplicationKits(formattedKits);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching application kits:", error);
        setLoading(false);
      }
    };

    fetchApplicationKits();
  }, [user]);

  const navigateToHome = () => {
    router.push("/");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Job Hub</h1>
            <p>Please sign in to view your application kits.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Job Hub</h1>
              <p className="text-gray-600">
                Your job hub is where you can manage all your application kits and track job applications.
              </p>
            </div>
            <button 
              onClick={navigateToHome}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full flex items-center"
            >
              <FaPlus className="mr-2" /> New Application Kit
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <p>Loading your applications...</p>
            </div>
          ) : applicationKits.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium">No application kits yet</h3>
              <p className="text-gray-500 mt-2">
                Create your first application kit to get started.
              </p>
              <button 
                onClick={navigateToHome}
                className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
              >
                Create Application Kit
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cover Letter
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resume
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Follow-up
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Application Kit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applicationKits.map((kit) => (
                    <tr key={kit.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-indigo-600 font-medium">{kit.status || "Interested"}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{kit.jobTitle}</div>
                        <div className="text-sm text-gray-500">{kit.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/job-hub/${kit.id}?tab=coverLetter`}
                          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded shadow text-sm"
                        >
                          Open
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/job-hub/${kit.id}?tab=resume`}
                          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded shadow text-sm"
                        >
                          Open
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded shadow text-sm"
                          onClick={() => {
                            navigator.clipboard.writeText(kit.followUpEmail);
                            alert('Follow-up email copied to clipboard!');
                          }}
                        >
                          Copy
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/job-hub/${kit.id}`}
                          className="inline-flex items-center justify-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          <span className="mr-1">⦿</span> Open
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 