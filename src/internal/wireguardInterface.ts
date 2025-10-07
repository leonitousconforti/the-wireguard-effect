import type * as Socket from "@effect/platform/Socket";
import type * as ParseResult from "effect/ParseResult";
import type * as WireguardInterface from "../WireguardInterface.ts";

import * as NodeSocket from "@effect/platform-node/NodeSocket";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as String from "effect/String";
import * as WireguardErrors from "../WireguardErrors.ts";

/** @internal */
export const SupportedArchitectures = ["x64", "arm64"] as const;

/** @internal */
export type SupportedArchitecture = (typeof SupportedArchitectures)[number];

/** @internal */
export const SupportedPlatforms = ["linux", "darwin", "win32"] as const;

/** @internal */
export type SupportedPlatform = (typeof SupportedPlatforms)[number];

/** @internal */
export const LinuxInterfaceNameRegExp: RegExp = /^wg\d+$/;

/** @internal */
export const DarwinInterfaceNameRegExp: RegExp = /^utun\d+$/;

/** @internal */
export const WindowsInterfaceNameRegExp: RegExp = /^eth\d+$/;

/** @internal */
export const userspaceContact = (
    wireguardInterface: WireguardInterface.WireguardInterface,
    content: string
): Effect.Effect<string, Socket.SocketError | ParseResult.ParseError, never> =>
    Function.pipe(
        Stream.make(content),
        Stream.pipeThroughChannelOrFail(
            NodeSocket.makeNetChannel({
                path: wireguardInterface.SocketLocation,
            })
        ),
        Stream.decodeText(),
        Stream.flatMap(Function.compose(String.linesIterator, Stream.fromIterable)),
        Stream.map(String.trimEnd),
        Stream.filter(String.isNonEmpty),
        Stream.run(Sink.collectAll()),
        Effect.tap(Function.flow(Chunk.last, Option.getOrThrow, Schema.decodeUnknown(WireguardErrors.SuccessErrno))),
        Effect.map(Chunk.join("\n"))
    );
