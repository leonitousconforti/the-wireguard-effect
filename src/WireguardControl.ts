/**
 * Wireguard control mechanisms.
 *
 * @since 1.0.0
 */

import * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Socket from "@effect/platform/Socket";
import * as ParseResult from "@effect/schema/ParseResult";
import * as sudoPrompt from "@vscode/sudo-prompt";
import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Resolver from "effect/RequestResolver";
import * as Scope from "effect/Scope";
import * as execa from "execa";

import * as WireguardConfig from "./WireguardConfig.js";
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
        void,
        Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException,
        FileSystem.FileSystem | Path.Path
    >;

    readonly down: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<
        void,
        PlatformError.PlatformError | ParseResult.ParseError | Cause.UnknownException,
        FileSystem.FileSystem | Path.Path
    >;

    readonly upScoped: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<
        void,
        Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException,
        FileSystem.FileSystem | Path.Path | Scope.Scope
    >;

    readonly getConfig: Resolver.RequestResolver<WireguardConfig.WireguardGetConfigRequest, never>;
    readonly setConfig: Resolver.RequestResolver<WireguardConfig.WireguardSetConfigRequest, never>;
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
        Effect.flatMap(FileSystem.FileSystem, (fs) => fs.remove(wireguardInterface.SocketLocation));

    const upScoped: WireguardControlImpl["upScoped"] = (wireguardConfig, wireguardInterface) =>
        Effect.acquireRelease(up(wireguardConfig, wireguardInterface), () =>
            down(wireguardConfig, wireguardInterface).pipe(Effect.orDie)
        );

    return WireguardControl.of({
        up,
        down,
        upScoped,
        getConfig: WireguardConfig.WireguardGetConfigResolver,
        setConfig: WireguardConfig.WireguardSetConfigResolver,
    });
};

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeBundledWgQuickLayer = (options: { sudo: boolean | "ask" }): WireguardControlImpl => {
    const execCommand = (command: string): Effect.Effect<void, Cause.UnknownException, never> =>
        options.sudo === "ask"
            ? Effect.try(() => sudoPrompt.exec(`${command}`, { name: "The-WireGuard-Effect" }))
            : Effect.tryPromise(() => {
                  const subprocess = execa.execaCommand(
                      `${options.sudo === true && process.platform !== "win32" ? "sudo " : ""}${command}`,
                      {
                          stdio: "ignore",
                          cleanup: !command.includes("wireguard-go"),
                          detached: command.includes("wireguard-go"),
                      }
                  );
                  if (command.includes("wireguard-go")) subprocess.unref();
                  return subprocess;
              });

    const up: WireguardControlImpl["up"] = (wireguardConfig, wireguardInterface) =>
        Effect.gen(function* (λ) {
            const path = yield* λ(Path.Path);
            const fs = yield* λ(FileSystem.FileSystem);
            const tempDirectory = yield* λ(fs.makeTempDirectory());
            const file = path.join(tempDirectory, `${wireguardInterface.Name}.conf`);
            yield* λ(wireguardConfig.writeToFile(file));

            const arch = process.arch === "x64" ? "amd64" : process.arch;
            const wireguardGoUrl = new URL(`./${process.platform}-${arch}-wireguard-go`, import.meta.url);
            const bundledWireguardGoExecutablePath = yield* λ(path.fromFileUrl(wireguardGoUrl));
            yield* λ(fs.access(bundledWireguardGoExecutablePath, { ok: true }));

            const wgQuickUrl = new URL(`./${process.platform}-wg-quick`, import.meta.url);
            const bundledWgQuickExecutablePath = yield* λ(path.fromFileUrl(wgQuickUrl));
            if (process.platform !== "win32") yield* λ(fs.access(bundledWgQuickExecutablePath, { ok: true }));

            const wgWindowsUrl = new URL(`./win32-${arch}-wireguard.exe`, import.meta.url);
            const bundledWgWindowsExecutablePath = yield* λ(path.fromFileUrl(wgWindowsUrl));
            if (process.platform === "win32") yield* λ(fs.access(bundledWgWindowsExecutablePath, { ok: true }));

            const wgQuickCommandWin = `${bundledWgWindowsExecutablePath} /installtunnelservice ${file}`;
            const wgQuickCommandNix = `${bundledWgQuickExecutablePath} up ${file}`;
            const wgQuickCommand = process.platform === "win32" ? wgQuickCommandWin : wgQuickCommandNix;
            const wireguardGoCommand = `${bundledWireguardGoExecutablePath} ${wireguardInterface.Name}`;

            yield* λ(execCommand(wireguardGoCommand));
            yield* λ(
                Effect.request(
                    new WireguardConfig.WireguardSetConfigRequest({ config: wireguardConfig, wireguardInterface }),
                    WireguardConfig.WireguardSetConfigResolver
                )
            );
            yield* λ(execCommand(wgQuickCommand));
        });

    const down: WireguardControlImpl["down"] = (wireguardConfig, wireguardInterface) =>
        Effect.gen(function* (λ) {
            const path = yield* λ(Path.Path);
            const fs = yield* λ(FileSystem.FileSystem);
            const tempDirectory = yield* λ(fs.makeTempDirectory());
            const file = path.join(tempDirectory, `${wireguardInterface.Name}.conf`);
            yield* λ(wireguardConfig.writeToFile(file));

            const arch = process.arch === "x64" ? "amd64" : process.arch;
            const wgQuickUrl = new URL(`./${process.platform}-wg-quick`, import.meta.url);
            const bundledWgQuickExecutablePath = yield* λ(path.fromFileUrl(wgQuickUrl));
            if (process.platform !== "win32") yield* λ(fs.access(bundledWgQuickExecutablePath, { ok: true }));

            const wgWindowsUrl = new URL(`./win32-${arch}-wireguard.exe`, import.meta.url);
            const bundledWgWindowsExecutablePath = yield* λ(path.fromFileUrl(wgWindowsUrl));
            if (process.platform === "win32") yield* λ(fs.access(bundledWgWindowsExecutablePath, { ok: true }));

            const wgQuickCommandWin = `${bundledWgWindowsExecutablePath} /uninstalltunnelservice ${file}`;
            const wgQuickCommandNix = `${bundledWgQuickExecutablePath} down ${file}`;
            const wgQuickCommand = process.platform === "win32" ? wgQuickCommandWin : wgQuickCommandNix;
            yield* λ(execCommand(wgQuickCommand));
        });

    const upScoped: WireguardControlImpl["upScoped"] = (wireguardConfig, wireguardInterface) =>
        Effect.acquireRelease(up(wireguardConfig, wireguardInterface), () =>
            down(wireguardConfig, wireguardInterface).pipe(Effect.orDie)
        );

    return WireguardControl.of({
        up,
        down,
        upScoped,
        getConfig: WireguardConfig.WireguardGetConfigResolver,
        setConfig: WireguardConfig.WireguardSetConfigResolver,
    });
};

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeSystemWgQuickLayer = (options: { sudo: boolean | "ask" }): WireguardControlImpl => {
    const execCommand = (command: string): Effect.Effect<void, Cause.UnknownException, never> =>
        options.sudo === "ask"
            ? Effect.try(() => sudoPrompt.exec(`${command}`, { name: "The-WireGuard-Effect" }))
            : Effect.tryPromise(() => {
                  const subprocess = execa.execaCommand(
                      `${options.sudo === true && process.platform !== "win32" ? "sudo " : ""}${command}`,
                      {
                          stdio: "ignore",
                          cleanup: !command.includes("wireguard-go"),
                          detached: command.includes("wireguard-go"),
                      }
                  );
                  if (command.includes("wireguard-go")) subprocess.unref();
                  return subprocess;
              });

    const up: WireguardControlImpl["up"] = (wireguardConfig, wireguardInterface) =>
        Effect.gen(function* (λ) {
            const path = yield* λ(Path.Path);
            const fs = yield* λ(FileSystem.FileSystem);
            const tempDirectory = yield* λ(fs.makeTempDirectory());
            const file = path.join(tempDirectory, `${wireguardInterface.Name}.conf`);
            yield* λ(wireguardConfig.writeToFile(file));

            const wgQuickCommandWin = `wireguard.exe /installtunnelservice ${file}`;
            const wgQuickCommandNix = `wg-quick up ${file}`;
            const wgQuickCommand = process.platform === "win32" ? wgQuickCommandWin : wgQuickCommandNix;
            const wireguardGoCommand = `wireguard-go ${wireguardInterface.Name}`;

            yield* λ(execCommand(wireguardGoCommand));
            yield* λ(
                Effect.request(
                    new WireguardConfig.WireguardSetConfigRequest({ config: wireguardConfig, wireguardInterface }),
                    WireguardConfig.WireguardSetConfigResolver
                )
            );
            yield* λ(execCommand(wgQuickCommand));
        });

    const down: WireguardControlImpl["down"] = (wireguardConfig, wireguardInterface) =>
        Effect.gen(function* (λ) {
            const path = yield* λ(Path.Path);
            const fs = yield* λ(FileSystem.FileSystem);
            const tempDirectory = yield* λ(fs.makeTempDirectory());
            const file = path.join(tempDirectory, `${wireguardInterface.Name}.conf`);
            yield* λ(wireguardConfig.writeToFile(file));

            const wgQuickCommandWin = `wireguard.exe /uninstalltunnelservice ${file}`;
            const wgQuickCommandNix = `wg-quick down ${file}`;
            const wgQuickCommand = process.platform === "win32" ? wgQuickCommandWin : wgQuickCommandNix;
            yield* λ(execCommand(wgQuickCommand));
        });

    const upScoped: WireguardControlImpl["upScoped"] = (wireguardConfig, wireguardInterface) =>
        Effect.acquireRelease(up(wireguardConfig, wireguardInterface), () =>
            down(wireguardConfig, wireguardInterface).pipe(Effect.orDie)
        );

    return WireguardControl.of({
        up,
        down,
        upScoped,
        getConfig: WireguardConfig.WireguardGetConfigResolver,
        setConfig: WireguardConfig.WireguardSetConfigResolver,
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

/**
 * @since 1.0.0
 * @category Layers
 */
export const SystemWgQuickLayer = Layer.sync(WireguardControl, () => makeSystemWgQuickLayer({ sudo: true }));
