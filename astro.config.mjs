import { defineConfig } from "astro/config";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://maheshodedara.netlify.app",
  integrations: [icon(), mdx(), sitemap()],
});
