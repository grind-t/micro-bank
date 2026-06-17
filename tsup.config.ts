import { defineConfig } from "tsup";

export default defineConfig({
  name: "@grind-t/lib",
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm", "cjs"],
  experimentalDts: true,
  clean: true,
});
