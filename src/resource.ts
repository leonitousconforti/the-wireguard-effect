import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as execa from "execa";
import * as WireguardApi from "./api.js";
import * as WireguardSchemas from "./schema.js";

/**
 * Acquires a wireguard-go child process and applies the given configuration to
 * the interface, which can fail with any generic wireguard error.
 */
export const acquireForeground = (
    interfaceName: string,
    config: WireguardSchemas.WireguardInterface
): Effect.Effect<execa.ExecaChildProcess, WireguardSchemas.WireguardError | Cause.TimeoutException, never> =>
    Effect.gen(function* (λ: Effect.Adapter) {
        const subprocess: execa.ExecaChildProcess = yield* λ(
            Effect.sync(() => execa.execaCommand(`wireguard-go --foreground ${interfaceName}`))
        );
        yield* λ(WireguardApi.applyConfig(interfaceName, config));
        return subprocess;
    });

export const acquireBackground = (
    interfaceName: string,
    config: WireguardSchemas.WireguardInterface
): Effect.Effect<void, WireguardSchemas.WireguardError | Cause.TimeoutException, never> =>
    Effect.gen(function* (λ: Effect.Adapter) {
        yield* λ(Effect.sync(() => execa.execaCommandSync(`wireguard-go ${interfaceName}`)));
        yield* λ(WireguardApi.applyConfig(interfaceName, config));
    });

/**
 * Releases the foreground wireguard-go child process by sending a SIGTERM
 * signal.
 */
export const releaseForeground = (subprocess: execa.ExecaChildProcess): Effect.Effect<void> =>
    Effect.sync(subprocess.kill);

export const releaseBackground = (interfaceName: string): Effect.Effect<void> => Effect.unit;
