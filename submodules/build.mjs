#!/usr/bin/env node

import * as execa from "execa";
import * as url from "node:url";
execa.execaCommandSync("./build.bash", { cwd: url.fileURLToPath(new URL(".", import.meta.url)) });
