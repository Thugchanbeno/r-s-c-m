"use client";
import Image from "next/image";
import Link from "next/link";
import qlogo from "@/assets/qlogo.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerBg = "bg-slate-900";
  const footerBorder = "border-slate-700";
  const footerTextPrimary = "text-slate-100";
  const footerTextSecondary = "text-slate-400";
  const footerHoverBg = "hover:bg-slate-800";
  const footerFocusRing = "focus:ring-slate-500";
  const footerLinkHoverText = "hover:text-slate-100";

  return (
    <footer className={` mt-auto p-4 ${footerBg}`}>
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="relative h-8 w-8 mr-2">
            <Image
              src={qlogo}
              alt="Qhala Logo"
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
          <span className={`text-xl font-bold ${footerTextPrimary}`}>
            Qhala
          </span>
        </div>

        <div className="flex flex-wrap justify-center md:justify-start mb-4 md:mb-0">
          <ul className="flex items-center space-x-4">
            <li>
              <Link
                href="/privacy"
                className={`p-2 rounded-[var(--radius)] transition-colors duration-200 text-sm ${footerTextSecondary} ${footerHoverBg} ${footerLinkHoverText} focus:outline-none focus:ring-2 focus:ring-offset-2 ${footerFocusRing} ring-offset-slate-900`}
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className={`p-2 rounded-[var(--radius)] transition-colors duration-200 text-sm ${footerTextSecondary} ${footerHoverBg} ${footerLinkHoverText} focus:outline-none focus:ring-2 focus:ring-offset-2 ${footerFocusRing} ring-offset-slate-900`}
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        <div className="text-center md:text-right">
          <p className={`text-sm ${footerTextSecondary}`}>
            &copy; {currentYear} Qhala. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
