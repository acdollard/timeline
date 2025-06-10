// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    envPrefix: "VITE_",
  },
  output: "server",
  adapter: netlify(),
  site: "https://your-site-name.netlify.app", // Replace with your actual site URL
});
