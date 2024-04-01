/**
 * @since 1.0.0
 */

import * as Platform from "@effect/platform";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
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
    /**
     * Ensures the interface name matches the platform's interface name regex.
     */
    Name: Schema.transformOrFail(
        Schema.string,
        Schema.string,
        (s, _options, ast) =>
            Function.pipe(
                internal.InterfaceRegExpForPlatform,
                Effect.mapError((error) => new ParseResult.Type(ast, s, error.message)),
                Effect.flatMap((x) =>
                    x.test(s)
                        ? Effect.succeed(s)
                        : Effect.fail(new ParseResult.Type(ast, s, `Expected interface name to match ${x}`)),
                ),
            ),
        (s) => Effect.succeed(s),
    ),
}) {
    /**
     * @since 1.0.0
     * @category Constructors
     */
    public static getNextAvailableInterface: Effect.Effect<WireguardInterface, WireguardErrors.WireguardError, never> =
        internal.getNextAvailableInterface;

    /**
     * Starts a wireguard tunnel that will be gracefully shutdown and stop serving
     * traffic once the scope is closed. If no how options is specified, then the
     * interface will be brought up using the bundled-wireguard-go+userspace-api method.
     *
     * @param config - The wireguard configuration to use in INI format.
     * @param options - Options to control how the wireguard configuration is applied.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public upScoped: {
        (
            config: WireguardConfig.WireguardConfig,
            options: {
                how:
                    | "bundled-wireguard-go+userspace-api"
                    | "system-wireguard-go+userspace-api"
                    | "system-wireguard+system-wg-quick"
                    | "system-wireguard+bundled-wg-quick"
                    | "system-wireguard-go+system-wg-quick"
                    | "bundled-wireguard-go+system-wg-quick"
                    | "system-wireguard-go+bundled-wg-quick"
                    | "bundled-wireguard-go+bundled-wg-quick";
                sudo?: boolean | "ask";
            },
        ): Effect.Effect<
            WireguardInterface,
            WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
            Platform.FileSystem.FileSystem | Platform.Path.Path | Scope.Scope
        >;
    } = (config, options) => internal.upScoped(config, options)(this);

    /**
     * Starts a wireguard tunnel that will continue to run and serve traffic
     * even after the nodejs process exits. If no how options is specified, then the
     * interface will be brought up using the bundled-wireguard-go+userspace-api method.
     *
     * @param config - The wireguard configuration to use in INI format.
     * @param options - Options to control how the wireguard configuration is applied.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public up: {
        (
            config: WireguardConfig.WireguardConfig,
            options: {
                how:
                    | "bundled-wireguard-go+userspace-api"
                    | "system-wireguard-go+userspace-api"
                    | "system-wireguard+system-wg-quick"
                    | "system-wireguard+bundled-wg-quick"
                    | "system-wireguard-go+system-wg-quick"
                    | "bundled-wireguard-go+system-wg-quick"
                    | "system-wireguard-go+bundled-wg-quick"
                    | "bundled-wireguard-go+bundled-wg-quick";
                sudo?: boolean | "ask";
            },
        ): Effect.Effect<
            WireguardInterface,
            WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
            Platform.FileSystem.FileSystem | Platform.Path.Path
        >;
    } = (config, options) => internal.up(config, options)(this);

    /**
     * Stops a previously started wireguard tunnel.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public down: {
        (options: {
            sudo?: boolean | "ask";
            how: "bundled-wg-quick" | "userspace-api" | "system-wg-quick";
        }): Effect.Effect<void, Platform.Error.PlatformError, Platform.FileSystem.FileSystem>;
    } = (options) => internal.down(this, options);
}

export default WireguardInterface;
