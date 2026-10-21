import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  optimizeDeps: {
    // Pre-bundle the router and the query client explicitly. When Vite
    // re-optimises mid-session it can hand two copies of react-router-dom to
    // the page, and the second copy's <Link> renders outside the first copy's
    // router context - which crashes the page with "cannot destructure
    // property 'basename'".
    include: ["react", "react-dom", "react-router-dom", "@tanstack/react-query"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          query: ["@tanstack/react-query"],
          anim: ["animejs"],
          motion: ["motion", "framer-motion"],
          ui: ["sonner", "lucide-react"],
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-router-dom",
      "@tanstack/react-query",
      "@tanstack/query-core",
    ],
  },
}));
