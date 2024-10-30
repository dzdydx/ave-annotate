import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "home"},
    { path: "/docs", component: "docs"},
  ],
  npmClient: 'yarn',
});
