/**
 * Wireguard interface helpers
 *
 * @since 1.0.0
 */

import * as Ast from "@effect/schema/AST";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Array from "effect/Array";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Match from "effect/Match";
import * as Number from "effect/Number";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Record from "effect/Record";
import * as Scope from "effect/Scope";
import * as Stream from "effect/Stream";
import * as String from "effect/String";
import * as os from "node:os";

import * as WireguardConfig from "./WireguardConfig.js";
import * as WireguardControl from "./WireguardControl.js";
import * as WireguardErrors from "./WireguardErrors.js";

/** @internal */
export const SupportedArchitectures = ["x64", "arm64"] as const;

/** @internal */
export type SupportedArchitecture = (typeof SupportedArchitectures)[number];

/** @internal */
export const SupportedPlatforms = ["linux", "darwin", "openbsd", "freebsd", "win32"] as const;

/** @internal */
export type SupportedPlatform = (typeof SupportedPlatforms)[number];

/** @internal */
export const LinuxInterfaceNameRegExp: RegExp = /^wg\d+$/;

/** @internal */
export const DarwinInterfaceNameRegExp: RegExp = /^utun\d+$/;

/** @internal */
export const OpenBSDInterfaceNameRegExp: RegExp = /^tun\d+$/;

/** @internal */
export const WindowsInterfaceNameRegExp: RegExp = /^eth\d+$/;

/** @internal */
export const FreeBSDInterfaceNameRegExp: RegExp = /^eth\d+$/;

/**
 * A wireguard interface name.
 *
 * @since 1.0.0
 * @category Datatypes
 */
export class WireguardInterface extends Schema.Class<WireguardInterface>("WireguardInterface")({
    /** Ensures the interface name matches the platform's interface name regex. */
    Name: Schema.transformOrFail(Schema.String, Schema.String, {
        decode: (
            s: string,
            _options: Ast.ParseOptions,
            ast: Ast.Transformation
        ): Effect.Effect<string, ParseResult.ParseIssue, never> =>
            Function.pipe(
                WireguardInterface.InterfaceRegExpForPlatform,
                Effect.mapError((error) => new ParseResult.Type(ast, s, error.message)),
                Effect.andThen((x) =>
                    x.test(s)
                        ? Effect.succeed(s)
                        : Effect.fail(new ParseResult.Type(ast, s, `Expected interface name to match ${x}`))
                )
            ),
        encode: (s: string): Effect.Effect<string, never, never> => Effect.succeed(s),
    }),
}) {
    /**
     * @since 1.0.0
     * @category Constructors
     */
    public static getNextAvailableInterface: Effect.Effect<WireguardInterface, WireguardErrors.WireguardError, never> =
        Effect.gen(function* (λ) {
            // Determine all the used interface indexes
            const regex = yield* λ(WireguardInterface.InterfaceRegExpForPlatform);
            const usedInterfaceIndexes = Function.pipe(
                os.networkInterfaces(),
                Record.keys,
                Array.filter((name) => regex.test(name)),
                Array.map(String.replaceAll(/\D/g, "")),
                Array.map(Number.parse),
                Array.filterMap(Function.identity)
            );

            // Find the next available interface index
            const nextAvailableInterfaceIndex = yield* λ(
                Function.pipe(
                    Stream.iterate(0, (x) => x + 1),
                    Stream.find((x) => !Array.contains(usedInterfaceIndexes, x)),
                    Stream.take(1),
                    Stream.runCollect,
                    Effect.map(Chunk.head),
                    Effect.map(Option.getOrThrow)
                )
            );

            // We know this will be a supported platform now because otherwise
            // the WireguardInterface.InterfaceRegExpForPlatform would have failed
            const platform: (typeof SupportedPlatforms)[number] = Function.unsafeCoerce(process.platform);

            // Construct the next available interface name
            const fromString = Schema.decodeSync(WireguardInterface);
            switch (platform) {
                case "win32":
                case "freebsd":
                    return fromString({ Name: `eth${nextAvailableInterfaceIndex}` });
                case "linux":
                    return fromString({ Name: `wg${nextAvailableInterfaceIndex}` });
                case "openbsd":
                    return fromString({ Name: `tun${nextAvailableInterfaceIndex}` });
                case "darwin":
                    return fromString({ Name: `utun${nextAvailableInterfaceIndex}` });
                default:
                    return Function.absurd<WireguardInterface>(platform);
            }
        });

    public static InterfaceRegExpForPlatform: Effect.Effect<RegExp, WireguardErrors.WireguardError, never> =
        Function.pipe(
            Match.value(`${process.arch}:${process.platform}`),
            Match.not(
                Predicate.some(Array.map(SupportedArchitectures, (arch) => String.startsWith(`${arch}:`))),
                (bad) => Effect.fail(new WireguardErrors.WireguardError({ message: `Unsupported architecture ${bad}` }))
            ),
            Match.when(String.endsWith(":linux"), () => Effect.succeed(LinuxInterfaceNameRegExp)),
            Match.when(String.endsWith(":win32"), () => Effect.succeed(WindowsInterfaceNameRegExp)),
            Match.when(String.endsWith(":darwin"), () => Effect.succeed(DarwinInterfaceNameRegExp)),
            Match.when(String.endsWith(":openbsd"), () => Effect.succeed(OpenBSDInterfaceNameRegExp)),
            Match.when(String.endsWith(":freebsd"), () => Effect.succeed(FreeBSDInterfaceNameRegExp)),
            Match.orElse((bad) =>
                Effect.fail(new WireguardErrors.WireguardError({ message: `Unsupported platform ${bad}` }))
            )
        );

    /**
     * @since 1.0.0
     * @category Userspace api
     */
    public readonly SocketLocation = Function.pipe(
        Match.type<(typeof SupportedPlatforms)[number]>(),
        Match.when("win32", () => `\\\\.\\pipe\\wireguard-${this.Name}`),
        Match.when("linux", () => `/var/run/wireguard/${this.Name}.sock`),
        Match.when("darwin", () => `/var/run/wireguard/${this.Name}.sock`),
        Match.when("freebsd", () => `/var/run/wireguard/${this.Name}.sock`),
        Match.when("openbsd", () => `/var/run/wireguard/${this.Name}.sock`),
        Match.exhaustive
    )(Function.unsafeCoerce(process.platform));

    /**
     * Starts a wireguard tunnel that will be gracefully shutdown and stop
     * serving traffic once the scope is closed.
     *
     * @since 1.0.0
     * @category Wireguard control
     */
    public upScoped: {
        (
            config: WireguardConfig.WireguardConfig
        ): Effect.Effect<void, never, WireguardControl.WireguardControl | Scope.Scope>;
    } = (config) => Effect.flatMap(WireguardControl.WireguardControl, (control) => control.upScoped(config, this));

    /**
     * Starts a wireguard tunnel that will continue to run and serve traffic
     * even after the nodejs process exits.
     *
     * @since 1.0.0
     * @category Wireguard control
     */
    public up: {
        (config: WireguardConfig.WireguardConfig): Effect.Effect<void, never, WireguardControl.WireguardControl>;
    } = (config) => Effect.flatMap(WireguardControl.WireguardControl, (control) => control.up(config, this));

    /**
     * Stops a previously started wireguard tunnel.
     *
     * @since 1.0.0
     * @category Wireguard control
     */
    public down: {
        (config: WireguardConfig.WireguardConfig): Effect.Effect<void, never, WireguardControl.WireguardControl>;
    } = (config) => Effect.flatMap(WireguardControl.WireguardControl, (control) => control.down(config, this));
}

export default WireguardInterface;
