import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"], // ← add this
  },
  optimizeDeps: {
    include: ["recharts"], // ← add this
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react")) return "vendor-react";
          if (id.includes("node_modules/react-select")) return "vendor-react-select";
          if (id.includes("node_modules/yup")) return "vendor-yup";
          if (id.includes("node_modules/country-state-city")) return "vendor-csc";
        },
      },
    },
    chunkSizeWarningLimit: 1300,
    outDir: "dist",
    cssMinify: true,
    minify: true,
  },
});