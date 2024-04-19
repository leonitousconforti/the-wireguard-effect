import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Scope from "effect/Scope";

import * as WireguardConfig from "./WireguardConfig.js";
import * as WireguardInterface from "./WireguardInterface.js";

/**
 * @since 1.0.0
 * @category Models
 */
export interface WireguardControlImpl {
    readonly up: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<void, never, never>;

    readonly upScoped: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<void, never, Scope.Scope>;

    readonly down: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<void, never, never>;

    readonly getConfig: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<void, never, never>;

    readonly setConfig: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<void, never, never>;
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
export const makeUserspaceLayer = (): WireguardControlImpl => WireguardControl.of({} as any);

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeWgQuickLayer = (_options: { sudo: boolean | "ask" }): WireguardControlImpl =>
    WireguardControl.of({} as any);

/**
 * @since 1.0.0
 * @category Constructors
 */
export const UserspaceLayer = Layer.sync(WireguardControl)(makeUserspaceLayer);

/**
 * @since 1.0.0
 * @category Constructors
 */
export const WgQuickLayer = Layer.sync(WireguardControl)(() => makeWgQuickLayer({ sudo: true }));
