/**
 * Wireguard interface helpers
 *
 * @since 1.0.0
 */

import * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Scope from "effect/Scope";

import * as WireguardConfig from "./WireguardConfig.js";
import * as WireguardErrors from "./WireguardErrors.js";
import * as internal from "./internal/wireguardInterface.js";

/**
 * A wireguard interface name.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export class WireguardInterface extends Schema.Class<WireguardInterface>("WireguardInterface")({
    /** Ensures the interface name matches the platform's interface name regex. */
    Name: Schema.transformOrFail(Schema.String, Schema.String, {
        decode: (s, _options, ast) =>
            Function.pipe(
                internal.InterfaceRegExpForPlatform,
                Effect.mapError((error) => new ParseResult.Type(ast, s, error.message)),
                Effect.flatMap((x) =>
                    x.test(s)
                        ? Effect.succeed(s)
                        : Effect.fail(new ParseResult.Type(ast, s, `Expected interface name to match ${x}`))
                )
            ),
        encode: (s) => Effect.succeed(s),
    }),
}) {
    /**
     * @since 1.0.0
     * @category Constructors
     */
    public static getNextAvailableInterface: Effect.Effect<WireguardInterface, WireguardErrors.WireguardError, never> =
        internal.getNextAvailableInterface;

    /**
     * Starts a wireguard tunnel that will be gracefully shutdown and stop
     * serving traffic once the scope is closed. If no how options is specified,
     * then the interface will be brought up using the
     * bundled-wireguard-go+userspace-api method.
     *
     * @since 1.0.0
     * @category Wireguard
     * @param config - The wireguard configuration to use in INI format.
     * @param options - Options to control how the wireguard configuration is
     *   applied.
     */
    public upScoped: {
        (
            config: WireguardConfig.WireguardConfig,
            options: {
                how: "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api";
                sudo?: boolean | "ask" | undefined;
            }
        ): Effect.Effect<
            void,
            | WireguardErrors.WireguardError
            | ParseResult.ParseError
            | PlatformError.PlatformError
            | Cause.UnknownException,
            FileSystem.FileSystem | Path.Path | Scope.Scope
        >;
        (
            config: WireguardConfig.WireguardConfig,
            options: {
                how?:
                    | "system-wireguard+system-wg-quick"
                    | "system-wireguard+bundled-wg-quick"
                    | "system-wireguard-go+system-wg-quick"
                    | "bundled-wireguard-go+system-wg-quick"
                    | "system-wireguard-go+bundled-wg-quick"
                    | "bundled-wireguard-go+bundled-wg-quick"
                    | undefined;
                sudo?: boolean | "ask" | undefined;
            }
        ): Effect.Effect<
            string,
            | WireguardErrors.WireguardError
            | ParseResult.ParseError
            | PlatformError.PlatformError
            | Cause.UnknownException,
            FileSystem.FileSystem | Path.Path | Scope.Scope
        >;
    } = <
        How extends
            | undefined
            | "bundled-wireguard-go+userspace-api"
            | "system-wireguard-go+userspace-api"
            | "system-wireguard+system-wg-quick"
            | "system-wireguard+bundled-wg-quick"
            | "system-wireguard-go+system-wg-quick"
            | "bundled-wireguard-go+system-wg-quick"
            | "system-wireguard-go+bundled-wg-quick"
            | "bundled-wireguard-go+bundled-wg-quick",
        Ret extends How extends "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api"
            ? Effect.Effect<
                  void,
                  | WireguardErrors.WireguardError
                  | ParseResult.ParseError
                  | PlatformError.PlatformError
                  | Cause.UnknownException,
                  FileSystem.FileSystem | Path.Path | Scope.Scope
              >
            : Effect.Effect<
                  string,
                  | WireguardErrors.WireguardError
                  | ParseResult.ParseError
                  | PlatformError.PlatformError
                  | Cause.UnknownException,
                  FileSystem.FileSystem | Path.Path | Scope.Scope
              >,
    >(
        config: WireguardConfig.WireguardConfig,
        options: {
            how?: How;
            sudo?: boolean | "ask" | undefined;
        }
    ): Ret => {
        const how = options.how;
        if (how === "bundled-wireguard-go+userspace-api" || how === "system-wireguard-go+userspace-api") {
            return internal.upScoped(config, { how, sudo: options.sudo })(this) as Ret;
        } else {
            return internal.upScoped(config, { how, sudo: options.sudo })(this) as Ret;
        }
    };

    /**
     * Starts a wireguard tunnel that will continue to run and serve traffic
     * even after the nodejs process exits. If no how options is specified, then
     * the interface will be brought up using the
     * bundled-wireguard-go+userspace-api method.
     *
     * @since 1.0.0
     * @category Wireguard
     * @param config - The wireguard configuration to use in INI format.
     * @param options - Options to control how the wireguard configuration is
     *   applied.
     */
    public up: {
        (
            config: WireguardConfig.WireguardConfig,
            options: {
                how: "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api";
                sudo?: boolean | "ask" | undefined;
            }
        ): Effect.Effect<
            void,
            | WireguardErrors.WireguardError
            | ParseResult.ParseError
            | PlatformError.PlatformError
            | Cause.UnknownException,
            FileSystem.FileSystem | Path.Path
        >;
        (
            config: WireguardConfig.WireguardConfig,
            options: {
                how?:
                    | "system-wireguard+system-wg-quick"
                    | "system-wireguard+bundled-wg-quick"
                    | "system-wireguard-go+system-wg-quick"
                    | "bundled-wireguard-go+system-wg-quick"
                    | "system-wireguard-go+bundled-wg-quick"
                    | "bundled-wireguard-go+bundled-wg-quick"
                    | undefined;
                sudo?: boolean | "ask" | undefined;
            }
        ): Effect.Effect<
            string,
            | WireguardErrors.WireguardError
            | ParseResult.ParseError
            | PlatformError.PlatformError
            | Cause.UnknownException,
            FileSystem.FileSystem | Path.Path
        >;
    } = <
        How extends
            | undefined
            | "bundled-wireguard-go+userspace-api"
            | "system-wireguard-go+userspace-api"
            | "system-wireguard+system-wg-quick"
            | "system-wireguard+bundled-wg-quick"
            | "system-wireguard-go+system-wg-quick"
            | "bundled-wireguard-go+system-wg-quick"
            | "system-wireguard-go+bundled-wg-quick"
            | "bundled-wireguard-go+bundled-wg-quick",
        Ret extends How extends "bundled-wireguard-go+userspace-api" | "system-wireguard-go+userspace-api"
            ? Effect.Effect<
                  void,
                  | WireguardErrors.WireguardError
                  | ParseResult.ParseError
                  | PlatformError.PlatformError
                  | Cause.UnknownException,
                  FileSystem.FileSystem | Path.Path
              >
            : Effect.Effect<
                  string,
                  | WireguardErrors.WireguardError
                  | ParseResult.ParseError
                  | PlatformError.PlatformError
                  | Cause.UnknownException,
                  FileSystem.FileSystem | Path.Path
              >,
    >(
        config: WireguardConfig.WireguardConfig,
        options: {
            how?: How;
            sudo?: boolean | "ask" | undefined;
        }
    ): Ret => {
        const how = options.how;
        if (how === "bundled-wireguard-go+userspace-api" || how === "system-wireguard-go+userspace-api") {
            return internal.up(config, { how, sudo: options.sudo })(this) as Ret;
        } else {
            return internal.up(config, { how, sudo: options.sudo })(this) as Ret;
        }
    };

    /**
     * Stops a previously started wireguard tunnel.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public down: {
        (options: {
            sudo?: boolean | "ask" | undefined;
            how: "userspace-api";
        }): Effect.Effect<
            void,
            PlatformError.PlatformError | Cause.UnknownException,
            Path.Path | FileSystem.FileSystem
        >;
        (options: {
            sudo?: boolean | "ask" | undefined;
            how: "bundled-wg-quick" | "system-wg-quick";
            file: string;
        }): Effect.Effect<
            void,
            PlatformError.PlatformError | Cause.UnknownException,
            Path.Path | FileSystem.FileSystem
        >;
    } = (
        options:
            | {
                  sudo?: boolean | "ask" | undefined;
                  how: "userspace-api";
              }
            | {
                  sudo?: boolean | "ask" | undefined;
                  how: "bundled-wg-quick" | "system-wg-quick";
                  file: string;
              }
    ) => (options.how === "userspace-api" ? internal.down(this, options) : internal.down(this, options));
}

export default WireguardInterface;
