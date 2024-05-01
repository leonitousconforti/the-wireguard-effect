#!/usr/bin/env node

import * as exec from "node:child_process";
import * as url from "node:url";

exec.execSync("./build.bash", { cwd: url.fileURLToPath(new URL(".", import.meta.url)), stdio: "inherit" });
