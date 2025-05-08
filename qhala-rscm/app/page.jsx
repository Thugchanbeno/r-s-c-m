"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import qlogo from "@/assets/qlogo.png"; // Assuming this path is correct
import Button from "@/components/common/Button"; // Your themed Button
import {
  ArrowRight,
  Users,
  Zap,
  Cpu, // Icon for AI/Smart
  BarChartBig, // Icon for Capacity/Optimization
} from "lucide-react";

const HomePage = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredBenefit, setHoveredBenefit] = useState(null);

  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const qrscmFullName = "Qhala Resource & Skill Capacity Manager";
  const appDescription =
    "Unlock your team's full potential. Qhala RSCM offers intelligent resource allocation, dynamic skill mapping, and clear capacity planning to drive project success.";

  // Theme-derived colors
  const primaryColorRgb = "var(--primary)";
  const primaryAccentBgRgb = "var(--primary-accent-background)";
  const foregroundColorRgb = "var(--foreground)";
  const mutedForegroundColorRgb = "var(--muted-foreground)";
  const backgroundColorRgb = "var(--background)";
  const cardColorRgb = "var(--card)";
  const borderColorRgb = "var(--border)";

  // Landing page specific accents
  const accentColorOrange = "text-orange-500";
  const accentColorAmber = "text-amber-500"; // For one of the blobs

  const benefits = [
    {
      id: "ai-allocate",
      icon: <Cpu size={28} style={{ color: `rgb(${primaryColorRgb})` }} />, // Slightly smaller icon
      title: "AI-Powered Resource Allocation",
      description:
        "Intelligently match the best talent to tasks, maximizing project outcomes and team satisfaction.",
    },
    {
      id: "capacity",
      // Slightly smaller icon
      icon: (
        <BarChartBig size={28} style={{ color: `rgb(${primaryColorRgb})` }} />
      ),
      title: "Optimized Capacity Planning",
      description:
        "Gain clear insights into team availability and make data-driven decisions to prevent burnout and boost output.",
    },
  ];

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-hidden p-4 md:p-6"
      style={{ background: `rgb(${backgroundColorRgb})` }}
    >
      {/* Background Blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80 md:opacity-100">
        {/* Blob 1: Top-Left - Primary */}
        <div
          className="absolute top-0 left-0 -translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full filter blur-3xl opacity-20 md:opacity-25"
          style={{ background: `rgba(${primaryColorRgb}, 0.35)` }} // Slightly adjusted opacity/color
        ></div>

        {/* Blob 2: Top-Left - Added Second Blob (Red) */}
        <div
          className="absolute top-[-50px] left-[50px] -translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full filter blur-3xl opacity-15 md:opacity-20 mix-blend-multiply" // Removed bg-purple-400
          style={{ backgroundColor: "#E94E24" }} // Added inline style for the specific red
        ></div>

        {/* Blob 3: Bottom-Right - Amber */}
        <div
          className={`absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] md:w-[700px] md:h-[700px] bg-amber-400 rounded-full filter blur-3xl opacity-15 md:opacity-20`}
        ></div>
      </div>

      {/* Navbar - Reduced left padding slightly */}
      <nav className="relative z-20 w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {" "}
          {/* Reduced space */}
          <Image
            src={qlogo}
            alt="Qhala Logo"
            width={32} // Kept logo size reasonable
            height={32}
            className="h-8 w-8"
            priority
            sizes="32px"
          />
          <span
            className="text-xl font-semibold" // Reduced font size slightly
            style={{ color: `rgb(${foregroundColorRgb})` }}
          >
            Qhala
          </span>
        </div>
        {/* Sign In button removed */}
      </nav>

      {/* Main Content - Hero Section */}
      <main className="relative z-10 flex flex-grow flex-col items-center justify-center text-center px-4 py-8 md:py-12">
        {" "}
        {/* Reduced py */}
        <div className="max-w-3xl">
          <div className="mb-4">
            {" "}
            {/* Reduced mb */}
            <span
              className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
              style={{
                background: `rgb(${primaryAccentBgRgb})`,
                color: `rgb(${primaryColorRgb})`,
              }}
            >
              <Zap size={14} className="mr-1.5" />
              Intelligent Team Management
            </span>
          </div>
          <h1
            className="text-4xl font-extrabold tracking-tight sm:text-5xl cursor-default"
            style={{ color: `rgb(${foregroundColorRgb})` }}
            aria-label={qrscmFullName}
          >
            {qrscmFullName.split("").map((letter, index) => (
              <span
                key={index}
                aria-hidden="true"
                className={`transition-transform duration-300 ease-out inline-block hover:${accentColorOrange}`}
                style={{
                  transform:
                    hoveredIndex === index
                      ? "translateY(-6px) scale(1.03)"
                      : "translateY(0) scale(1)",
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </h1>
          <p
            className="mt-5 text-base md:text-lg leading-7 max-w-xl mx-auto"
            style={{ color: `rgb(${mutedForegroundColorRgb})` }}
          >
            {appDescription}
          </p>
        </div>
        {/* Benefit Cards Section - Reduced gap, adjusted padding */}
        <div className="mt-10 md:mt-12 grid md:grid-cols-2 gap-5 md:gap-6 max-w-5xl w-full">
          {" "}
          {/* Reduced gap, increased max-w */}
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="p-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 hover:shadow-xl"
              style={{
                background: `rgb(${cardColorRgb})`,
                border: `1px solid rgb(${borderColorRgb})`,
              }}
              onMouseEnter={() => setHoveredBenefit(benefit.id)}
              onMouseLeave={() => setHoveredBenefit(null)}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `rgb(${primaryAccentBgRgb})` }}
              >
                {benefit.icon}
              </div>
              <h3
                className="text-lg lg:text-xl font-semibold mb-2"
                style={{ color: `rgb(${foregroundColorRgb})` }}
              >
                {benefit.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: `rgb(${mutedForegroundColorRgb})` }}
              >
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
        {/* Call to Action - Below the cards */}
        <div className="mt-10 md:mt-12">
          <Button
            onClick={handleSignIn}
            variant="primary"
            size="lg"
            className="px-10 py-3 text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95 group"
          >
            Get Started
            <ArrowRight
              size={20}
              className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Button>
        </div>
      </main>

      {/* Simplified Footer */}
      <footer className="relative z-10 mt-auto py-8 text-center">
        <p
          className="text-sm"
          style={{ color: `rgb(${mutedForegroundColorRgb})` }}
        >
          &copy; {new Date().getFullYear()} Qhala. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
