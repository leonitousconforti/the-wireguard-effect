import * as Platform from "@effect/platform";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as execa from "execa";
import * as WireguardApi from "./api.js";
import * as WireguardSchemas from "./schema.js";

/**
 * Acquires a foreground wireguard-go child process and applies the given
 * configuration to the interface.
 *
 * @since 1.0.0
 * @category Resource
 */
export const acquireForeground = (
    interfaceName: string,
    config: WireguardSchemas.WireguardInterfaceConfig
): Effect.Effect<execa.ExecaChildProcess, WireguardSchemas.WireguardError | Cause.TimeoutException, never> =>
    Effect.gen(function* (λ: Effect.Adapter) {
        const subprocess: execa.ExecaChildProcess = yield* λ(
            Effect.sync(() => execa.execaCommand(`wireguard-go --foreground ${interfaceName}`))
        );
        yield* λ(WireguardApi.applyConfig(interfaceName, config));
        return subprocess;
    });

/**
 * Acquires a background wireguard-go child process and applies the given
 * configuration to the interface. This child process will persist even after
 * the nodejs process dies.
 *
 * @since 1.0.0
 * @category Resource
 */
export const acquireBackground = (
    interfaceName: string,
    config: WireguardSchemas.WireguardInterfaceConfig
): Effect.Effect<void, WireguardSchemas.WireguardError | Cause.TimeoutException, never> =>
    Effect.gen(function* (λ: Effect.Adapter) {
        yield* λ(Effect.sync(() => execa.execaCommandSync(`wireguard-go ${interfaceName}`)));
        yield* λ(WireguardApi.applyConfig(interfaceName, config));
    });

/**
 * Releases the foreground wireguard-go child process by sending a SIGTERM
 * signal to the process.
 *
 * @since 1.0.0
 * @category Resource
 */
export const releaseForeground = (subprocess: execa.ExecaChildProcess): Effect.Effect<void> =>
    Effect.sync(subprocess.kill);

/**
 * Releases the background wireguard-go child process by deleting the
 * wireguard-go socket file.
 *
 * @since 1.0.0
 * @category Resource
 */
export const releaseBackground = (
    interfaceName: string
): Effect.Effect<
    void,
    WireguardSchemas.WireguardError | Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem
> =>
    Effect.gen(function* (λ) {
        const fs = yield* λ(Platform.FileSystem.FileSystem);
        const path = yield* λ(WireguardApi.socketLocationForPlatform(interfaceName));
        yield* λ(fs.remove(path));
    });
