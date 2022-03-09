import { defineConfig, UserConfigExport } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const baseConfig: UserConfigExport = {
    server: {
      proxy: {
        // string shorthand
        "/api": "http://localhost:5000/",
      },
    },
    plugins: [
      // wasmPack("@emurgo/cardano-serialization-lib-web"),
      wasm(),
      topLevelAwait(),
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon.svg",
          "favicon.ico",
          "robots.txt",
          "apple-touch-icon.png",
        ],
        manifest: {
          name: "Atomic Swap",
          short_name: "Atomic Swap",
          description: "Description of your app",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          icons: [
            {
              src: "/android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png",
            },
            {
              src: "/android-chrome-512x512.png",
              sizes: "512x512",
              type: "image/png",
            },
          ],
        },
      }),
    ],
  };

  if (mode === "debug") {
    baseConfig.build = {
      sourcemap: true,
      minify: false,
    };
  }

  return baseConfig;
});
