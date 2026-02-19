import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./", // <= IMPORTANT: relative paths for Electron
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react")) return "vendor-react";
          if (id.includes("node_modules/react-select"))
            return "vendor-react-select";
          if (id.includes("node_modules/yup")) return "vendor-yup";
          if (id.includes("node_modules/country-state-city"))
            return "vendor-csc";
        },
      },
    },
    chunkSizeWarningLimit: 1300, // optional, to raise warning threshold
    outDir: "dist",
    cssMinify: true,
    minify: true,
  },
});
