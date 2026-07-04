import type { Config } from "tailwindcss";

/**
 * Design tokens sourced from docs/04_UI_DESIGN_SYSTEM.md.
 * Colors are wired to CSS variables declared in src/app/globals.css so
 * light/dark theming can be introduced later without touching components.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "var(--color-primary-100)",
          500: "var(--color-primary-500)",
          600: "var(--color-primary-600)",
          700: "var(--color-primary-700)",
        },
        accent: {
          100: "var(--color-accent-100)",
          600: "var(--color-accent-600)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        info: "var(--color-info)",
        neutral: "var(--color-neutral)",
        bg: "var(--color-bg)",
        surface: "var(--color-surface)",
        border: "var(--color-border)",
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          disabled: "var(--color-text-disabled)",
        },
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
      boxShadow: {
        1: "0 1px 2px rgba(16,24,40,0.06), 0 1px 3px rgba(16,24,40,0.08)",
        2: "0 4px 8px rgba(16,24,40,0.08)",
        3: "0 12px 24px rgba(16,24,40,0.12)",
      },
      fontSize: {
        h1: ["24px", "32px"],
        h2: ["20px", "28px"],
        h3: ["16px", "24px"],
        body: ["14px", "22px"],
        "body-sm": ["13px", "20px"],
        caption: ["12px", "16px"],
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
