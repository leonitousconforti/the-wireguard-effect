import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["actions/connect.ts", "actions/expose.ts"],
    format: "esm",
    clean: true,
    noExternal: [/(effect|@effect)/],
    external: ["@parcel/watcher"],
    outDir: ".github/actions/workflow-level-service/build",
    sourcemap: true,
    treeshake: "smallest",
});
