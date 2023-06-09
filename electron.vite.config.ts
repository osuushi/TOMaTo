import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    publicDir: resolve("./resources/"),
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    publicDir: resolve("./src/renderer/public"),
  },
});
