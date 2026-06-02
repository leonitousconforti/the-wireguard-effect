/**
 * Wireguard config schema definitions
 *
 * @since 1.0.0
 */

import type * as PlatformError from "effect/PlatformError";

import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Schema from "effect/Schema";

import * as circular from "./internal/circular.ts";

export {
    /**
     * A wireguard configuration.
     *
     * @since 1.0.0
     * @category Schemas
     */
    WireguardConfig,
} from "./internal/circular.ts";

export {
    /**
     * A wireguard configuration encoded in the INI format.
     *
     * @since 1.0.0
     * @category Schema Transformations
     * @see {@link WireguardConfig}
     */
    WireguardIniConfig,
} from "./internal/circular.ts";

/**
 * Loads a wireguard interface configuration from an INI file.
 *
 * @since 1.0.0
 * @category Constructors
 * @param file - The path to the INI file.
 */
export const fromConfigFile: {
    (
        file: string
    ): Effect.Effect<circular.WireguardConfig, Schema.SchemaError | PlatformError.PlatformError, FileSystem.FileSystem>;
} = (file: string) =>
    Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const fsConfig = yield* fs.readFileString(file);
        const iniConfigEncoded = yield* Schema.encodeEffect(circular.WireguardIniConfig)(fsConfig);
        const config = yield* Schema.decodeEffect(circular.WireguardConfig)(iniConfigEncoded);
        return config;
    });
