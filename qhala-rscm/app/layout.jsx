import AuthProvider from "@/components/auth/AuthProvider";
import ConvexClientProvider from "@/lib/convex";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "RSCM",
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
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "rgb(255, 255, 255)",
                  color: "rgb(37, 19, 35)",
                  border: "1px solid rgb(238, 230, 211)",
                },
                className: "rscm-toast",
                success: {
                  style: {
                    background: "rgb(255, 255, 255)",
                    color: "rgb(74, 37, 69)",
                    border: "1px solid rgb(74, 37, 69)",
                  },
                  iconTheme: {
                    primary: "rgb(74, 37, 69)",
                    secondary: "rgb(255, 255, 255)",
                  },
                },
                error: {
                  style: {
                    background: "rgb(255, 255, 255)",
                    color: "rgb(130, 76, 113)",
                    border: "1px solid rgb(130, 76, 113)",
                  },
                  iconTheme: {
                    primary: "rgb(130, 76, 113)",
                    secondary: "rgb(255, 255, 255)",
                  },
                },
                info: {
                  style: {
                    background: "rgb(255, 255, 255)",
                    color: "rgb(74, 37, 69)",
                    border: "1px solid rgb(195, 152, 181)",
                  },
                  iconTheme: {
                    primary: "rgb(195, 152, 181)",
                    secondary: "rgb(255, 255, 255)",
                  },
                },
                warning: {
                  style: {
                    background: "rgb(255, 255, 255)",
                    color: "rgb(130, 76, 113)",
                    border: "1px solid rgb(238, 230, 211)",
                  },
                  iconTheme: {
                    primary: "rgb(130, 76, 113)",
                    secondary: "rgb(255, 255, 255)",
                  },
                },
              }}
            />
          </AuthProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
