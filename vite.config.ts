import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import mkcert from "vite-plugin-mkcert";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), mkcert()],
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
});
