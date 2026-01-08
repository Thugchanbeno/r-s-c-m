"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import rscmLogo from "@/assets/RSCM-full.png";
import { Button } from "@/components/ui/button";
import { Network, BarChart3 } from "lucide-react";

const HomePage = () => {
  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div
      className="min-h-screen bg-white relative flex flex-col"
      style={{
        backgroundImage: `radial-gradient(circle, rgb(var(--rscm-violet) / 0.08) 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }}
    >
      <nav className="relative z-10 w-full py-2 mb-0 max-w-[1600px] mx-auto px-6 lg:px-16 xl:px-24">
        <div className="flex items-center justify-between gap-8">
          <Image
            src={rscmLogo}
            alt="RSCM"
            width={350}
            height={105}
            className="h-36 w-auto"
            priority
          />
          <Button
            onClick={handleSignIn}
            size="lg"
            className="font-bold  text-white flex-shrink-0 bg-rscm-plum"
          >
            Get Started
          </Button>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex items-center -mt-8">
        <div className="w-full px-6 lg:px-16 xl:px-24">
          <div className="grid lg:grid-cols-2 gap-8 xl:gap-12 items-center max-w-[1600px] mx-auto">
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-tight mb-2">
                  <span className="text-rscm-violet">Resource & Skill</span>
                  <br />
                  <span className="text-rscm-violet">Capacity </span>
                  <span className="text-rscm-dark-purple">Management</span>
                </h1>
              </div>

              <p className="text-lg text-black leading-relaxed">
                Intelligent resource allocation, dynamic skill mapping, and
                clear capacity planning to drive optimal efficiency for modern
                teams.
              </p>

              <div className="grid md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <div className="flex gap-3 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-rscm-violet">
                        <Network className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-1">
                        AI-Powered Resource Allocation
                      </h3>
                      <p className="text-sm text-black/70 leading-relaxed">
                        Intelligently match the best talent to tasks, maximizing
                        project outcomes and team satisfaction.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex gap-3 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-rscm-violet">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-base mb-1">
                        Optimized Capacity Planning
                      </h3>
                      <p className="text-sm text-black/70 leading-relaxed">
                        Gain clear insights into team availability and make
                        data-driven decisions to prevent burnout and boost
                        output.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0 h-[520px] w-full max-w-[550px] ml-auto">
              <div className="flex flex-col justify-between items-center">
                <div
                  className="w-full aspect-square bg-rscm-dutch-white"
                  style={{
                    borderRadius: "3.5rem 0 0 3.5rem",
                  }}
                ></div>
                <div className="w-full aspect-square border-[10px] bg-white border-rscm-violet"></div>
                <div
                  className="w-full aspect-square bg-rscm-black"
                  style={{
                    borderRadius: "3.5rem 3.5rem 0 3.5rem",
                  }}
                ></div>
              </div>

              <div className="flex flex-col justify-between items-center">
                <div className="w-full aspect-square flex items-center justify-center">
                  <div className="w-[70%] h-[70%] rotate-45 bg-rscm-lilac"></div>
                </div>
                <div className="w-full aspect-square rounded-full bg-rscm-violet"></div>
                <div className="w-full aspect-square flex items-center justify-center">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <polygon
                      points="50,5 95,95 5,95"
                      fill="white"
                      stroke="#4A2545"
                      strokeWidth="6"
                    />
                  </svg>
                </div>
              </div>

              <div className="flex flex-col justify-between items-center">
                <div className="w-full aspect-square overflow-hidden">
                  <div
                    className="w-full h-full bg-rscm-violet"
                    style={{
                      borderRadius: "0 85% 0 0",
                    }}
                  ></div>
                </div>
                <div className="w-full aspect-square overflow-hidden">
                  <div
                    className="w-full h-full bg-rscm-violet"
                    style={{
                      borderRadius: "0 0 85% 0",
                    }}
                  ></div>
                </div>
                <div className="w-full aspect-square overflow-hidden">
                  <div
                    className="w-full h-full bg-rscm-black"
                    style={{
                      borderRadius: "0 85% 0 0",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-8 text-center">
        <p className="text-sm text-black/60">
          © {new Date().getFullYear()} RSCM. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
