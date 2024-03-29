import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["actions/connect.ts", "actions/expose.ts"],
    format: "cjs",
    clean: true,
    noExternal: [/^(?!.*@parcel\/watcher).*/],
    external: ["@parcel/watcher"],
    publicDir: "dist/dist/prebuilds",
    outDir: ".github/actions/workflow-level-service/build",
    sourcemap: true,
    treeshake: "safest",
    keepNames: true,
});
