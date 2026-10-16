import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";

// IMPORTANT: change "base" to match your GitHub repo name, e.g.
//   https://github.com/tuusuario/finanzas-mx  ->  base: "/finanzas-mx/"
// If you deploy to a "tuusuario.github.io" repo (user/organization site), use base: "/"
export default defineConfig({
  base: "/finzalu/",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png", "icons/mark-192.png", "icons/mark-512.png", "icons/apple-touch-icon.png", "favicon.svg"],
      manifest: {
        name: "Finzalu",
        short_name: "Finzalu",
        description: "Finzalu: reparte tu dinero con reglas, controla tus gastos y cumple tus metas de ahorro.",
        theme_color: "#15111f",
        background_color: "#15111f",
        display: "standalone",
        orientation: "portrait",
        start_url: "/finzalu/",
        scope: "/finzalu/",
        icons: [
          // "any": just the mark, no square — Android shows it on its launch screen
          { src: "icons/mark-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icons/mark-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          // "maskable": full-bleed tile the launcher crops to its own shape
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Cache everything needed to run 100% offline after the first visit
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
        // Always serve index.html from the cache for any app navigation when
        // the network is unavailable — this is what fixes the ERR_FAILED page.
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/finzalu\/icons\//],
        // Take control immediately on install/update instead of waiting for
        // every tab to close, and remove old cached versions automatically.
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-stylesheets" },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
});
