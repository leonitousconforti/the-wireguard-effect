/**
 * This example demonstrates how to load and save a wireguard configuration file
 * from disk. You can run this example with:
 *
 * ```
 *  tsx examples/load-save-config-file.ts
 * ```
 */

import type * as PlatformError from "effect/PlatformError";
import type * as Schema from "effect/Schema";

import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";

import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as NodeServices from "@effect/platform-node/NodeServices";
import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";

const program: Effect.Effect<
    void,
    Schema.SchemaError | PlatformError.PlatformError | PlatformError.BadArgument,
    FileSystem.FileSystem | Path.Path
> = Effect.gen(function* () {
    const path = yield* Path.Path;
    const fileSystem = yield* FileSystem.FileSystem;

    // Find the config file
    const thisFolder = yield* path.fromFileUrl(new URL(".", import.meta.url));
    const configFile = path.join(thisFolder, "wireguard-config.conf");
    yield* fileSystem.stat(configFile);

    // Load the config file
    const config = yield* WireguardConfig.fromConfigFile(configFile);
    yield* Console.log(config);

    // Save the config file
    yield* config.writeToFile(configFile);
});

Effect.suspend(() => program).pipe(Effect.provide(NodeServices.layer), NodeRuntime.runMain);
