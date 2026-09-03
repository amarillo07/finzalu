import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// IMPORTANT: change "base" to match your GitHub repo name, e.g.
//   https://github.com/tuusuario/finanzas-mx  ->  base: "/finanzas-mx/"
// If you deploy to a "tuusuario.github.io" repo (user/organization site), use base: "/"
export default defineConfig({
  base: "/finzalu/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "finzalu",
        short_name: "finzalu",
        description: "Control de gastos e ingresos personales, reglas financieras y metas de ahorro.",
        theme_color: "#131B29",
        background_color: "#131B29",
        display: "standalone",
        orientation: "portrait",
        start_url: "/finzalu/",
        scope: "/finzalu/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // Cache everything needed to run 100% offline after the first visit
        globPatterns: ["**/*.{js,css,html,png,svg,ico,woff2}"],
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
