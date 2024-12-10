import { defineConfig } from "umi";

export default defineConfig({
  routes: [
    { path: "/", component: "home"},
    { path: "/annotate", component: "annotate"},
  ],
  npmClient: 'yarn',
  esbuildMinifyIIFE: true,
});
