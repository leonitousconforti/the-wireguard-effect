#!/usr/bin/env node

import * as exec from "node:child_process";
import * as url from "node:url";

const runDockerE2E = (folder) => {
    const cwd = url.fileURLToPath(new URL(folder, import.meta.url));
    exec.execSync("tsx generate-configs.ts", { cwd, stdio: "inherit" });
    exec.execSync("docker compose build", { cwd, stdio: "inherit" });
    exec.execSync("docker compose up --abort-on-container-failure", { cwd, stdio: "inherit" });
    exec.execSync("docker compose down", { cwd, stdio: "inherit" });
};

runDockerE2E("./generate-server-to-server-access");
runDockerE2E("./generate-remote-access-to-server");
