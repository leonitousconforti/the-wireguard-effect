import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Scope from "effect/Scope";
import * as execa from "execa";
import * as WireguardApi from "./api.js";
import * as WireguardSchemas from "./schema.js";

export * from "./schema.js";

/**
 * Acquires a wireguard-go child process and applies the given configuration to
 * the interface, can fail with any generic wireguard error.
 *
 * @internal
 */
export const acquire = (
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

/**
 * Releases the wireguard-go child process by sending a SIGTERM signal.
 *
 * @internal
 */
export const release = (subprocess: execa.ExecaChildProcess): Effect.Effect<void> => Effect.sync(subprocess.kill);

/**
 * Runs the given wireguard interface configuration in a scoped environment;
 * acquiring a wireguard-go subprocess and applying the configuration then
 * releasing the subprocess when the scope is closed. If a interfaceName is not
 * provided, one will be chosen according to the operating system rules starting
 * at wg0.
 */
export const runScoped = (
    config: WireguardSchemas.WireguardInterface,
    interfaceName: string | undefined = "wg0"
): Effect.Effect<void, WireguardSchemas.WireguardError | Cause.TimeoutException, Scope.Scope> =>
    Effect.acquireRelease(acquire(interfaceName, config), release);
