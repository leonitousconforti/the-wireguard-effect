import * as Command from "@effect/platform/Command";
import * as CommandExecutor from "@effect/platform/CommandExecutor";
import * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Socket from "@effect/platform/Socket";
import * as Array from "effect/Array";
import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Layer from "effect/Layer";
import * as ParseResult from "effect/ParseResult";
import * as Predicate from "effect/Predicate";
import * as Stream from "effect/Stream";
import * as String from "effect/String";
import * as Tuple from "effect/Tuple";
import * as exec from "node:child_process";

import type * as WireguardConfig from "../WireguardConfig.js";
import type * as _WireguardControl from "../WireguardControl.js";
import type * as WireguardInterface from "../WireguardInterface.js";

/** @internal */
export const TypeId: _WireguardControl.TypeId = Symbol.for(
    "@leonitousconforti/the-wireguard-effect/WireguardControl"
) as _WireguardControl.TypeId;

/** @internal */
export const WireguardControl = Context.GenericTag<_WireguardControl.WireguardControl>(
    "@leonitousconforti/the-wireguard-effect/WireguardControl"
);

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeUserspaceLayer = (): _WireguardControl.WireguardControl => {
    const up: _WireguardControl.WireguardControl["up"] = (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => wireguardInterface.setConfig(wireguardConfig);

    const down: _WireguardControl.WireguardControl["down"] = (
        _wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) =>
        Effect.map(
            Effect.flatMap(FileSystem.FileSystem, (fs) => fs.remove(wireguardInterface.SocketLocation)),
            () => wireguardInterface
        );

    const upScoped: _WireguardControl.WireguardControl["upScoped"] = (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => {
        const _down = down(wireguardConfig, wireguardInterface).pipe(Effect.orDie);
        const _up = wireguardInterface.setConfig(wireguardConfig).pipe(Effect.onError(() => _down));
        return Effect.acquireRelease(_up, () => _down);
    };

    return WireguardControl.of({
        [TypeId]: TypeId,
        up,
        down,
        upScoped,
    });
};

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeBundledWgQuickLayer = (options: { sudo: boolean }): _WireguardControl.WireguardControl => {
    // process.platform === "win32" && command.includes("-wireguard-go.exe")
    const execCommandWireguardGoWindows = (
        command: string,
        ...args: Array<string>
    ): Effect.Effect<exec.ChildProcess, PlatformError.PlatformError | Cause.TimeoutException, FileSystem.FileSystem> =>
        Effect.asyncEffect<
            exec.ChildProcess,
            PlatformError.PlatformError,
            never,
            never,
            PlatformError.PlatformError,
            FileSystem.FileSystem
        >((resume) =>
            Effect.gen(function* () {
                const fileSystem = yield* FileSystem.FileSystem;
                const stdout = yield* fileSystem.makeTempFile();
                const stderr = yield* fileSystem.makeTempFile();
                const { fd: stdoutFd } = yield* fileSystem.open(stdout, { flag: "r+" });
                const { fd: stderrFd } = yield* fileSystem.open(stderr, { flag: "r+" });

                const subprocess = exec.spawn(command, args, {
                    detached: true,
                    stdio: ["ignore", stdoutFd, stderrFd],
                });

                subprocess.unref();
                subprocess.on("exit", onExit);
                subprocess.on("close", onClose);
                subprocess.on("error", onError);
                subprocess.on("disconnect", onDisconnect);

                yield* Function.pipe(
                    fileSystem.stream(stdout),
                    Stream.decodeText("utf-8"),
                    Stream.splitLines,
                    Stream.takeUntil(String.includes("UAPI listener started")),
                    Stream.runDrain
                );

                subprocess.off("exit", onExit);
                subprocess.off("close", onClose);
                subprocess.off("error", onError);
                subprocess.off("disconnect", onDisconnect);
                yield* Effect.sleep(10_000);
                resume(Effect.succeed(subprocess));

                function onError(error: Error) {
                    subprocess.off("exit", onExit);
                    subprocess.off("close", onClose);
                    subprocess.off("error", onError);
                    subprocess.off("disconnect", onDisconnect);
                    resume(
                        Effect.gen(function* () {
                            const stdoutString = yield* fileSystem.readFileString(stdout, "utf-8");
                            const stderrString = yield* fileSystem.readFileString(stderr, "utf-8");
                            return yield* Effect.fail(
                                PlatformError.SystemError({
                                    reason: "Unknown",
                                    module: "Command",
                                    method: "wireguard-go.exe",
                                    pathOrDescriptor: command,
                                    message: `${error.message}\n${stdoutString}\n${stderrString}`,
                                })
                            );
                        })
                    );
                }

                function onExit(code: number | null) {
                    if (Predicate.isNotNull(code)) {
                        return onError(new Error(`Process exited unexpectedly with code ${code}`));
                    } else {
                        return onError(new Error("Process exited unexpectedly."));
                    }
                }

                function onClose(code: number | null) {
                    if (Predicate.isNotNull(code)) {
                        return onError(new Error(`Process closed unexpectedly with code ${code}`));
                    } else {
                        return onError(new Error("Process closed unexpectedly."));
                    }
                }

                function onDisconnect() {
                    return onError(new Error("Process disconnected unexpectedly."));
                }

                return Effect.sync(() => {
                    subprocess.off("exit", onExit);
                    subprocess.off("close", onClose);
                    subprocess.off("error", onError);
                    subprocess.off("disconnect", onDisconnect);
                });
            }).pipe(Effect.scoped)
        ).pipe(Effect.timeout("1 minutes"));

    const execCommand = (
        command: string,
        ...args: Array<string>
    ): Effect.Effect<
        void,
        PlatformError.PlatformError | Cause.TimeoutException,
        CommandExecutor.CommandExecutor | FileSystem.FileSystem
    > =>
        Function.pipe(
            CommandExecutor.CommandExecutor,
            Effect.flatMap((executor) =>
                executor.start(
                    options.sudo && process.platform !== "win32"
                        ? Command.make("sudo", command, ...args)
                        : Command.make(command, ...args)
                )
            ),
            Effect.flatMap((process) =>
                Effect.all(
                    [
                        process.stdout.pipe(
                            Stream.decodeText("utf-8"),
                            Stream.splitLines,
                            Stream.runCollect,
                            Effect.map(Chunk.toReadonlyArray)
                        ),
                        process.stderr.pipe(
                            Stream.decodeText("utf-8"),
                            Stream.splitLines,
                            Stream.runCollect,
                            Effect.map(Chunk.toReadonlyArray)
                        ),
                        process.exitCode,
                    ],
                    { concurrency: 3 }
                )
            ),
            Effect.flatMap(([stdout, stderr, exitCode]) => {
                return exitCode === 0
                    ? Effect.void
                    : Effect.fail(
                          PlatformError.SystemError({
                              reason: "Unknown",
                              module: "Command",
                              pathOrDescriptor: command,
                              method: `${command} ${args.join(" ")}`,
                              message: `Process exited with code ${exitCode}: ${stdout.join("\n")}, ${stderr.join("\n")}`,
                          })
                      );
            }),
            Effect.timeout("10 seconds"),
            Effect.scoped
        );

    const internalUp: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<
        | readonly [wireguardInterface: WireguardInterface.WireguardInterface]
        | readonly [
              wireguardInterface: WireguardInterface.WireguardInterface,
              wireguardGoSubprocess: exec.ChildProcess,
          ],
        Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.TimeoutException,
        FileSystem.FileSystem | Path.Path | CommandExecutor.CommandExecutor
    > = (wireguardConfig: WireguardConfig.WireguardConfig, wireguardInterface: WireguardInterface.WireguardInterface) =>
        Effect.gen(function* () {
            const path = yield* Path.Path;
            const fs = yield* FileSystem.FileSystem;
            const tempDirectory = yield* fs.makeTempDirectory();
            const file = path.join(tempDirectory, `${wireguardInterface.Name}.conf`);
            yield* wireguardConfig.writeToFile(file);

            const arch = process.arch === "x64" ? "amd64" : process.arch;
            const extension = process.platform === "win32" ? ".exe" : "";
            const wireguardGoUrl = new URL(`../${process.platform}-${arch}-wireguard-go${extension}`, import.meta.url);
            const bundledWireguardGoExecutablePath = yield* path.fromFileUrl(wireguardGoUrl);
            yield* fs.access(bundledWireguardGoExecutablePath, { ok: true });

            const wgQuickUrl = new URL(`../${process.platform}-wg-quick`, import.meta.url);
            const bundledWgQuickExecutablePath = yield* path.fromFileUrl(wgQuickUrl);
            if (process.platform !== "win32") yield* fs.access(bundledWgQuickExecutablePath, { ok: true });

            const wgWindowsUrl = new URL(`../win32-${arch}-wireguard.exe`, import.meta.url);
            const bundledWgWindowsExecutablePath = yield* path.fromFileUrl(wgWindowsUrl);
            if (process.platform === "win32") yield* fs.access(bundledWgWindowsExecutablePath, { ok: true });

            const wgQuickCommandNix = [bundledWgQuickExecutablePath, "up", file] as const;
            const wgQuickCommandWin = [bundledWgWindowsExecutablePath, "/installtunnelservice", file] as const;
            const wgQuickCommand = process.platform === "win32" ? wgQuickCommandWin : wgQuickCommandNix;

            if (process.platform === "win32") {
                const runningWireguardGoProcess = yield* execCommandWireguardGoWindows(
                    bundledWireguardGoExecutablePath,
                    wireguardInterface.Name
                );
                yield* wireguardInterface.setConfig(wireguardConfig);
                yield* execCommand(wgQuickCommand[0], ...wgQuickCommand.slice(1));
                return Tuple.make(wireguardInterface, runningWireguardGoProcess);
            } else {
                yield* execCommand(bundledWireguardGoExecutablePath, wireguardInterface.Name);
                yield* wireguardInterface.setConfig(wireguardConfig);
                yield* execCommand(wgQuickCommand[0], ...wgQuickCommand.slice(1));
                return Tuple.make(wireguardInterface);
            }
        });

    const down: _WireguardControl.WireguardControl["down"] = (
        wireguardConfig,
        wireguardInterface,
        wireguardGoSubprocess
    ) =>
        Effect.gen(function* () {
            const path = yield* Path.Path;
            const fs = yield* FileSystem.FileSystem;

            if (wireguardGoSubprocess) wireguardGoSubprocess.kill();
            const tempDirectory = yield* fs.makeTempDirectory();
            const file = path.join(tempDirectory, `${wireguardInterface.Name}.conf`);
            yield* wireguardConfig.writeToFile(file);

            const arch = process.arch === "x64" ? "amd64" : process.arch;
            const wgQuickUrl = new URL(`../${process.platform}-wg-quick`, import.meta.url);
            const bundledWgQuickExecutablePath = yield* path.fromFileUrl(wgQuickUrl);
            if (process.platform !== "win32") yield* fs.access(bundledWgQuickExecutablePath, { ok: true });

            const wgWindowsUrl = new URL(`../win32-${arch}-wireguard.exe`, import.meta.url);
            const bundledWgWindowsExecutablePath = yield* path.fromFileUrl(wgWindowsUrl);
            if (process.platform === "win32") yield* fs.access(bundledWgWindowsExecutablePath, { ok: true });

            const wgQuickCommandWin = [
                bundledWgWindowsExecutablePath,
                "/uninstalltunnelservice",
                wireguardInterface.Name,
            ] as const;
            const wgQuickCommandNix = [bundledWgQuickExecutablePath, "down", file] as const;
            const wgQuickCommand = process.platform === "win32" ? wgQuickCommandWin : wgQuickCommandNix;
            yield* execCommand(wgQuickCommand[0], ...wgQuickCommand.slice(1));
            return wireguardInterface;
        });

    const upScoped: _WireguardControl.WireguardControl["upScoped"] = (wireguardConfig, wireguardInterface) => {
        const _down = (wireguardGoSubprocess?: exec.ChildProcess | undefined) =>
            down(wireguardConfig, wireguardInterface, wireguardGoSubprocess).pipe(Effect.orDie);
        const _up = internalUp(wireguardConfig, wireguardInterface).pipe(Effect.onError(() => _down()));
        return Effect.acquireRelease(_up, (data) => {
            if (Array.isArray(data) && Tuple.isTupleOf(data, 2)) {
                const [_, wireguardGoSubprocess] = data;
                return _down(wireguardGoSubprocess);
            } else {
                return _down();
            }
        }).pipe(Effect.map((data) => (Tuple.isTupleOf(data, 2) ? Tuple.getFirst(data) : data[0])));
    };

    const up: _WireguardControl.WireguardControl["up"] = (wireguardConfig, wireguardInterface) =>
        internalUp(wireguardConfig, wireguardInterface).pipe(
            Effect.map((data) => (Tuple.isTupleOf(data, 2) ? Tuple.getFirst(data) : data[0]))
        );

    return WireguardControl.of({
        [TypeId]: TypeId,
        up,
        down,
        upScoped,
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
