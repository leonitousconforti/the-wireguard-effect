import * as Platform from "@effect/platform";
import * as Socket from "@effect/platform-node/NodeSocket";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Match from "effect/Match";
import * as Number from "effect/Number";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as ReadonlyArray from "effect/ReadonlyArray";
import * as ReadonlyRecord from "effect/ReadonlyRecord";
import * as Scope from "effect/Scope";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as String from "effect/String";
import * as Tuple from "effect/Tuple";
import * as execa from "execa";
import * as os from "node:os";

import * as InternetSchemas from "../InternetSchemas.js";
import * as WireguardConfig from "../WireguardConfig.js";
import * as WireguardError from "../WireguardErrors.js";
import * as WireguardInterface from "../WireguardInterface.js";

/** @internal */
export const SupportedArchitectures = ["x64", "arm64"] as const;

/** @internal */
export type SupportedArchitecture = (typeof SupportedArchitectures)[number];

/** @internal */
export const SupportedPlatforms = ["linux", "win32", "darwin", "openbsd", "freebsd"] as const;

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

/** @internal */
export const WireguardGoExecutablePath: Effect.Effect<
    string,
    Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
> = Effect.gen(function* (λ) {
    const path = yield* λ(Platform.Path.Path);
    const fs = yield* λ(Platform.FileSystem.FileSystem);
    const arch = process.arch === "x64" ? "amd64" : process.arch;
    const url = new URL(`./${process.platform}-${arch}-wireguard-go`, import.meta.url);
    const pathString = yield* λ(path.fromFileUrl(url));
    yield* λ(fs.access(pathString, { ok: true }));
    return pathString;
});

/** @internal */
export const WgQuickExecutablePath: Effect.Effect<
    string,
    Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
> = Effect.gen(function* (λ) {
    const path = yield* λ(Platform.Path.Path);
    const fs = yield* λ(Platform.FileSystem.FileSystem);
    const url = new URL(`./${process.platform}-wg-quick`, import.meta.url);
    const pathString = yield* λ(path.fromFileUrl(url));
    yield* λ(fs.access(pathString, { ok: true }));
    return pathString;
});

/** @internal */
export const InterfaceRegExpForPlatform: Effect.Effect<RegExp, WireguardError.WireguardError, never> = Function.pipe(
    Match.value(`${process.arch}:${process.platform}`),
    Match.not(
        Predicate.some(ReadonlyArray.map(SupportedArchitectures, (arch) => String.startsWith(`${arch}:`))),
        (bad) => Effect.fail(new WireguardError.WireguardError({ message: `Unsupported architecture ${bad}` })),
    ),
    Match.when(String.endsWith(":linux"), () => Effect.succeed(LinuxInterfaceNameRegExp)),
    Match.when(String.endsWith(":win32"), () => Effect.succeed(WindowsInterfaceNameRegExp)),
    Match.when(String.endsWith(":darwin"), () => Effect.succeed(DarwinInterfaceNameRegExp)),
    Match.when(String.endsWith(":openbsd"), () => Effect.succeed(OpenBSDInterfaceNameRegExp)),
    Match.when(String.endsWith(":freebsd"), () => Effect.succeed(FreeBSDInterfaceNameRegExp)),
    Match.orElse((bad) => Effect.fail(new WireguardError.WireguardError({ message: `Unsupported platform ${bad}` }))),
);

/** @internal */
export const getNextAvailableInterface: Effect.Effect<
    WireguardInterface.WireguardInterface,
    WireguardError.WireguardError,
    never
> = Effect.gen(function* (λ) {
    // Determine all the used interface indexes
    const regex = yield* λ(InterfaceRegExpForPlatform);
    const usedInterfaceIndexes = Function.pipe(
        os.networkInterfaces(),
        ReadonlyRecord.keys,
        ReadonlyArray.filter((name) => regex.test(name)),
        ReadonlyArray.map(String.replaceAll(/\D/g, "")),
        ReadonlyArray.map(Number.parse),
        ReadonlyArray.filterMap(Function.identity),
    );

    // Find the next available interface index
    const nextAvailableInterfaceIndex = yield* λ(
        Function.pipe(
            Stream.iterate(0, (x) => x + 1),
            Stream.find((x) => !ReadonlyArray.contains(usedInterfaceIndexes, x)),
            Stream.take(1),
            Stream.runCollect,
            Effect.map(Chunk.head),
            Effect.map(Option.getOrThrow),
        ),
    );

    // We know this will be a supported platform now because otherwise
    // the WireguardInterface.InterfaceRegExpForPlatform would have failed
    const platform: (typeof SupportedPlatforms)[number] = Function.unsafeCoerce(process.platform);

    // Construct the next available interface name
    const fromString = Schema.decodeSync(WireguardInterface.WireguardInterface);
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
            return Function.absurd<WireguardInterface.WireguardInterface>(platform);
    }
});

/** @internal */
export const socketLocation = (interfaceObject: WireguardInterface.WireguardInterface): string =>
    Function.pipe(
        Match.type<(typeof SupportedPlatforms)[number]>(),
        Match.when("win32", () => `\\\\.\\pipe\\wireguard\\${interfaceObject.Name}`),
        Match.when("linux", () => `/var/run/wireguard/${interfaceObject.Name}.sock`),
        Match.when("darwin", () => `/var/run/wireguard/${interfaceObject.Name}.sock`),
        Match.when("freebsd", () => `/var/run/wireguard/${interfaceObject.Name}.sock`),
        Match.when("openbsd", () => `/var/run/wireguard/${interfaceObject.Name}.sock`),
        Match.orElseAbsurd,
    )(Function.unsafeCoerce(process.platform));

/** @internal */
export const upScoped = Function.dual<
    (
        config: WireguardConfig.WireguardConfig,
        options?: { replacePeers?: boolean | undefined; replaceAllowedIPs?: boolean | undefined } | undefined,
    ) => (
        interfaceObject: WireguardInterface.WireguardInterface,
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        WireguardError.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
        Scope.Scope | Platform.FileSystem.FileSystem | Platform.Path.Path
    >,
    (
        interfaceObject: WireguardInterface.WireguardInterface,
        config: WireguardConfig.WireguardConfig,
        options?: { replacePeers?: boolean | undefined; replaceAllowedIPs?: boolean | undefined } | undefined,
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        WireguardError.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
        Scope.Scope | Platform.FileSystem.FileSystem | Platform.Path.Path
    >
>(
    (args) => Schema.is(WireguardInterface.WireguardInterface)(args[0]),
    (
        interfaceObject: WireguardInterface.WireguardInterface,
        config: WireguardConfig.WireguardConfig,
        options?: { replacePeers?: boolean | undefined; replaceAllowedIPs?: boolean | undefined } | undefined,
    ) => Effect.acquireRelease(up(interfaceObject, config, options), Function.flow(down, Effect.orDie)),
);

/** @internal */
export const up = Function.dual<
    (
        config: WireguardConfig.WireguardConfig,
        options?: { replacePeers?: boolean | undefined; replaceAllowedIPs?: boolean | undefined } | undefined,
    ) => (
        interfaceObject: WireguardInterface.WireguardInterface,
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        WireguardError.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    >,
    (
        interfaceObject: WireguardInterface.WireguardInterface,
        config: WireguardConfig.WireguardConfig,
        options?: { replacePeers?: boolean | undefined; replaceAllowedIPs?: boolean | undefined } | undefined,
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        WireguardError.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    >
>(
    (args) => Schema.is(WireguardInterface.WireguardInterface)(args[0]),
    (
        interfaceObject: WireguardInterface.WireguardInterface,
        config: WireguardConfig.WireguardConfig,
        options?: { replacePeers?: boolean | undefined; replaceAllowedIPs?: boolean | undefined } | undefined,
    ) =>
        Effect.gen(function* (λ) {
            const path = yield* λ(Platform.Path.Path);
            const fs = yield* λ(Platform.FileSystem.FileSystem);
            const tempDirectory = yield* λ(fs.makeTempDirectory());
            const file = path.join(tempDirectory, `${interfaceObject.Name}.conf`);
            yield* λ(config.writeToFile(file));

            const wgQuickExecutablePath = yield* λ(WgQuickExecutablePath);
            const wireguardGoExecutablePath = yield* λ(WireguardGoExecutablePath);

            const command = `sudo ${wgQuickExecutablePath} up ${file}`;
            const env = { WG_QUICK_USERSPACE_IMPLEMENTATION: wireguardGoExecutablePath };

            yield* λ(
                Effect.tryPromise({
                    try: () => execa.execaCommand(command, { env }),
                    catch: (error) => new WireguardError.WireguardError({ message: `${error}` }),
                }),
            );

            return interfaceObject;
        }),
);

/** @internal */
export const down = (
    interfaceObject: WireguardInterface.WireguardInterface,
): Effect.Effect<void, Platform.Error.PlatformError, Platform.FileSystem.FileSystem> =>
    Effect.map(Platform.FileSystem.FileSystem, (fs) => fs.remove(socketLocation(interfaceObject)));

/** @internal */
export const setConfig = (
    config: WireguardConfig.WireguardConfig,
    interfaceObject: WireguardInterface.WireguardInterface,
): Effect.Effect<void, WireguardError.WireguardError | ParseResult.ParseError, never> =>
    Effect.gen(function* (λ) {
        const configDecoded = yield* λ(Schema.encode(WireguardConfig.WireguardConfig)(config));
        const [uapiConfig, _address] = yield* λ(Schema.decode(WireguardConfig.WireguardUapiConfig)(configDecoded));

        return Function.pipe(
            Stream.make(`set=1\n\n${uapiConfig}`),
            Stream.encodeText,
            Stream.pipeThroughChannelOrFail(Socket.makeNetChannel({ path: socketLocation(interfaceObject) })),
            Stream.decodeText(),
            Stream.run(Sink.last()),
            Effect.map(Option.getOrThrow),
            Effect.map(String.trimEnd),
            Effect.flatMap(Schema.decodeUnknown(WireguardError.SuccessErrno)),
            Effect.catchAll((error) => Effect.fail(new WireguardError.WireguardError({ message: error.message }))),
        );
    });

/** @internal */
export const getConfig = (
    address: InternetSchemas.CidrBlock,
    interfaceObject: WireguardInterface.WireguardInterface,
): Effect.Effect<WireguardConfig.WireguardConfig, WireguardError.WireguardError, never> =>
    Function.pipe(
        Stream.make("get=1\n\n"),
        Stream.encodeText,
        Stream.pipeThroughChannelOrFail(Socket.makeNetChannel({ path: socketLocation(interfaceObject) })),
        Stream.decodeText(),
        Stream.flatMap(Function.compose(String.linesIterator, Stream.fromIterable)),
        Stream.map(String.trimEnd),
        Stream.filter(String.isNonEmpty),
        Stream.run(Sink.collectAll()),
        Effect.tap(Function.flow(Chunk.last, Option.getOrThrow, Schema.decodeUnknown(WireguardError.SuccessErrno))),
        Effect.map(Chunk.join("\n")),
        Effect.map((uapiData) => Tuple.make(uapiData, address)),
        Effect.map(WireguardConfig.WireguardUapiConfig),
        Effect.flatMap(Schema.encode(WireguardConfig.WireguardUapiConfig)),
        Effect.flatMap(Schema.decode(WireguardConfig.WireguardConfig)),
        Effect.catchAll((error) => Effect.fail(new WireguardError.WireguardError({ message: error.message }))),
    );
