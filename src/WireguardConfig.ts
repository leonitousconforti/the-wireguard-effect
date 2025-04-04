/**
 * Wireguard config schema definitions
 *
 * @since 1.0.0
 */

import type * as PlatformError from "@effect/platform/Error";
import type * as ParseResult from "effect/ParseResult";

import * as FileSystem from "@effect/platform/FileSystem";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";
import * as circular from "./internal/circular.js";

export {
    /**
     * A wireguard configuration.
     *
     * @since 1.0.0
     * @category Schemas
     */
    WireguardConfig,
} from "./internal/circular.js";

export {
    /**
     * A wireguard configuration encoded in the INI format.
     *
     * @since 1.0.0
     * @category Schema Transformations
     * @see {@link WireguardConfig}
     */
    WireguardIniConfig,
} from "./internal/circular.js";

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
    ): Effect.Effect<
        circular.WireguardConfig,
        ParseResult.ParseError | PlatformError.PlatformError,
        FileSystem.FileSystem
    >;
} = (file: string) =>
    Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        const fsConfig = yield* fs.readFileString(file);
        const iniConfigEncoded = yield* Schema.encode(circular.WireguardIniConfig)(fsConfig);
        const config = yield* Schema.decode(circular.WireguardConfig)(iniConfigEncoded);
        return config;
    });
