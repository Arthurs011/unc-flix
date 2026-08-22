import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import tailwindAnimate from "tailwindcss-animate";

const appBase = plugin(({ addBase, addUtilities }) => {
  addBase({
    ":root": {
      "--background": "240 14% 3%",
      "--foreground": "0 0% 98%",
      "--card": "240 9% 6%",
      "--card-foreground": "0 0% 98%",
      "--popover": "240 9% 6%",
      "--popover-foreground": "0 0% 98%",
      "--primary": "211 100% 50%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "240 6% 12%",
      "--secondary-foreground": "0 0% 98%",
      "--muted": "240 5% 16%",
      "--muted-foreground": "240 4% 60%",
      "--accent": "240 6% 14%",
      "--accent-foreground": "0 0% 98%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 98%",
      "--border": "240 6% 14%",
      "--input": "240 6% 14%",
      "--ring": "211 100% 50%",
      "--radius": "1rem",
    },
    "*, ::before, ::after": {
      borderColor: "hsl(var(--border))",
    },
    body: {
      backgroundColor: "hsl(var(--background))",
      color: "hsl(var(--foreground))",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale",
      "-webkit-tap-highlight-color": "transparent",
      overscrollBehaviorY: "none",
    },
    "::selection": {
      backgroundColor: "hsl(211 100% 50% / 0.35)",
      color: "#fff",
    },
    "::-webkit-scrollbar": {
      width: "10px",
      height: "10px",
    },
    "::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "::-webkit-scrollbar-thumb": {
      background: "hsl(var(--muted))",
      borderRadius: "8px",
      border: "2px solid hsl(var(--background))",
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: "hsl(var(--muted-foreground) / 0.5)",
    },
    img: {
      "-webkit-user-drag": "none",
      userSelect: "none",
    },
    // UNCFLIX sinkhole: hides common injected ad elements
    '[id*="ad-"], [class*="ad-"], [class*="ads-"], [id*="google_ads"], [class*="google_ads"], [id*="popads"], [id*="propeller"], .ad-container, .ads-wrapper, .ad-slot, .ad-unit, .banner-ads, .fixed-ads, .bottom-ads, iframe[src*="doubleclick.net"], iframe[src*="adservice.google"], iframe[src*="googlesyndication"], iframe[src*="popads.net"], iframe[src*="propellerads"], .trc_rbox_container, .outbrain, .taboola-container':
      {
        display: "none !important",
        visibility: "hidden !important",
        pointerEvents: "none !important",
        height: "0 !important",
        width: "0 !important",
        overflow: "hidden !important",
      },
  });

  addUtilities({
    ".glass": {
      backgroundColor: "hsl(var(--background) / 0.6)",
      "backdrop-filter": "blur(24px)",
      "-webkit-backdrop-filter": "blur(24px)",
      borderWidth: "1px",
      borderColor: "hsl(var(--border) / 0.5)",
    },
    ".glass-strong": {
      backgroundColor: "hsl(var(--background) / 0.8)",
      "backdrop-filter": "blur(40px)",
      "-webkit-backdrop-filter": "blur(40px)",
      borderWidth: "1px",
      borderColor: "hsl(var(--border) / 0.3)",
    },
    ".scrollbar-hide": {
      "-ms-overflow-style": "none",
      "scrollbar-width": "none",
    },
    ".scrollbar-hide::-webkit-scrollbar": {
      display: "none",
    },
    ".pb-safe": {
      "padding-bottom": "env(safe-area-inset-bottom, 0px)",
    },
  });
});

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      spacing: {
        "13": "3.25rem",
        "15": "3.75rem",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
      },
      boxShadow: {
        glow: "0 0 24px -4px hsl(211 100% 50% / 0.45)",
        "glow-sm": "0 0 14px -2px hsl(211 100% 50% / 0.4)",
        "glow-lg": "0 8px 56px -8px hsl(211 100% 50% / 0.5)",
        card: "0 24px 48px -16px rgb(0 0 0 / 0.65)",
        "card-lg": "0 32px 80px -20px rgb(0 0 0 / 0.8)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s infinite linear",
      },
    },
  },
  plugins: [appBase, tailwindAnimate],
} satisfies Config;
