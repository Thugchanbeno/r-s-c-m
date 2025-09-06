// app/layout.js
import AuthProvider from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/theme-provider";
import ConvexClientProvider from "@/lib/convex";
import { Toaster } from "sonner";
import EtherealBackground from "@/components/common/EtherealBackground";
import "react-toastify/dist/ReactToastify.css";
import "react-datepicker/dist/react-datepicker.css";
import "./globals.css";

export const metadata = {
  title: "Qhala RSCM",
  description: "Resource and Skill Capacity Management",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ConvexClientProvider>
          <ThemeProvider>
            <AuthProvider>
              <EtherealBackground>
                {children}
                <Toaster position="top-right" richColors />
              </EtherealBackground>
            </AuthProvider>
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
