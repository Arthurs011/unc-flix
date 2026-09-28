import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1600px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: {
          quiet: "hsl(225 28% 5%)",
          raised: "hsl(224 24% 8%)",
          elevated: "hsl(222 22% 11%)",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["SFMono-Regular", "SF Mono", "Roboto Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 0.25rem)",
        sm: "calc(var(--radius) - 0.5rem)",
      },
      backdropBlur: {
        xs: "2px",
        glass: "18px",
      },
      boxShadow: {
        focus: "0 0 0 3px hsl(var(--ring) / 0.18), 0 0 0 1px hsl(var(--ring) / 0.5)",
        card: "0 18px 50px -28px rgba(0, 0, 0, 0.9)",
        "card-lg": "0 30px 90px -30px rgba(0, 0, 0, 0.95)",
        cinema: "0 36px 100px -36px rgba(0, 0, 0, 0.95)",
        "glow-sm": "0 0 24px -12px hsl(var(--primary) / 0.7)",
        glow: "0 0 40px -16px hsl(var(--primary) / 0.65)",
        "glow-lg": "0 0 64px -20px hsl(var(--primary) / 0.6)",
      },
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "aurora-one": {
          "0%, 100%": { transform: "translate3d(-5%, -3%, 0) scale(1)", opacity: "0.12" },
          "50%": { transform: "translate3d(5%, 3%, 0) scale(1.12)", opacity: "0.19" },
        },
        "aurora-two": {
          "0%, 100%": { transform: "translate3d(4%, 3%, 0) scale(1.08)", opacity: "0.09" },
          "50%": { transform: "translate3d(-6%, -4%, 0) scale(0.96)", opacity: "0.15" },
        },
        "aurora-three": {
          "0%, 100%": { transform: "translate3d(2%, 5%, 0) scale(0.9)", opacity: "0.06" },
          "50%": { transform: "translate3d(-2%, -5%, 0) scale(1.08)", opacity: "0.11" },
        },
        float: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(0, -8px, 0)" },
        },
        shimmer: {
          from: { transform: "translateX(-120%)" },
          to: { transform: "translateX(120%)" },
        },
      },
      animation: {
        shimmer: "shimmer 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
