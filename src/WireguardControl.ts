/**
 * Wireguard control mechanisms.
 *
 * @since 1.0.0
 */

import * as NodeSocket from "@effect/platform-node/NodeSocket";
import * as Command from "@effect/platform/Command";
import * as CommandExecutor from "@effect/platform/CommandExecutor";
import * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Socket from "@effect/platform/Socket";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Resolver from "effect/RequestResolver";
import * as Scope from "effect/Scope";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as String from "effect/String";
import * as execa from "execa";

import * as WireguardConfig from "./WireguardConfig.js";
import * as WireguardErrors from "./WireguardErrors.js";
import type * as WireguardInterface from "./WireguardInterface.js";

/**
 * @since 1.0.0
 * @category Models
 */
export interface WireguardControlImpl {
    readonly up: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException,
        FileSystem.FileSystem | Path.Path | CommandExecutor.CommandExecutor
    >;

    readonly down: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        PlatformError.PlatformError | ParseResult.ParseError | Cause.UnknownException,
        FileSystem.FileSystem | Path.Path | CommandExecutor.CommandExecutor
    >;

    readonly upScoped: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException,
        FileSystem.FileSystem | Path.Path | Scope.Scope | CommandExecutor.CommandExecutor
    >;

    readonly getConfigRequestResolver: Resolver.RequestResolver<WireguardConfig.WireguardGetConfigRequest, never>;
    readonly setConfigRequestResolver: Resolver.RequestResolver<WireguardConfig.WireguardSetConfigRequest, never>;
}

/**
 * @since 1.0.0
 * @category Tags
 */
export interface WireguardControl {
    readonly _: unique symbol;
}

/**
 * @since 1.0.0
 * @category Tags
 */
export const WireguardControl = Context.GenericTag<WireguardControl, WireguardControlImpl>(
    "@leonitousconforti/the-wireguard-effect/WireguardControl"
);

/** @internal */
export const userspaceContact = (
    wireguardInterface: WireguardInterface.WireguardInterface,
    content: string
): Effect.Effect<string, Socket.SocketError | ParseResult.ParseError, never> =>
    Function.pipe(
        Stream.make(content),
        Stream.pipeThroughChannelOrFail(
            NodeSocket.makeNetChannel({
                path: wireguardInterface.SocketLocation,
            })
        ),
        Stream.decodeText(),
        Stream.flatMap(Function.compose(String.linesIterator, Stream.fromIterable)),
        Stream.map(String.trimEnd),
        Stream.filter(String.isNonEmpty),
        Stream.run(Sink.collectAll()),
        Effect.tap(Function.flow(Chunk.last, Option.getOrThrow, Schema.decodeUnknown(WireguardErrors.SuccessErrno))),
        Effect.map(Chunk.join("\n"))
    );

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeUserspaceLayer = (): WireguardControlImpl => {
    const up: WireguardControlImpl["up"] = (wireguardConfig, wireguardInterface) =>
        Effect.request(
            new WireguardConfig.WireguardSetConfigRequest({ config: wireguardConfig, wireguardInterface }),
            WireguardConfig.WireguardSetConfigResolver
        );

    const down: WireguardControlImpl["down"] = (_wireguardConfig, wireguardInterface) =>
        Effect.flatMap(FileSystem.FileSystem, (fs) => fs.remove(wireguardInterface.SocketLocation)).pipe(
            Effect.map(Function.constant(wireguardInterface))
        );

    const upScoped: WireguardControlImpl["upScoped"] = (wireguardConfig, wireguardInterface) =>
        Effect.acquireRelease(up(wireguardConfig, wireguardInterface), () =>
            down(wireguardConfig, wireguardInterface).pipe(Effect.orDie)
        );

    return WireguardControl.of({
        up,
        down,
        upScoped,
        getConfigRequestResolver: WireguardConfig.WireguardGetConfigResolver,
        setConfigRequestResolver: WireguardConfig.WireguardSetConfigResolver,
    });
};

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeBundledWgQuickLayer = (options: { sudo: boolean }): WireguardControlImpl => {
    const execCommand = (
        command: string,
        ...args: Array<string>
    ): Effect.Effect<void, Cause.UnknownException | PlatformError.PlatformError, CommandExecutor.CommandExecutor> =>
        process.platform === "win32" && command.includes("-wireguard-go.exe")
            ? Effect.tryPromise(() => {
                  const subprocess = execa.execa(command, args, {
                      cleanup: false,
                      detached: true,
                      stdio: "ignore",
                  });
                  subprocess.unref();
                  return new Promise((resolve) => setTimeout(resolve, 10000));
              })
            : Effect.flatMap(CommandExecutor.CommandExecutor, (executor) =>
                  executor.string(
                      Command.make(`${options.sudo && process.platform !== "win32" ? "sudo " : ""}${command}`, ...args)
                  )
              );

    const up: WireguardControlImpl["up"] = (wireguardConfig, wireguardInterface) =>
        Effect.gen(function* () {
            const path = yield* Path.Path;
            const fs = yield* FileSystem.FileSystem;
            const tempDirectory = yield* fs.makeTempDirectory();
            const file = path.join(tempDirectory, `${wireguardInterface.Name}.conf`);
            yield* wireguardConfig.writeToFile(file);

            const arch = process.arch === "x64" ? "amd64" : process.arch;
            const extension = process.platform === "win32" ? ".exe" : "";
            const wireguardGoUrl = new URL(`./${process.platform}-${arch}-wireguard-go${extension}`, import.meta.url);
            const bundledWireguardGoExecutablePath = yield* path.fromFileUrl(wireguardGoUrl);
            yield* fs.access(bundledWireguardGoExecutablePath, { ok: true });

            const wgQuickUrl = new URL(`./${process.platform}-wg-quick`, import.meta.url);
            const bundledWgQuickExecutablePath = yield* path.fromFileUrl(wgQuickUrl);
            if (process.platform !== "win32") yield* fs.access(bundledWgQuickExecutablePath, { ok: true });

            const wgWindowsUrl = new URL(`./win32-${arch}-wireguard.exe`, import.meta.url);
            const bundledWgWindowsExecutablePath = yield* path.fromFileUrl(wgWindowsUrl);
            if (process.platform === "win32") yield* fs.access(bundledWgWindowsExecutablePath, { ok: true });

            const wgQuickCommandWin = [bundledWgWindowsExecutablePath, "/installtunnelservice", file];
            const wgQuickCommandNix = [bundledWgQuickExecutablePath, "up", file];
            const wgQuickCommand = process.platform === "win32" ? wgQuickCommandWin : wgQuickCommandNix;

            yield* execCommand(bundledWireguardGoExecutablePath, wireguardInterface.Name);
            yield* Effect.request(
                new WireguardConfig.WireguardSetConfigRequest({ config: wireguardConfig, wireguardInterface }),
                WireguardConfig.WireguardSetConfigResolver
            );
            yield* execCommand(wgQuickCommand[0], ...wgQuickCommand.slice(1));
            return wireguardInterface;
        });

    const down: WireguardControlImpl["down"] = (wireguardConfig, wireguardInterface) =>
        Effect.gen(function* () {
            const path = yield* Path.Path;
            const fs = yield* FileSystem.FileSystem;
            const tempDirectory = yield* fs.makeTempDirectory();
            const file = path.join(tempDirectory, `${wireguardInterface.Name}.conf`);
            yield* wireguardConfig.writeToFile(file);

            const arch = process.arch === "x64" ? "amd64" : process.arch;
            const wgQuickUrl = new URL(`./${process.platform}-wg-quick`, import.meta.url);
            const bundledWgQuickExecutablePath = yield* path.fromFileUrl(wgQuickUrl);
            if (process.platform !== "win32") yield* fs.access(bundledWgQuickExecutablePath, { ok: true });

            const wgWindowsUrl = new URL(`./win32-${arch}-wireguard.exe`, import.meta.url);
            const bundledWgWindowsExecutablePath = yield* path.fromFileUrl(wgWindowsUrl);
            if (process.platform === "win32") yield* fs.access(bundledWgWindowsExecutablePath, { ok: true });

            const wgQuickCommandWin = [
                bundledWgWindowsExecutablePath,
                "/uninstalltunnelservice",
                wireguardInterface.Name,
            ];
            const wgQuickCommandNix = [bundledWgQuickExecutablePath, "down", file];
            const wgQuickCommand = process.platform === "win32" ? wgQuickCommandWin : wgQuickCommandNix;
            yield* execCommand(wgQuickCommand[0], ...wgQuickCommand.slice(1));
            return wireguardInterface;
        });

    const upScoped: WireguardControlImpl["upScoped"] = (wireguardConfig, wireguardInterface) =>
        Effect.acquireRelease(up(wireguardConfig, wireguardInterface), () =>
            down(wireguardConfig, wireguardInterface).pipe(Effect.orDie)
        );

    return WireguardControl.of({
        up,
        down,
        upScoped,
        getConfigRequestResolver: WireguardConfig.WireguardGetConfigResolver,
        setConfigRequestResolver: WireguardConfig.WireguardSetConfigResolver,
    });
};

/**
 * @since 1.0.0
 * @category Layers
 */
export const UserspaceLayer = Layer.sync(WireguardControl, makeUserspaceLayer);

/**
 * @since 1.0.0
 * @category Layers
 */
export const BundledWgQuickLayer = Layer.sync(WireguardControl, () => makeBundledWgQuickLayer({ sudo: true }));
