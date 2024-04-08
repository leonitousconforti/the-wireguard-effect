import * as Platform from "@effect/platform";
import * as Socket from "@effect/platform-node/NodeSocket";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as sudoPrompt from "@vscode/sudo-prompt";
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
import * as WireguardErrors from "../WireguardErrors.js";
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
export const InterfaceRegExpForPlatform: Effect.Effect<RegExp, WireguardErrors.WireguardError, never> = Function.pipe(
    Match.value(`${process.arch}:${process.platform}`),
    Match.not(
        Predicate.some(ReadonlyArray.map(SupportedArchitectures, (arch) => String.startsWith(`${arch}:`))),
        (bad) => Effect.fail(new WireguardErrors.WireguardError({ message: `Unsupported architecture ${bad}` }))
    ),
    Match.when(String.endsWith(":linux"), () => Effect.succeed(LinuxInterfaceNameRegExp)),
    Match.when(String.endsWith(":win32"), () => Effect.succeed(WindowsInterfaceNameRegExp)),
    Match.when(String.endsWith(":darwin"), () => Effect.succeed(DarwinInterfaceNameRegExp)),
    Match.when(String.endsWith(":openbsd"), () => Effect.succeed(OpenBSDInterfaceNameRegExp)),
    Match.when(String.endsWith(":freebsd"), () => Effect.succeed(FreeBSDInterfaceNameRegExp)),
    Match.orElse((bad) => Effect.fail(new WireguardErrors.WireguardError({ message: `Unsupported platform ${bad}` })))
);

/** @internal */
export const getNextAvailableInterface: Effect.Effect<
    WireguardInterface.WireguardInterface,
    WireguardErrors.WireguardError,
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
        ReadonlyArray.filterMap(Function.identity)
    );

    // Find the next available interface index
    const nextAvailableInterfaceIndex = yield* λ(
        Function.pipe(
            Stream.iterate(0, (x) => x + 1),
            Stream.find((x) => !ReadonlyArray.contains(usedInterfaceIndexes, x)),
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
        Match.orElseAbsurd
    )(Function.unsafeCoerce(process.platform));

/** @internal */
export const execCommand = (
    withSudo: boolean | "ask",
    command: string,
    env?: { [key: string]: string }
): Effect.Effect<void, WireguardErrors.WireguardError, never> =>
    withSudo === "ask"
        ? Effect.try({
              try: () => sudoPrompt.exec(`${command}`, { name: "The-WireGuard-Effect", env: env ?? {} }),
              catch: (error) => new WireguardErrors.WireguardError({ message: `${error}` }),
          })
        : Effect.tryPromise({
              try: () => {
                  const subprocess = execa.execaCommand(`${withSudo === true ? "sudo " : ""}${command}`, {
                      env: env ?? {},
                      cleanup: false,
                      detached: true,
                      stdio: "ignore",
                  });
                  subprocess.unref();
                  return subprocess;
              },
              catch: (error) => new WireguardErrors.WireguardError({ message: `${error}` }),
          });

/** @internal */
export const upScoped = Function.dual<
    (
        config: WireguardConfig.WireguardConfig,
        options: {
            how?:
                | "bundled-wireguard-go+userspace-api"
                | "system-wireguard-go+userspace-api"
                | "system-wireguard+system-wg-quick"
                | "system-wireguard+bundled-wg-quick"
                | "system-wireguard-go+system-wg-quick"
                | "bundled-wireguard-go+system-wg-quick"
                | "system-wireguard-go+bundled-wg-quick"
                | "bundled-wireguard-go+bundled-wg-quick"
                | undefined;
            sudo?: boolean | "ask";
        }
    ) => (
        interfaceObject: WireguardInterface.WireguardInterface
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
        Scope.Scope | Platform.FileSystem.FileSystem | Platform.Path.Path
    >,
    (
        interfaceObject: WireguardInterface.WireguardInterface,
        config: WireguardConfig.WireguardConfig,
        options: {
            how?:
                | "bundled-wireguard-go+userspace-api"
                | "system-wireguard-go+userspace-api"
                | "system-wireguard+system-wg-quick"
                | "system-wireguard+bundled-wg-quick"
                | "system-wireguard-go+system-wg-quick"
                | "bundled-wireguard-go+system-wg-quick"
                | "system-wireguard-go+bundled-wg-quick"
                | "bundled-wireguard-go+bundled-wg-quick"
                | undefined;
            sudo?: boolean | "ask";
        }
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
        Scope.Scope | Platform.FileSystem.FileSystem | Platform.Path.Path
    >
>(
    (args) => Schema.is(WireguardInterface.WireguardInterface)(args[0]),
    (interfaceObject, config, options) => {
        const downControlOptions = Function.pipe(
            Match.value(options?.how),
            Match.when(Predicate.isUndefined, () => ({ how: "userspace-api" }) as const),
            Match.whenOr(
                "bundled-wireguard-go+userspace-api",
                "system-wireguard-go+userspace-api",
                () => ({ how: "userspace-api" }) as const
            ),
            Match.whenOr(
                "bundled-wireguard-go+bundled-wg-quick",
                "system-wireguard+bundled-wg-quick",
                "system-wireguard-go+bundled-wg-quick",
                () => ({ how: "bundled-wg-quick" }) as const
            ),
            Match.whenOr(
                "bundled-wireguard-go+system-wg-quick",
                "system-wireguard+system-wg-quick",
                "system-wireguard-go+system-wg-quick",
                () => ({ how: "system-wg-quick" }) as const
            ),
            Match.exhaustive
        );

        return Effect.acquireRelease(
            up(interfaceObject, config, options),
            Function.flow(Function.constant(down(interfaceObject, downControlOptions)), Effect.orDie)
        );
    }
);

/** @internal */
export const up = Function.dual<
    (
        config: WireguardConfig.WireguardConfig,
        options: {
            how?:
                | "bundled-wireguard-go+userspace-api"
                | "system-wireguard-go+userspace-api"
                | "system-wireguard+system-wg-quick"
                | "system-wireguard+bundled-wg-quick"
                | "system-wireguard-go+system-wg-quick"
                | "bundled-wireguard-go+system-wg-quick"
                | "system-wireguard-go+bundled-wg-quick"
                | "bundled-wireguard-go+bundled-wg-quick"
                | undefined;
            sudo?: boolean | "ask";
        }
    ) => (
        interfaceObject: WireguardInterface.WireguardInterface
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    >,
    (
        interfaceObject: WireguardInterface.WireguardInterface,
        config: WireguardConfig.WireguardConfig,
        options: {
            how?:
                | "bundled-wireguard-go+userspace-api"
                | "system-wireguard-go+userspace-api"
                | "system-wireguard+system-wg-quick"
                | "system-wireguard+bundled-wg-quick"
                | "system-wireguard-go+system-wg-quick"
                | "bundled-wireguard-go+system-wg-quick"
                | "system-wireguard-go+bundled-wg-quick"
                | "bundled-wireguard-go+bundled-wg-quick"
                | undefined;
            sudo?: boolean | "ask";
        }
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        WireguardErrors.WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    >
>(
    (args) => Schema.is(WireguardInterface.WireguardInterface)(args[0]),
    (interfaceObject, config, options) =>
        Effect.gen(function* (λ) {
            const path = yield* λ(Platform.Path.Path);
            const fs = yield* λ(Platform.FileSystem.FileSystem);
            const tempDirectory = yield* λ(fs.makeTempDirectory());

            // Write the configuration to a temporary file
            const file = path.join(tempDirectory, `${interfaceObject.Name}.conf`);
            yield* λ(config.writeToFile(file));

            // Find bundled executables and scripts
            const bundledWgQuickExecutablePath = "";
            const bundledWireguardGoExecutablePath = yield* λ(WireguardGoExecutablePath);

            switch (options?.how) {
                // Bring up the interface using the bundled wireguard-go and userspace API
                case undefined:
                case "bundled-wireguard-go+userspace-api":
                    const command2_1 = `${bundledWireguardGoExecutablePath} ${interfaceObject.Name}`;
                    yield* λ(execCommand(options?.sudo ?? "ask", command2_1));
                    yield* λ(setConfig(config, interfaceObject));
                    return interfaceObject;

                // Bring up the interface using the bundled wireguard-go and the bundled wg-quick script
                case "bundled-wireguard-go+bundled-wg-quick":
                    const env3 = { WG_QUICK_USERSPACE_IMPLEMENTATION: bundledWireguardGoExecutablePath };
                    const command3 = `${bundledWgQuickExecutablePath} up ${file}`;
                    yield* λ(execCommand(options.sudo ?? "ask", command3, env3));
                    return interfaceObject;

                // Bring up the interface using the bundled wireguard-go and the system wg-quick script
                case "bundled-wireguard-go+system-wg-quick":
                    const env4 = { WG_QUICK_USERSPACE_IMPLEMENTATION: bundledWireguardGoExecutablePath };
                    const command4 = `wg-quick up ${file}`;
                    yield* λ(execCommand(options.sudo ?? "ask", command4, env4));
                    return interfaceObject;

                // Bring up the interface using the system wireguard-go and the userspace API
                case "system-wireguard-go+userspace-api":
                    const command5_1 = `wireguard-go ${interfaceObject.Name}`;
                    yield* λ(execCommand(options.sudo ?? "ask", command5_1));
                    yield* λ(setConfig(config, interfaceObject));
                    return interfaceObject;

                // Bring up the interface using the system wireguard-go and the bundled wg-quick script
                case "system-wireguard-go+bundled-wg-quick":
                    const env6 = { WG_QUICK_USERSPACE_IMPLEMENTATION: "wireguard-go" };
                    const command6 = `${bundledWgQuickExecutablePath} up ${file}`;
                    yield* λ(execCommand(options.sudo ?? "ask", command6, env6));
                    return interfaceObject;

                // Bring up the interface using the system wireguard-go and the system wg-quick script
                case "system-wireguard-go+system-wg-quick":
                    const env7 = { WG_QUICK_USERSPACE_IMPLEMENTATION: "wireguard-go" };
                    const command7 = `wg-quick up ${file}`;
                    yield* λ(execCommand(options.sudo ?? "ask", command7, env7));
                    return interfaceObject;

                // Bring up the interface using the system wireguard and the bundled wg-quick script
                case "system-wireguard+bundled-wg-quick":
                    const command8 = `${bundledWgQuickExecutablePath} up ${file}`;
                    yield* λ(execCommand(options.sudo ?? "ask", command8));
                    return interfaceObject;

                // Bring up the interface using the system wireguard and the system wg quick script
                case "system-wireguard+system-wg-quick":
                    const command9 = `wg-quick up ${file}`;
                    yield* λ(execCommand(options.sudo ?? "ask", command9));
                    return interfaceObject;
            }
        })
);

/** @internal */
export const down = (
    interfaceObject: WireguardInterface.WireguardInterface,
    options: {
        sudo?: boolean | "ask";
        how: "bundled-wg-quick" | "userspace-api" | "system-wg-quick";
    }
): Effect.Effect<void, Platform.Error.PlatformError, Platform.FileSystem.FileSystem> =>
    Effect.map(Platform.FileSystem.FileSystem, (fs) => fs.remove(socketLocation(interfaceObject)));

/** @internal */
export const setConfig = (
    config: WireguardConfig.WireguardConfig,
    interfaceObject: WireguardInterface.WireguardInterface
): Effect.Effect<void, WireguardErrors.WireguardError | ParseResult.ParseError, never> =>
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
            Effect.flatMap(Schema.decodeUnknown(WireguardErrors.SuccessErrno)),
            Effect.catchAll((error) => Effect.fail(new WireguardErrors.WireguardError({ message: error.message })))
        );
    });

/** @internal */
export const getConfig = (
    address: InternetSchemas.CidrBlock,
    interfaceObject: WireguardInterface.WireguardInterface
): Effect.Effect<WireguardConfig.WireguardConfig, WireguardErrors.WireguardError, never> =>
    Function.pipe(
        Stream.make("get=1\n\n"),
        Stream.encodeText,
        Stream.pipeThroughChannelOrFail(Socket.makeNetChannel({ path: socketLocation(interfaceObject) })),
        Stream.decodeText(),
        Stream.flatMap(Function.compose(String.linesIterator, Stream.fromIterable)),
        Stream.map(String.trimEnd),
        Stream.filter(String.isNonEmpty),
        Stream.run(Sink.collectAll()),
        Effect.tap(Function.flow(Chunk.last, Option.getOrThrow, Schema.decodeUnknown(WireguardErrors.SuccessErrno))),
        Effect.map(Chunk.join("\n")),
        Effect.map((uapiData) => Tuple.make(uapiData, address)),
        Effect.flatMap(Schema.encode(WireguardConfig.WireguardUapiConfig)),
        Effect.flatMap(Schema.decode(WireguardConfig.WireguardConfig)),
        Effect.catchAll((error) => Effect.fail(new WireguardErrors.WireguardError({ message: error.message })))
    );
