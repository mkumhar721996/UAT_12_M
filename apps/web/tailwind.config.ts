import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#ffffff",
        surface: "#f5f7fa",
        fg: "#1a1f29",
        "fg-muted": "#5b6472",
        border: "#d7dce3",
        primary: "#2563eb",
        "primary-fg": "#ffffff",
        warning: "#b45309",
        "warning-bg": "#fef3e2",
        danger: "#b91c1c",
        "danger-bg": "#fdeaea",
      },
      spacing: {
        "space-1": "4px",
        "space-2": "8px",
        "space-3": "12px",
        "space-4": "16px",
        "space-5": "24px",
        "space-6": "32px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
        lg: "12px",
      },
      fontSize: {
        sm: "12px",
        md: "14px",
        lg: "18px",
        xl: "22px",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
