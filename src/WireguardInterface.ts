/**
 * @since 1.0.0
 */

import * as Platform from "@effect/platform";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Scope from "effect/Scope";

import * as WireguardIniConfig from "./WireguardConfig.js";
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
     * traffic once the scope is closed.
     *
     * @param config - The wireguard configuration to use in INI format.
     * @param options - Options to control how the wireguard configuration is applied.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public upScoped: {
        (
            config: WireguardIniConfig.WireguardConfig,
            options?: { replacePeers?: boolean | undefined; replaceAllowedIPs?: boolean | undefined } | undefined,
        ): Effect.Effect<
            WireguardInterface,
            WireguardErrors.WireguardError | Cause.TimeoutException,
            Scope.Scope | Platform.FileSystem.FileSystem | Platform.Path.Path
        >;
    } = (config, options) => internal.upScoped(config, options)(this);

    /**
     * Starts a wireguard tunnel that will continue to run and serve traffic
     * even after the nodejs process exits.
     *
     * @param config - The wireguard configuration to use in INI format.
     * @param options - Options to control how the wireguard configuration is applied.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public up: {
        (
            config: WireguardIniConfig.WireguardConfig,
            options?: { replacePeers?: boolean | undefined; replaceAllowedIPs?: boolean | undefined } | undefined,
        ): Effect.Effect<
            WireguardInterface,
            WireguardErrors.WireguardError | Cause.TimeoutException,
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
        (): Effect.Effect<void, Platform.Error.PlatformError, Platform.FileSystem.FileSystem>;
    } = Function.constant(internal.down(this));
}

export default WireguardInterface;
