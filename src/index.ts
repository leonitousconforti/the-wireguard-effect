import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Scope from "effect/Scope";

import * as WireguardResource from "./resource.js";
import * as WireguardSchemas from "./schema.js";

export * from "./schema.js";

export const up = (
    config: WireguardSchemas.WireguardInterface,
    interfaceName: string | undefined = "wg0"
): Effect.Effect<void, WireguardSchemas.WireguardError | Cause.TimeoutException, never> =>
    WireguardResource.acquireBackground(interfaceName, config);

export const down = (interfaceName: string | undefined = "wg0"): Effect.Effect<void> =>
    WireguardResource.releaseBackground(interfaceName);

/**
 * Runs the given wireguard interface configuration in a scoped environment;
 * acquiring a wireguard-go subprocess and applying the configuration then
 * releasing the subprocess when the scope is closed. If a interfaceName is not
 * provided, one will be chosen according to the operating system rules starting
 * at wg0.
 */
export const upScoped = (
    config: WireguardSchemas.WireguardInterface,
    interfaceName: string | undefined = "wg0"
): Effect.Effect<void, WireguardSchemas.WireguardError | Cause.TimeoutException, Scope.Scope> =>
    Effect.acquireRelease(
        WireguardResource.acquireForeground(interfaceName, config),
        WireguardResource.releaseForeground
    );
