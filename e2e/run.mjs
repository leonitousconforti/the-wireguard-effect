#!/usr/bin/env node

import * as exec from "node:child_process";
import * as url from "node:url";

const e2eTests = [
    "./generate-server-to-server-access/",
    "./generate-remote-access-to-server/",
    "./generate-remote-access-to-lan/",
    "./generate-server-hub-and-spoke-access/",
    "./generate-lan-hub-and-spoke-access/",

    // FIXME: fix this e2e test
    // "./generate-lan-to-lan-access/",
];

const cleanDockerE2E = (folder) => {
    const cwd = url.fileURLToPath(new url.URL(folder, import.meta.url));
    exec.execSync("docker compose down", { cwd, stdio: "inherit" });
};

const runDockerE2E = (folder) => {
    const cwd = url.fileURLToPath(new url.URL(folder, import.meta.url));
    try {
        exec.execSync("tsx generate-configs.ts", { cwd, stdio: "inherit" });
        exec.execSync("docker compose build", { cwd, stdio: "inherit" });
        exec.execSync("docker compose up --abort-on-container-failure", { cwd, stdio: "inherit" });
    } finally {
        exec.execSync("docker compose down", { cwd, stdio: "inherit" });
    }
};

for (const test of e2eTests) {
    cleanDockerE2E(test);
}

for (const test of e2eTests) {
    runDockerE2E(test);
}
