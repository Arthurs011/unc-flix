import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";
import tailwindAnimate from "tailwindcss-animate";

const appBase = plugin(({ addBase, addUtilities }) => {
  addBase({
    ":root": {
      "--background": "0 0% 4%",
      "--foreground": "0 0% 98%",
      "--card": "0 0% 7%",
      "--card-foreground": "0 0% 98%",
      "--popover": "0 0% 7%",
      "--popover-foreground": "0 0% 98%",
      "--primary": "211 100% 50%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "0 0% 12%",
      "--secondary-foreground": "0 0% 98%",
      "--muted": "0 0% 15%",
      "--muted-foreground": "0 0% 64%",
      "--accent": "0 0% 15%",
      "--accent-foreground": "0 0% 98%",
      "--destructive": "0 84% 60%",
      "--destructive-foreground": "0 0% 98%",
      "--border": "0 0% 18%",
      "--input": "0 0% 18%",
      "--ring": "211 100% 50%",
      "--radius": "0.75rem",
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
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
