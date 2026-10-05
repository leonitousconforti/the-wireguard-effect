import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        setupFiles: ["./test/vitest.setup.ts"],
        fakeTimers: {
            toFake: [],
        },
        sequence: {
            concurrent: true,
        },
        include: ["test/**/*.test.ts"],
        reporters: ["default", "hanging-process", ["junit", { outputFile: "./coverage/junit.xml" }]],
        coverage: {
            provider: "v8",
            include: ["src/**/*.ts"],
            reporter: ["cobertura", "text"],
            reportsDirectory: "coverage",
        },
    },
});
