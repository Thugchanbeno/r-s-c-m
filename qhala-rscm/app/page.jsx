"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import qlogo from "@/assets/qlogo.png";
import Button from "@/components/common/Button";
import { ArrowRight, Zap, Cpu, BarChartBig } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  pageVariants,
  itemVariants,
  listContainerVariants,
  fadeIn,
} from "@/lib/animations";

const HomePage = () => {
  const [hoveredLetter, setHoveredLetter] = useState(null);

  const handleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  const qrscmFullName = "Resource & Skill Capacity Manager";
  const appDescription =
    "Qhala RSCM offers intelligent resource allocation, dynamic skill mapping, and clear capacity planning to drive optimal efficiency.";

  const letterHoverColor = "hover:text-[rgb(var(--qhala-rich-gold))]";
  const primaryColorRgbString = "var(--primary)";

  const benefits = [
    {
      id: "ai-allocate",
      icon: <Cpu size={28} className="text-primary" />,
      title: "AI-Powered Resource Allocation",
      description:
        "Intelligently match the best talent to tasks, maximizing project outcomes and team satisfaction.",
    },
    {
      id: "capacity",
      icon: <BarChartBig size={28} className="text-primary" />,
      title: "Optimized Capacity Planning",
      description:
        "Gain clear insights into team availability and make data-driven decisions to prevent burnout and boost output.",
    },
  ];

  return (
    <motion.div
      className={cn(
        "relative flex min-h-screen flex-col overflow-hidden p-4 md:p-6",
        "bg-background"
      )}
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80 md:opacity-100">
        <div
          className="absolute top-0 left-0 -translate-y-1/4 -translate-x-1/4 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full filter blur-3xl opacity-20 md:opacity-25"
          style={{ background: `rgba(${primaryColorRgbString}, 0.35)` }}
        ></div>
        <div
          className="absolute top-[-50px] left-[50px] -translate-y-1/4 -translate-x-1/4 w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full filter blur-3xl opacity-15 md:opacity-20 mix-blend-multiply"
          style={{ backgroundColor: "#E94E24" }}
        ></div>
        <div
          className={cn(
            "absolute bottom-0 right-0 translate-y-1/4 translate-x-1/4 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full filter blur-3xl opacity-15 md:opacity-20",
            "bg-amber-400"
          )}
        ></div>
      </div>

      <motion.nav
        className="relative z-20 w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-5 flex items-center justify-between"
        variants={fadeIn}
      >
        <div className="flex items-center space-x-2">
          <Image
            src={qlogo}
            alt="Qhala Logo"
            width={32}
            height={32}
            className="h-8 w-8"
            priority
            sizes="32px"
          />
          <span className="text-xl font-semibold text-foreground">Qhala</span>
        </div>
      </motion.nav>

      <main className="relative z-10 flex flex-grow flex-col items-center justify-center text-center px-4 py-8 md:py-12">
        <motion.div className="max-w-3xl" variants={fadeIn}>
          <motion.div className="mb-4" variants={itemVariants}>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                "bg-primary-accent-background text-primary"
              )}
            >
              <Zap size={14} className="mr-1.5" />
              Intelligent Team Management
            </span>
          </motion.div>
          <motion.h1
            className="text-4xl font-extrabold tracking-tight sm:text-5xl cursor-default text-foreground"
            aria-label={qrscmFullName}
            variants={itemVariants}
          >
            {qrscmFullName.split(" ").map((word, wordIndex) => (
              <span key={wordIndex} className="whitespace-nowrap mr-1.5">
                {word.split("").map((letter, letterIndex) => (
                  <span
                    key={letterIndex}
                    aria-hidden="true"
                    className={cn(
                      "transition-all duration-300 ease-out inline-block",
                      letterHoverColor,
                      hoveredLetter === `${wordIndex}-${letterIndex}`
                        ? "scale-110 -translate-y-1"
                        : "scale-100 translate-y-0"
                    )}
                    onMouseEnter={() =>
                      setHoveredLetter(`${wordIndex}-${letterIndex}`)
                    }
                    onMouseLeave={() => setHoveredLetter(null)}
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </span>
                ))}
              </span>
            ))}
          </motion.h1>
          <motion.p
            className="mt-5 text-base md:text-lg leading-7 max-w-xl mx-auto text-muted-foreground"
            variants={itemVariants}
          >
            {appDescription}
          </motion.p>
        </motion.div>

        <motion.div
          className="mt-10 md:mt-12 grid md:grid-cols-2 gap-5 md:gap-6 max-w-5xl w-full"
          variants={listContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {benefits.map((benefit) => (
            <motion.div
              key={benefit.id}
              className={cn(
                "p-6 rounded-lg shadow-lg transform",
                "bg-card border border-border/60",
                "transition-all duration-300 ease-in-out",
                "hover:-translate-y-1.5 hover:shadow-xl"
              )}
              variants={itemVariants}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-md flex items-center justify-center mb-4",
                  "bg-primary-accent-background"
                )}
              >
                {benefit.icon}
              </div>
              <h3 className="text-lg lg:text-xl font-semibold mb-2 text-foreground">
                {benefit.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="mt-10 md:mt-12" variants={fadeIn}>
          <Button
            onClick={handleSignIn}
            variant="primary"
            size="lg"
            className={cn(
              "px-8 py-3 text-base font-semibold",
              "rounded-full",
              "shadow-lg hover:shadow-xl",
              "transition-all duration-300 ease-in-out",
              "transform hover:scale-[1.03] active:scale-100 group",
              "hover:ring-2 hover:ring-offset-2 hover:ring-[rgb(var(--accent))] hover:ring-offset-background",
              "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-background"
            )}
          >
            Sign in
            <ArrowRight
              size={20}
              className="ml-2 transition-transform duration-300 ease-in-out group-hover:translate-x-1"
            />
          </Button>
        </motion.div>
      </main>

      <motion.footer
        className="relative z-10 mt-auto py-8 text-center"
        variants={fadeIn}
      >
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Qhala. All rights reserved.
        </p>
      </motion.footer>
    </motion.div>
  );
};

export default HomePage;
