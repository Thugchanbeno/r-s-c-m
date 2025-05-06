/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",

  content: [
    "./src/**/*.{html,js,svelte,ts,jsx,tsx}",
    "./components/**/*.{html,js,svelte,ts,jsx,tsx}",
    "./pages/**/*.{html,js,svelte,ts,jsx,tsx}",
    "./app/**/*.{html,js,svelte,ts,jsx,tsx}",
    "./index.html",
    "./*.html",
  ],

  theme: {
    extend: {
      // Define custom colors using CSS variables for theming
      // Ensure these variables are defined in your global CSS (e.g., globals.css or app.css)
      // Example definition in CSS:
      // :root { --background: 255 255 255; --foreground: 0 0 0; /* ... other light vars */ }
      // .dark { --background: 0 0 0; --foreground: 255 255 255; /* ... other dark vars */ }
      colors: {
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        success: {
          // Added success theme colors
          DEFAULT: "rgb(var(--success) / <alpha-value>)",
          foreground: "rgb(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          // Added warning theme colors
          DEFAULT: "rgb(var(--warning) / <alpha-value>)",
          foreground: "rgb(var(--warning-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
        // Keep 'code' if you specifically use font-code class, otherwise mono is standard
        // code: ["var(--font-code)", "monospace"],
      },
      // Add other theme extensions like keyframes, animations, etc. here
      // keyframes: {
      //   "accordion-down": { /* ... */ },
      //   "accordion-up": { /* ... */ },
      // },
      // animation: {
      //   "accordion-down": "accordion-down 0.2s ease-out",
      //   "accordion-up": "accordion-up 0.2s ease-out",
      // },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'), // Example: Adds better default form styles
    // require('@tailwindcss/typography'), // Example: Adds 'prose' class for styling markdown
    // require('tailwindcss-animate'), // Example: For animations often used with shadcn/ui
  ],
};
