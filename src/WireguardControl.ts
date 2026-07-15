/**
 * Wireguard control mechanisms.
 *
 * @since 1.0.0
 */

import type * as Cause from "effect/Cause";
import type * as Context from "effect/Context";
import type * as Effect from "effect/Effect";
import type * as FileSystem from "effect/FileSystem";
import type * as Layer from "effect/Layer";
import type * as Path from "effect/Path";
import type * as PlatformError from "effect/PlatformError";
import type * as Schema from "effect/Schema";
import type * as Scope from "effect/Scope";
import type * as ChildProcessSpawner from "effect/unstable/process/ChildProcessSpawner";
import type * as Socket from "effect/unstable/socket/Socket";

import type * as WireguardConfig from "./WireguardConfig.ts";
import type * as WireguardInterface from "./WireguardInterface.ts";

import * as internal from "./internal/wireguardControl.ts";

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
        | Socket.SocketError
        | Schema.SchemaError
        | PlatformError.SystemError
        | PlatformError.BadArgument
        | PlatformError.PlatformError
        | Cause.TimeoutError,
        never
    >;

    readonly down: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface,
        wireguardGoProcess?: ChildProcessSpawner.ChildProcessHandle
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        | PlatformError.BadArgument
        | PlatformError.SystemError
        | PlatformError.PlatformError
        | Schema.SchemaError
        | Cause.TimeoutError,
        never
    >;

    readonly upScoped: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<
        WireguardInterface.WireguardInterface,
        | Socket.SocketError
        | Schema.SchemaError
        | PlatformError.SystemError
        | PlatformError.BadArgument
        | PlatformError.PlatformError
        | Cause.TimeoutError,
        Scope.Scope
    >;
}

/**
 * @since 1.0.0
 * @category Tags
 */
export const WireguardControl: Context.Service<WireguardControl, WireguardControl> = internal.WireguardControl;

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeBundledWgQuickLayer: (options: {
    sudo: boolean;
}) => Effect.Effect<
    WireguardControl,
    never,
    ChildProcessSpawner.ChildProcessSpawner | FileSystem.FileSystem | Path.Path
> = internal.makeBundledWgQuickLayer;

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeUserspaceLayer: Effect.Effect<WireguardControl, never, FileSystem.FileSystem> =
    internal.makeUserspaceLayer;

/**
 * @since 1.0.0
 * @category Layers
 */
export const UserspaceLayer: Layer.Layer<WireguardControl, never, FileSystem.FileSystem> = internal.UserspaceLayer;

/**
 * @since 1.0.0
 * @category Layers
 */
export const BundledWgQuickLayer: Layer.Layer<
    WireguardControl,
    never,
    ChildProcessSpawner.ChildProcessSpawner | FileSystem.FileSystem | Path.Path
> = internal.BundledWgQuickLayer;
