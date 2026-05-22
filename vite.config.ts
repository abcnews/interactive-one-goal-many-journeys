import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import mkcert from "vite-plugin-mkcert";
import { moduleLoader } from "vite-plugin-module-loader";
import path from "node:path";
import { analyzer } from "vite-bundle-analyzer";

const importMetaUrlPolyfillVariableName = "__import_meta_url__";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), mkcert(), moduleLoader(), analyzer()],
  server: {
    host: "abc-xdtyqmn915.aus.aunty.abc.net.au",
    origin: "https://localhost:5173",
    cors: true,
  },
  build: {
    rolldownOptions: {
      transform: {
        define: {
          "import.meta.url": importMetaUrlPolyfillVariableName,
        },
      },
      output: {
        format: "iife",
        entryFileNames: "[name].js",
        intro:
          "var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;" +
          `var ${importMetaUrlPolyfillVariableName} = (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('main.js', document.baseURI).href)`,
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
