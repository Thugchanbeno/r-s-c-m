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
      colors: {
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
          "accent-background":
            "rgb(var(--primary-accent-background) / <alpha-value>)",
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
          DEFAULT: "rgb(var(--success) / <alpha-value>)",
          foreground: "rgb(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
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
        // Adding your specific Qhala brand colors for direct use
        "qhala-deep-red": "rgb(var(--qhala-deep-red) / <alpha-value>)",
        "qhala-rich-gold": "rgb(var(--qhala-rich-gold) / <alpha-value>)",
        "qhala-dark-navy": "rgb(var(--qhala-dark-navy) / <alpha-value>)",
        "qhala-charcoal-grey":
          "rgb(var(--qhala-charcoal-grey) / <alpha-value>)",
        "qhala-sky-blue": "rgb(var(--qhala-sky-blue) / <alpha-value>)",
        "qhala-soft-peach": "rgb(var(--qhala-soft-peach) / <alpha-value>)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('tailwindcss-animate'),
  ],
};
