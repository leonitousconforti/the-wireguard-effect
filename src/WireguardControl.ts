/**
 * Wireguard control mechanisms.
 *
 * @since 1.0.0
 */

import * as CommandExecutor from "@effect/platform/CommandExecutor";
import * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Socket from "@effect/platform/Socket";
import * as Cause from "effect/Cause";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as ParseResult from "effect/ParseResult";
import * as Scope from "effect/Scope";
import * as exec from "node:child_process";

import * as internal from "./internal/wireguardControl.js";
import type * as WireguardConfig from "./WireguardConfig.js";
import type * as WireguardInterface from "./WireguardInterface.js";

/**
 * @since 1.0.0
 * @category Type ids
 */
export const TypeId: unique symbol = internal.TypeId;

/**
 * @since 1.0.0
 * @category Type ids
 */
export type TypeId = typeof TypeId;

/**
 * @since 1.0.0
 * @category Models
 */
export interface WireguardControl {
    readonly [TypeId]: TypeId;

    readonly up: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.TimeoutException,
        FileSystem.FileSystem | Path.Path | CommandExecutor.CommandExecutor
    >;

    readonly down: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface,
        wireguardGoProcess?: exec.ChildProcess
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        PlatformError.PlatformError | ParseResult.ParseError | Cause.TimeoutException,
        FileSystem.FileSystem | Path.Path | CommandExecutor.CommandExecutor
    >;

    readonly upScoped: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.TimeoutException,
        FileSystem.FileSystem | Path.Path | Scope.Scope | CommandExecutor.CommandExecutor
    >;
}

/**
 * @since 1.0.0
 * @category Tags
 */
export const WireguardControl: Context.Tag<WireguardControl, WireguardControl> = internal.WireguardControl;

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeBundledWgQuickLayer: (options: { sudo: boolean }) => WireguardControl =
    internal.makeBundledWgQuickLayer;

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeUserspaceLayer: () => WireguardControl = internal.makeUserspaceLayer;

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
