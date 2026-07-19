import { resolve } from "node:path";
import { copyFileSync } from "node:fs";

const pages = [
  "index",
  "about",
  "activity",
  "board-members",
  "contact",
  "dashboard",
  "events",
  "login",
  "member-directory",
  "member-register",
  "memberships",
  "mission",
  "president",
  "profile",
  "promotion",
  "sponsors"
];

export default {
  plugins: [
    {
      name: "copy-static-scripts",
      closeBundle() {
        copyFileSync("script.js", "dist/script.js");
        copyFileSync("supabase-config.js", "dist/supabase-config.js");
      }
    }
  ],
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page, resolve(__dirname, `${page}.html`)]))
    }
  }
};
