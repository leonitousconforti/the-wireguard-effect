import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Scope from "effect/Scope";
import * as execa from "execa";
import * as WireguardApi from "./api.js";
import * as WireguardSchemas from "./schema.js";

/**
 * Acquires a wireguard-go subprocess and applies the given configuration to the
 * interface, can fail with any generic wireguard error.
 */
const acquire = (
    interfaceName: string,
    config: WireguardSchemas.WireguardInterface
): Effect.Effect<execa.ExecaChildProcess, WireguardSchemas.WireguardError | Cause.TimeoutException, never> =>
    Effect.gen(function* (_: Effect.Adapter) {
        const subprocess: execa.ExecaChildProcess = yield* _(
            Effect.sync(() => execa.execaCommand(`wireguard-go --foreground ${interfaceName}`))
        );
        yield* _(WireguardApi.applyConfig(interfaceName, config));
        return subprocess;
    });

/** Releases the wireguard-go subprocess by sending a SIGTERM signal. */
const release = (subprocess: execa.ExecaChildProcess): Effect.Effect<void, never, never> =>
    Effect.sync(subprocess.kill);

/**
 * Runs the given wireguard interface configuration in a scoped environment;
 * acquiring a wireguard-go subprocess and applying the configuration then
 * releasing the subprocess when the scope is closed.
 */
export const runScoped = (
    interfaceName: string,
    config: WireguardSchemas.WireguardInterface
): Effect.Effect<void, WireguardSchemas.WireguardError | Cause.TimeoutException, Scope.Scope> =>
    Effect.acquireRelease(acquire(interfaceName, config), release);
