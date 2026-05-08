import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import mkcert from "vite-plugin-mkcert";
import { moduleLoader } from "vite-plugin-module-loader";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), mkcert(), moduleLoader()],
  server: {
    origin: "https://localhost:5173",
    cors: true,
  },
  build: {
    rolldownOptions: {
      output: {
        format: "iife",
        entryFileNames: "[name].js",
      },
    },
  },
  base: "./",
  resolve: {
    alias: {
      "@lib": path.resolve("./src/lib"),
    },
  },
});
