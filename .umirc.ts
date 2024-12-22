import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "home"},
    { path: "/annotate", component: "annotate"},
    { path: "/all", component: "all"},
  ],
  npmClient: 'pnpm',
  esbuildMinifyIIFE: true,
});
