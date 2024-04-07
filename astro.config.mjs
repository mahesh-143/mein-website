import { defineConfig } from "astro/config";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: "https://itsmahesh.xyz",
  integrations: [icon(), mdx(), sitemap()],
  // vercel
  output: "server",
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
});
