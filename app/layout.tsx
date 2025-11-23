"use client";
import "./globals.css";

import { ReactNode, useState, useEffect, useMemo } from "react";
import { Zap, Code, Database, Server, Palette, Briefcase, Linkedin } from 'lucide-react';

// NOTE: External CSS imports and metadata exports are removed as they are not supported
// in this single-file environment, relying solely on Tailwind CSS classes.

// --- Header Component (New) ---
const Header = () => {
  // Yash Sharma's links extracted from the provided CV
  const linkedInUrl = "https://linkedin.com/in/yash-sharma1401";
  const portfolioUrl = "https://port-folio-ne-xt.vercel.app";
  const email = "mailto:yashsharmal4jan@gmail.com";

  return (
    // Fixed, translucent header for a sleek, modern look
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Name and Title */}
        <div className="text-xl font-extrabold text-indigo-600 tracking-tight flex items-center space-x-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          <span>Yash Sharma</span>
          <span className="text-gray-500 font-normal text-sm hidden md:inline">| Full Stack Developer</span>
        </div>

        {/* Navigation Links (Portfolio, LinkedIn) */}
        <nav className="flex items-center space-x-4 sm:space-x-6">
          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition duration-150 ease-in-out flex items-center space-x-1"
            title="View Portfolio"
          >
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Portfolio</span>
          </a>
          
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition duration-150 ease-in-out flex items-center space-x-1"
            title="View LinkedIn Profile"
          >
            <Linkedin className="w-4 h-4" />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>

          {/* Contact Button */}
          <a
            href={email}
            className="text-sm font-semibold px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition duration-150 ease-in-out whitespace-nowrap"
          >
            Get In Touch
          </a>
        </nav>
      </div>
    </header>
  );
};

// --- Rotating Skill Banner Component (Existing) ---
const SkillBanner = () => {
  const skills = useMemo(() => [
    { name: "React.js", icon: Code, color: "text-sky-500", detail: "Frontend mastery" },
    { name: "Node.js/Express", icon: Server, color: "text-green-500", detail: "Robust Backend" },
    { name: "MongoDB", icon: Database, color: "text-lime-500", detail: "Scalable Data" },
    { name: "Tailwind CSS", icon: Palette, color: "text-teal-500", detail: "Clean UI/UX" },
  ], []);

  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);

  useEffect(() => {
    // Only run the interval if we are in a browser environment
    if (typeof window !== 'undefined') {
      const interval = setInterval(() => {
        setCurrentSkillIndex((prevIndex) => (prevIndex + 1) % skills.length);
      }, 4000); // Change skill every 4 seconds
      return () => clearInterval(interval);
    }
    return () => {}; // Cleanup for component unmount
  }, [skills.length]);

  const CurrentSkill = skills[currentSkillIndex];
  const Icon = CurrentSkill.icon;

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center space-x-4 p-3 bg-white border border-dashed border-indigo-200 rounded-xl shadow-inner text-sm font-medium text-gray-700 transition-all duration-500 ease-in-out">
          <span className="text-gray-500 hidden sm:inline">Showcasing skills:</span>
          <span className={`flex items-center space-x-2 ${CurrentSkill.color} transition-all duration-500 ease-in-out transform`}>
            <Icon className="w-5 h-5" />
            <span className="font-bold">{CurrentSkill.name}</span>
            <span className="text-gray-400 ml-2 hidden md:inline">— {CurrentSkill.detail}</span>
          </span>
        </div>
      </div>
    </div>
  );
};


// --- RootLayout Component (Modified) ---
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-gray-900 min-h-screen antialiased">
        
        {/* Fixed, Translucent Header */}
        <Header />
        
        {/* Main Content Area - Increased Padding Top (pt-20) to clear the fixed header. */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 ">
           {children}
        </main>

        {/* Rotating Skill Banner */}
        <SkillBanner />
        
      </body>
    </html>
  );
}