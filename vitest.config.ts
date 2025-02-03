import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        include: ["./test/**/*.test.ts"],
        globals: true,
        coverage: {
            provider: "v8",
        },
        reporters: ["hanging-process", "github-actions", "default"],
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
