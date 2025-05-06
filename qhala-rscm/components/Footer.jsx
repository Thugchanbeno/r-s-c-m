"use client";
import Image from "next/image";
import Link from "next/link";
import qlogo from "@/assets/qlogo.png";
import { cn } from "@/lib/utils";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "border-t mt-auto p-4",
        "bg-white border-gray-200",
        "dark:bg-gray-900 dark:border-gray-800"
      )}
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="relative h-8 w-8 mr-2">
            <Image
              src={qlogo}
              alt="Qhala Logo"
              fill
              className="object-contain"
            />
          </div>

          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Qhala RSCM
          </span>
        </div>

        <div className="flex flex-wrap justify-center md:justify-start mb-4 md:mb-0">
          <ul className="flex items-center space-x-4">
            {" "}
            <li>
              <Link
                href="/privacy"
                className={cn(
                  "p-2 rounded-md transition-colors duration-200 text-sm",
                  "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  "dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900 dark:focus:ring-gray-600"
                )}
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className={cn(
                  "p-2 rounded-md transition-colors duration-200 text-sm",
                  "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                  "dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-800",
                  "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-900 dark:focus:ring-gray-600"
                )}
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-center md:text-right">
          <p className={cn("text-sm text-gray-600", "dark:text-gray-400")}>
            &copy; {currentYear} Qhala. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
