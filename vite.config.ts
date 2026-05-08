import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import mkcert from "vite-plugin-mkcert";

const importMetaUrlPolyfillVariableName = "__import_meta_url__";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), mkcert()],
  server: {
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
});
