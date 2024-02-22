import * as Effect from "effect/Effect";
import * as WireguardResource from "./resource.js";
import * as WireguardSchemas from "./schema.js";

export { WireguardError, WireguardInterfaceConfig, WireguardPeerConfig } from "./schema.js";

/**
 * Starts a wireguard tunnel in the background (daemon mode). This tunnel will
 * continue to run and serve traffic even after the nodejs process exits.
 *
 * @since 1.0.0
 * @category Wireguard
 */
export const up = (interfaceName: string, config: WireguardSchemas.WireguardInterfaceConfig) =>
    WireguardResource.acquireBackground(interfaceName, config);

/**
 * Stops a wireguard tunnel that was started in the background (daemon mode).
 * This can stop tunnels that are started in the foreground (child mode), but
 * that is not the intended use case. Instead you should use `upScoped`.
 *
 * @since 1.0.0
 * @category Wireguard
 */
export const down = (interfaceName: string) => WireguardResource.releaseBackground(interfaceName);

/**
 * Starts a wireguard tunnel in the foreground (child mode). This tunnel will be
 * gracefully shutdown once the scope is closed.
 *
 * @since 1.0.0
 * @category Wireguard
 */
export const upScoped = (interfaceName: string, config: WireguardSchemas.WireguardInterfaceConfig) =>
    Effect.acquireRelease(
        WireguardResource.acquireForeground(interfaceName, config),
        WireguardResource.releaseForeground
    );
