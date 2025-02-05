/**
 * This example demonstrates how to load and save a wireguard configuration file
 * from disk. You can run this example with:
 *
 *      tsx examples/load-save-config-file.ts
 */

import * as Platform from "@effect/platform";
import * as PlatformNode from "@effect/platform-node";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as ParseResult from "effect/ParseResult";

import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";

const program: Effect.Effect<
    void,
    ParseResult.ParseError | Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
> = Effect.gen(function* () {
    const path = yield* Platform.Path.Path;
    const fileSystem = yield* Platform.FileSystem.FileSystem;

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

Effect.suspend(() => program)
    .pipe(Effect.provide(PlatformNode.NodeContext.layer))
    .pipe(PlatformNode.NodeRuntime.runMain);
