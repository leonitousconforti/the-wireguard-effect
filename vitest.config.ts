import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["./test/**/*.test.ts"],
        globals: true,
        coverage: { provider: "v8" },
        reporters: ["default", "hanging-process", ["junit", { outputFile: "coverage/junit.xml" }]],
    },
    server: {
        watch: {
            ignored: [
                "**/node_modules/**",
                "**/.git/**",
                "**/submodules/**",
                "**/patches/**",
                "**/dist/**",
                "**/build/**",
                "**/experiments/**",
                "**/coverage/**",
                "**/ui/**",
            ],
        },
    },
    resolve: {
        alias: {
            "the-wireguard-effect": path.resolve(__dirname, "src"),
        },
    },
});
