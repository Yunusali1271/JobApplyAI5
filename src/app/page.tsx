"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import ApplicationModal from "@/components/ApplicationModal";
import { FaUser } from "react-icons/fa";
import styles from './styles/rocket.module.css';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [pricingPlan, setPricingPlan] = useState({
    price: "£4.99",
    period: "per month",
    activeTab: "monthly"
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Add scroll to section functionality
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handlePricingTabChange = (plan) => {
    if (plan === "monthly") {
      setPricingPlan({
        price: "£4.99",
        period: "per month",
        activeTab: "monthly"
      });
    } else if (plan === "quarterly") {
      setPricingPlan({
        price: "£3.99",
        period: "per month",
        activeTab: "quarterly"
      });
    } else if (plan === "yearly") {
      setPricingPlan({
        price: "£2.99",
        period: "per month",
        activeTab: "yearly"
      });
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <main className="min-h-screen">
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
          pointer-events: none;
        }
      `}</style>
      
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center">
          <span className="text-2xl font-bold">jobapplyai</span>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-8">
          <button onClick={(e) => {
            e.preventDefault();
            scrollToSection('pricing');
          }} className="text-gray-600 hover:text-gray-900 cursor-pointer">Pricing</button>
          <button onClick={(e) => {
            e.preventDefault();
            scrollToSection('features');
          }} className="text-gray-600 hover:text-gray-900 cursor-pointer">Features</button>
          <button onClick={(e) => {
            e.preventDefault();
            scrollToSection('about');
          }} className="text-gray-600 hover:text-gray-900 cursor-pointer">About</button>
          <button onClick={(e) => {
            e.preventDefault();
            scrollToSection('testimonials');
          }} className="text-gray-600 hover:text-gray-900 cursor-pointer">Blog</button>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/job-hub" className="text-gray-600 hover:text-gray-900 flex items-center">
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
              <Link href="/login" className="text-gray-600 hover:text-gray-900">Log in</Link>
              <button 
                onClick={openModal}
                className="bg-[#7046EC] text-white px-4 py-2 rounded-lg hover:bg-[#5e3bc4] transition-colors"
              >
                Start now
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <h1 className="text-[56px] leading-[1.1] tracking-[-0.002em]">
          <span className="block text-[#6e6e73] font-[510] mb-1">Your Automated AI-Powered</span>
          <span className="block text-[#1d1d1f] font-[600]">Job Search Assistant</span>
        </h1>
        <div className="mt-12 flex flex-col items-center">
          <p className="text-[#6e6e73] text-[21px] leading-[1.4] max-w-[600px] mx-auto">
            The AI-powered tool to help you create personalized, job-specific cover 
            letters and resumes with ease.
          </p>
          <button 
            onClick={openModal}
            className="mt-8 bg-[#7046EC] text-white px-10 py-3.5 rounded-full text-[17px] font-medium hover:bg-[#5e3bc4] transition-colors"
          >
            Start now - it&apos;s free
          </button>
          <div className="mt-12 flex items-center justify-center gap-2 text-[#6e6e73]">
            <div className="flex -space-x-2">
              <Image
                src="/AIpic1.jpg"
                alt="Profile 1"
                width={100}
                height={100}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
                priority
                unoptimized
              />
              <Image
                src="/AIpic2.jpg"
                alt="Profile 2"
                width={100}
                height={100}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
                priority
                unoptimized
              />
              <Image
                src="/AIpic3.jpeg"
                alt="Profile 3"
                width={100}
                height={100}
                className="w-8 h-8 rounded-full border-2 border-white object-cover"
                priority
                unoptimized
              />
            </div>
            <span className="text-[14px]">Loved by over 200,000 job seekers</span>
          </div>
        </div>
      </div>

      {/* Company Logos Section */}
      <div className="border-t border-[#f5f5f7] bg-[#fafafa] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16 relative">
          <p className="text-center text-[#86868b] text-[12px] tracking-[0.12em] uppercase mb-6">Get hired by top companies worldwide</p>
          <div className="logo-container relative h-[120px] mx-auto overflow-hidden max-w-[85%] mt-6">
            {/* Left fade mask */}
            <div className="absolute left-0 top-0 h-full w-[120px] z-10 bg-gradient-to-r from-[#fafafa] to-transparent"></div>
            {/* Right fade mask */}
            <div className="absolute right-0 top-0 h-full w-[120px] z-10 bg-gradient-to-l from-[#fafafa] to-transparent"></div>
            <div className="flex animate-scroll">
              {/* First set of logos */}
              <div className="flex justify-evenly items-center shrink-0 w-full" style={{ minWidth: "1000px" }}>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/spotify.svg"
                    alt="Spotify"
                    width={80}
                    height={24}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/microsoft.svg"
                    alt="Microsoft"
                    width={80}
                    height={24}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/instagram.svg"
                    alt="Instagram"
                    width={80}
                    height={24}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/google.svg"
                    alt="Google"
                    width={100}
                    height={30}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/x.svg"
                    alt="X"
                    width={80}
                    height={24}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
              </div>
              {/* Second set of logos */}
              <div className="flex justify-evenly items-center shrink-0 w-full" style={{ minWidth: "1000px" }}>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/spotify.svg"
                    alt="Spotify"
                    width={80}
                    height={24}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/microsoft.svg"
                    alt="Microsoft"
                    width={80}
                    height={24}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/instagram.svg"
                    alt="Instagram"
                    width={80}
                    height={24}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/google.svg"
                    alt="Google"
                    width={100}
                    height={30}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/x.svg"
                    alt="X"
                    width={80}
                    height={24}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
              </div>
              {/* Third set of logos for smoother transition */}
              <div className="flex justify-evenly items-center shrink-0 w-full" style={{ minWidth: "1000px" }}>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/spotify.svg"
                    alt="Spotify"
                    width={80}
                    height={24}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/microsoft.svg"
                    alt="Microsoft"
                    width={80}
                    height={24}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/instagram.svg"
                    alt="Instagram"
                    width={80}
                    height={24}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/google.svg"
                    alt="Google"
                    width={100}
                    height={30}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
                <div className="relative w-[150px] h-[90px] flex items-center justify-center">
                  <Image 
                    src="/logos/x.svg"
                    alt="X"
                    width={80}
                    height={24}
                    style={{ objectFit: "contain" }}
                    className="opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Example Output Section */}
      <div id="about" className="bg-[#f5f5f7] py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <div className="mb-16">
              <h2 className="text-5xl font-semibold">
                Better Resume.
                <br />
                <span className="mt-2 inline-block">Faster Search. More Offers.</span>
              </h2>
              <p className="text-xl text-gray-600 mt-6">
                Automated Job Winning Resumes and Cover Letters to land your next position sooner
              </p>
            </div>
          </div>
          <div className="flex justify-center items-start gap-20">
            {/* Cover Letter */}
            <div className="relative">
              <h3 className="text-xl font-semibold text-center absolute -top-10 left-0 right-0">Job-specific cover letter</h3>
              <div className="bg-white shadow-xl transform hover:scale-[1.02] transition-transform rotate-[-2deg] origin-top overflow-hidden rounded-lg">
                <div className="bg-white p-6" style={{ width: '450px', height: '550px' }}>
                  <div className="space-y-3">
                    <p className="text-gray-800 text-sm font-medium">Dear HR Manager,</p>
                    <p className="text-gray-800 leading-tight text-xs">
                      Innovation isn&apos;t just about building something new—it&apos;s about rethinking what&apos;s possible. I see that JobApplyAI is 
                      looking for someone who challenges conventions and redefines industries. That&apos;s not just a job description; it&apos;s a 
                      mission. And it&apos;s the kind of mission that has driven my career.
                    </p>
                    <p className="text-gray-800 leading-tight text-xs">
                      Technology should be intuitive, beautifully designed, and deeply integrated into people&apos;s lives. But more than that, it 
                      should inspire. The best products don&apos;t just solve problems—they create movements, reshape behaviors, and 
                      elevate human potential. That&apos;s the kind of work I do.
                    </p>
                    <p className="text-gray-800 leading-tight text-xs">
                      I believe in first principles thinking. I believe in tearing down what doesn&apos;t work and building something better from 
                      the ground up. I believe that great products come from the intersection of design, engineering, and user experience 
                      —where art meets technology.
                    </p>
                    <p className="text-gray-800 leading-tight text-xs">
                      At JobApplyAI, you have the opportunity to shape the future of AI-driven career tools, to not just automate resumes 
                      but to reinvent how people present their skills to the world. I&apos;d love to be part of that journey.
                    </p>
                    <p className="text-gray-800 text-xs">Let&apos;s talk.</p>
                    <div className="mt-3">
                      <p className="text-gray-800 text-xs">Best,</p>
                      <p className="text-gray-800 font-medium mt-1 text-xs">Steve</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume */}
            <div className="relative">
              <h3 className="text-xl font-semibold text-center absolute -top-10 left-0 right-0">Job-specific resume</h3>
              <div className="shadow-xl transform hover:scale-[1.02] transition-transform rotate-[2deg] origin-top overflow-hidden rounded-lg">
                <Image
                  src="/steve-jobs.jpg"
                  alt="Example Resume"
                  width={450}
                  height={550}
                  style={{ width: '450px', height: '550px', objectFit: 'contain' }}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Capabilities Section */}
      <div id="features" className="max-w-7xl mx-auto px-6 py-16 relative">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-semibold mb-4">
            Need to level up your career even <span className="text-[#7046EC]">faster</span>
            <span className={styles.rocketAnimation} role="img" aria-label="rocket">🚀</span>?
          </h2>
          <p className="text-xl text-gray-600">
            Our AI-powered tools help you create the perfect application
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8 relative mb-12">
          {/* AI Resume Builder */}
          <div className="bg-white rounded-xl p-6 border border-[#7046EC] transition-all duration-300 hover:shadow-[0_0_15px_rgba(112,70,236,0.3)] relative z-10">
            <h3 className="text-xl font-semibold mb-3">AI Resume Builder</h3>
            <p className="text-gray-600 mb-6">AI creates the perfect resume for every application, based on your skills</p>
            <div className="border-2 border-dashed border-[#7046EC] rounded-lg p-8 text-center group hover:shadow-[0_0_15px_rgba(112,70,236,0.3)] transition-all duration-300">
              <div className="flex flex-col items-center gap-3 relative">
                <svg className="w-8 h-8 text-[#7046EC] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a3 3 0 01-3-3V6a3 3 0 013-3h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V13a3 3 0 01-3 3H7z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11v8m0 0l-4-4m4 4l4-4"></path>
                </svg>
                <p className="text-sm text-[#7046EC]">Drag and drop PDFs</p>
                <p className="text-xs text-blue-500 hover:underline cursor-pointer">click to browse</p>
                
                {/* PDF Animation */}
                <div className="absolute right-0 bottom-0 transform translate-x-1/4 translate-y-1/4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="relative w-20 h-24">
                    {/* PDF Document */}
                    <div className="absolute inset-0 bg-white border border-gray-300 rounded shadow-sm">
                      {/* Document lines */}
                      <div className="pt-3 px-3 pb-12">
                        <div className="space-y-2">
                          <div className="h-0.5 bg-gray-200 w-full rounded"></div>
                          <div className="h-0.5 bg-gray-200 w-full rounded"></div>
                          <div className="h-0.5 bg-gray-200 w-3/4 rounded"></div>
                          <div className="h-0.5 bg-gray-200 w-full rounded"></div>
                          <div className="h-0.5 bg-gray-200 w-full rounded"></div>
                          <div className="h-0.5 bg-gray-200 w-full rounded"></div>
                        </div>
                      </div>
                      
                      {/* Folded corner */}
                      <div className="absolute top-0 right-0 w-5 h-5 bg-gray-100 transform rotate-0">
                        <div className="absolute bottom-0 right-0 w-0 h-0 border-b-[20px] border-r-[20px] border-b-white border-r-white"></div>
                      </div>
                      
                      {/* PDF Label */}
                      <div className="absolute top-1/2 left-0 right-0 bg-red-600 py-2 flex items-center justify-center">
                        <span className="text-white font-bold text-lg tracking-wide">PDF</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Cover Letter */}
          <div className="bg-white rounded-xl p-6 border border-[#7046EC] transition-all duration-300 hover:shadow-[0_0_15px_rgba(112,70,236,0.3)] relative z-10">
            <h3 className="text-xl font-semibold mb-3">AI Cover Letter</h3>
            <p className="text-gray-600 mb-6">AI creates tailored cover letters, helping you stand out and get hired.</p>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex gap-2 mb-4">
                <span className="px-3 py-1 text-sm bg-white rounded border border-gray-200">Formal</span>
                <span className="px-3 py-1 text-sm bg-white rounded border border-gray-200">Proactive</span>
                <span className="px-3 py-1 text-sm bg-white rounded border border-gray-200">Concise</span>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              </div>
              <button className="mt-6 flex items-center gap-2 text-sm text-gray-700 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Cover Letter PDF
              </button>
            </div>
          </div>

          {/* Auto Apply */}
          <div className="bg-white rounded-xl p-6 border border-[#7046EC] transition-all duration-300 hover:shadow-[0_0_15px_rgba(112,70,236,0.3)] relative z-10">
            <h3 className="text-xl font-semibold mb-3">Auto Apply</h3>
            <p className="text-gray-600 mb-6">Let AI streamline your job hunt—apply more, save time, get hired.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm">Software Engineer</span>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Applied</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm">Frontend Developer</span>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Applied</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm">Full Stack Developer</span>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Applied</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section with connecting lines */}
      <div className="text-center pt-0 pb-12 relative">
        {/* Connecting lines between cards and heading */}
        <div className="relative mx-auto" style={{ maxWidth: "1200px" }}>
          <svg className="absolute top-0 left-0 w-full h-24 overflow-visible" style={{ marginTop: "-100px" }}>
            {/* Left connecting line */}
            <line 
              x1="250" y1="20" 
              x2="280" y2="50" 
              stroke="#e5e7eb" 
              strokeWidth="1.5"
            />
            {/* Middle connecting line */}
            <line 
              x1="600" y1="20" 
              x2="600" y2="60" 
              stroke="#e5e7eb" 
              strokeWidth="1.5"
            />
            {/* Right connecting line - tilted 45 degrees */}
            <line 
              x1="950" y1="20" 
              x2="920" y2="50" 
              stroke="#e5e7eb" 
              strokeWidth="1.5"
            />
          </svg>
        </div>
        <h2 className="text-4xl font-semibold mb-8">
          You are <span className="text-[#7046EC]">78%</span> more likely to get hired using JobApplyAI
        </h2>
        <button 
          onClick={openModal}
          className="inline-block bg-[#7046EC] text-white px-10 py-4 rounded-full text-lg font-medium hover:bg-[#5e3bc4] transition-colors"
        >
          Start now
        </button>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <span className="text-[#7046EC] text-sm font-medium tracking-wider uppercase mb-4 block">
            CUSTOMER LOVE
          </span>
          <h2 className="text-[48px] font-semibold leading-tight mb-6">
            Join 200,000 empowered job seekers
          </h2>
          <p className="text-gray-600 text-xl">
            JobApplyAI has helped secure over 200,000 job interviews. From entry-level positions to executive roles, we&apos;ve got you covered.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* First Row */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#7046EC] transition-all duration-300 hover:shadow-[0_0_15px_rgba(112,70,236,0.3)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/AIpic4.jpg"
                  alt="Sarah Wilson"
                  fill
                  sizes="40px"
                  className="rounded-full object-cover"
                  priority
                />
              </div>
              <div>
                <h3 className="font-medium">Sarah Wilson</h3>
                <p className="text-gray-500 text-sm">@sarahw • 2d ago</p>
              </div>
            </div>
            <p className="text-gray-600">
              Got my dream job at Google thanks to JobApplyAI! The personalized cover letter really made my application stand out. This tool is a game-changer! 🚀
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#7046EC] transition-all duration-300 hover:shadow-[0_0_15px_rgba(112,70,236,0.3)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/AIpic5.jpg"
                  alt="Michael Chen"
                  fill
                  sizes="40px"
                  className="rounded-full object-cover"
                  priority
                />
              </div>
              <div>
                <h3 className="font-medium">Michael Chen</h3>
                <p className="text-gray-500 text-sm">@mchen • 1w ago</p>
              </div>
            </div>
            <p className="text-gray-600">
              I was struggling with writer&apos;s block until I found JobApplyAI. Now I can generate tailored cover letters in minutes. Applied to 50+ jobs in a week! 💪
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#7046EC] transition-all duration-300 hover:shadow-[0_0_15px_rgba(112,70,236,0.3)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/AIpic6.jpg"
                  alt="Emily Rodriguez"
                  fill
                  sizes="40px"
                  className="rounded-full object-cover"
                  priority
                />
              </div>
              <div>
                <h3 className="font-medium">Emily Rodriguez</h3>
                <p className="text-gray-500 text-sm">@emrodriguez • 3d ago</p>
              </div>
            </div>
            <p className="text-gray-600">
              The AI understands exactly what recruiters want to see. My interview success rate has increased by 300% since using JobApplyAI! 📈
            </p>
          </div>

          {/* Second Row */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#7046EC] transition-all duration-300 hover:shadow-[0_0_15px_rgba(112,70,236,0.3)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 overflow-hidden rounded-full">
                <Image
                  src="/James.jpeg"
                  alt="James Thompson"
                  width={40}
                  height={40}
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
              <div>
                <h3 className="font-medium">James Thompson</h3>
                <p className="text-gray-500 text-sm">@jamest • 5d ago</p>
              </div>
            </div>
            <p className="text-gray-600">
              Switching careers was daunting, but JobApplyAI helped me highlight my transferable skills perfectly. Just landed a role in tech with no prior experience! 🎯
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#7046EC] transition-all duration-300 hover:shadow-[0_0_15px_rgba(112,70,236,0.3)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 overflow-hidden rounded-full">
                <Image
                  src="/lisa.jpg"
                  alt="Lisa Patel"
                  width={40}
                  height={40}
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
              <div>
                <h3 className="font-medium">Lisa Patel</h3>
                <p className="text-gray-500 text-sm">@lisap • 1d ago</p>
              </div>
            </div>
            <p className="text-gray-600">
              As a recent graduate, I was lost on how to write compelling cover letters. JobApplyAI made it so easy! Already got 3 interview calls this week 🎓
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-[#7046EC] transition-all duration-300 hover:shadow-[0_0_15px_rgba(112,70,236,0.3)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10 overflow-hidden rounded-full">
                <Image
                  src="/michael.jpg"
                  alt="David Kim"
                  width={40}
                  height={40}
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
              <div>
                <h3 className="font-medium">David Kim</h3>
                <p className="text-gray-500 text-sm">@davidk • 4d ago</p>
              </div>
            </div>
            <p className="text-gray-600">
              Compared this with other AI tools - JobApplyAI is 10x better! The customization options and industry-specific knowledge are unmatched ⭐
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-100">
        <div className="text-center mb-12">
          <span className="text-[#7046EC] text-sm font-medium tracking-wider uppercase mb-4 block">
            PRICING
          </span>
          <h2 className="text-[48px] font-semibold leading-tight mb-4">
            Start writing better cover letters today
          </h2>
          <p className="text-gray-600 text-xl">
            Choose the perfect plan for your job search needs
          </p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-100 p-1 rounded-full relative">
            {/* Sliding background */}
            <div 
              className="absolute top-1 bottom-1 rounded-full bg-[#7046EC] transition-all duration-300 ease-in-out z-0"
              style={{ 
                left: pricingPlan.activeTab === "monthly" ? "4px" : pricingPlan.activeTab === "quarterly" ? "calc(33.33% + 2px)" : "calc(66.66% + 0px)",
                width: "calc(33.33% - 6px)"
              }}
            ></div>
            
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium relative z-10 transition-colors duration-300 ${pricingPlan.activeTab === "monthly" ? "text-white" : "text-gray-600"}`}
              onClick={() => handlePricingTabChange("monthly")}
            >
              Monthly
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium relative z-10 transition-colors duration-300 ${pricingPlan.activeTab === "quarterly" ? "text-white" : "text-gray-600"}`}
              onClick={() => handlePricingTabChange("quarterly")}
            >
              Quarterly
            </button>
            <button 
              className={`px-6 py-2 rounded-full text-sm font-medium relative z-10 transition-colors duration-300 ${pricingPlan.activeTab === "yearly" ? "text-white" : "text-gray-600"}`}
              onClick={() => handlePricingTabChange("yearly")}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="w-full max-w-md bg-white rounded-xl p-8 relative overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(112,70,236,0.6)] group">
            {/* Animated gradient border effect */}
            <div className="absolute inset-0 rounded-xl p-[2px] bg-gradient-to-r from-[#7046EC] via-[#EE786C] to-[#43c6ac] bg-[length:200%_200%] animate-gradient-shift"></div>
            <div className="absolute inset-[2px] bg-white rounded-lg"></div>
            
            {/* Glow effect on hover */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,rgba(112,70,236,0.3)_0%,transparent_70%)]"></div>
            
            {/* Content */}
            <div className="relative z-10">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center">
                  <span className="text-gray-400 line-through text-sm mr-2">£9.99</span>
                  <span className="text-4xl font-bold">{pricingPlan.price}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{pricingPlan.period}</p>
                <p className="text-green-500 text-sm font-medium mt-2">Limited time 50% discount</p>
              </div>

              <p className="text-center text-gray-600 mb-6">
                Upgrade to unlock JobApplyAI premium features and turbocharge your job search.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-600">AI Resume Builder</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-600">AI Cover Letter</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-600">Resume Translator</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-600">Streamline service</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-600">Automatic templates</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-600">Customer Satisfaction</span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-[#7046EC] to-[#EE786C] text-white py-3 rounded-full font-medium hover:shadow-lg hover:shadow-[rgba(112,70,236,0.4)] transition-all duration-300">
                Get Started Now
              </button>

              <div className="mt-6 text-center">
                <div className="flex justify-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">Loved by 262,568 users</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <span className="text-gray-500">jobapplyai</span>
          </div>
          <div className="text-sm text-gray-500">
            © 2023 JobApplyAI. All rights reserved.
          </div>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700">Privacy</Link>
            <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700">Terms</Link>
          </div>
        </div>
      </footer>

      {/* Application Modal */}
      <ApplicationModal isOpen={isModalOpen} onClose={closeModal} />
    </main>
  );
}
