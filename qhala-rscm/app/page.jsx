// app/page.jsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import qlogo from "@/assets/qlogo.png";
import Pattern from "@/components/common/Pattern";

const HomePage = () => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const textContent = "QRSCM ";

  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center rounded-xl overflow-hidden bg-slate-200 p-4">
      {" "}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-[600px] h-[600px] md:w-[800px] md:h-[800px] lg:w-[1000px] lg:h-[1000px]">
            <div className="absolute top-0 left-10m w-120 h-120 md:w-[450px] md:h-[450px] bg-amber-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
            <div className="absolute top-40 right-0 w-120 h-120 md:w-[450px] md:h-[450px] bg-orange-600 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-20 w-120 h-120 md:w-[450px] md:h-[450px] bg-blue-950 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>
          </div>
        </div>
      </div>
      <div className="relative z-10 text-center">
        <h1
          className="flex flex-wrap justify-center items-center text-6xl font-bold text-blue-950 mb-12 cursor-default"
          aria-label={textContent}
        >
          <Image
            src={qlogo}
            alt=""
            aria-hidden="true"
            width={64}
            height={64}
            className="h-20 w-20 mr-2 mb-2 md:mb-0"
            priority
          />
          <div className="flex">
            {" "}
            {textContent.split("").map((letter, index) => (
              <span
                key={index}
                aria-hidden="true"
                className="transition-transform duration-600 ease-out inline-block"
                style={{
                  transform:
                    hoveredIndex === index
                      ? "translateY(-10px) scale(1.1)"
                      : "translateY(0) scale(1)",
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {letter === " " ? "\u00A0" : letter}
              </span>
            ))}
          </div>
        </h1>
        <button
          onClick={handleSignIn}
          className="px-8 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl focus:outline-2 focus:outline-orange-600 transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          Sign In
        </button>
      </div>
      {/* <div
        className={`fixed bottom-28 left-0 right-0 z-10 h-12 `}
        aria-hidden="true"
      >
        <Pattern className="h-full" />
      </div> */}
      <style jsx global>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(50px, -60px) scale(1.15); /* More movement */
          }
          66% {
            transform: translate(-40px, 40px) scale(0.85); /* More movement */
          }
        }
        .animate-blob {
          animation: blob 12s infinite ease-in-out; /* Slower animation */
        }
        .animation-delay-2000 {
          animation-delay: 3s; /* Stagger more */
        }
        .animation-delay-4000 {
          animation-delay: 6s; /* Stagger more */
        }
      `}</style>
    </div>
  );
};

export default HomePage;
