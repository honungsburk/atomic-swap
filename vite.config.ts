import { defineConfig, UserConfigExport } from "vitest/config";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as path from "node:path";
import * as fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const baseConfig: UserConfigExport = {
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    resolve: {
      alias: {
        src: path.resolve("src/"),
      },
    },
    server: {
      proxy: {
        "/api": "http://127.0.0.1:5001/atomic-swap-124d0/us-central1/main",
      },
    },
    plugins: [
      wasm(),
      topLevelAwait(),
      react({
        fastRefresh: process.env.NODE_ENV !== "test",
      }),
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
