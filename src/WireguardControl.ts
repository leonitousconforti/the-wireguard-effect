/**
 * Wireguard control mechanisms.
 *
 * @since 1.0.0
 */

import * as NodeSocket from "@effect/platform-node/NodeSocket";
import * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as Socket from "@effect/platform/Socket";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as sudoPrompt from "@vscode/sudo-prompt";
import * as Array from "effect/Array";
import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Request from "effect/Request";
import * as Resolver from "effect/RequestResolver";
import * as Scope from "effect/Scope";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as String from "effect/String";
import * as execa from "execa";
import * as ini from "ini";

import { arch } from "os";
import * as InternetSchemas from "./InternetSchemas.js";
import * as WireguardConfig from "./WireguardConfig.js";
import * as WireguardErrors from "./WireguardErrors.js";
import * as WireguardInterface from "./WireguardInterface.js";
import * as WireguardPeer from "./WireguardPeer.js";

/**
 * @since 1.0.0
 * @category Responses
 * @see https://www.wireguard.com/xplatform/
 */
export class WireguardGetConfigResponse extends WireguardConfig.WireguardConfig.extend<WireguardGetConfigResponse>(
    "WireguardGetConfigResponse"
)({
    Peers: Schema.optional(Schema.Array(WireguardPeer.WireguardGetPeerResponse), { default: () => [], nullable: true }),
}) {}

/**
 * @since 1.0.0
 * @category Requests
 */
export class WireguardGetConfigRequest extends Request.TaggedClass("WireguardGetConfigRequest")<
    WireguardConfig.WireguardConfig,
    ParseResult.ParseError | Socket.SocketError,
    {
        readonly address: InternetSchemas.CidrBlockFromStringEncoded;
        readonly wireguardInterface: WireguardInterface.WireguardInterface;
    }
> {}

/**
 * @since 1.0.0
 * @category Requests
 */
export class WireguardSetConfigRequest extends Request.TaggedClass("WireguardSetConfigRequest")<
    void,
    ParseResult.ParseError | Socket.SocketError,
    {
        readonly config: WireguardConfig.WireguardConfig;
        readonly wireguardInterface: WireguardInterface.WireguardInterface;
        readonly peerRequestMapper?: (peer: WireguardPeer.WireguardPeer) =>
            | {
                  readonly remove?: boolean | undefined;
                  readonly updateOnly?: boolean | undefined;
                  readonly replaceAllowedIps?: boolean | undefined;
              }
            | undefined;
    }
> {}

/**
 * @since 1.0.0
 * @category Resolvers
 */
export const WireguardGetConfigResolver: Resolver.RequestResolver<WireguardGetConfigRequest, never> =
    Resolver.fromEffect<never, WireguardGetConfigRequest>(({ address, wireguardInterface }) =>
        Effect.gen(function* (λ) {
            const get = Function.pipe(
                Stream.make("get=1\n\n"),
                Stream.encodeText,
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
                Effect.tap(
                    Function.flow(Chunk.last, Option.getOrThrow, Schema.decodeUnknown(WireguardErrors.SuccessErrno))
                ),
                Effect.map(Chunk.join("\n"))
            );

            const uapiConfig = yield* λ(get);
            const [interfaceConfig, ...peers] = uapiConfig.split("public_key=");
            const { fwmark, listen_port, private_key } = ini.decode(interfaceConfig);

            const peerConfigs = yield* λ(
                Function.pipe(
                    peers,
                    Array.map((peer) => new WireguardPeer.WireguardGetPeerRequest({ input: peer })),
                    Array.map(Effect.request(WireguardPeer.WireguardGetPeerResolver)),
                    Array.map(Effect.flatMap(Schema.encode(WireguardPeer.WireguardGetPeerResponse))),
                    Effect.allWith()
                )
            );

            return yield* λ(
                Schema.decode(WireguardGetConfigResponse)({
                    Address: address,
                    FirewallMark: fwmark,
                    ListenPort: listen_port,
                    PrivateKey: Buffer.from(private_key, "hex").toString("base64"),
                    Peers: peerConfigs,
                })
            );
        })
    );

/**
 * @since 1.0.0
 * @category Resolvers
 */
export const WireguardSetConfigResolver: Resolver.RequestResolver<WireguardSetConfigRequest, never> =
    Resolver.fromEffect<never, WireguardSetConfigRequest>(({ config, peerRequestMapper, wireguardInterface }) =>
        Effect.gen(function* (λ) {
            const fwmark = `fwmark=${config.FirewallMark}\n` as const;
            const listenPort = `listen_port=${config.ListenPort}\n` as const;
            const privateKeyHex = Buffer.from(config.PrivateKey, "base64").toString("hex");
            const privateKey = `private_key=${privateKeyHex}\n` as const;

            const peers = yield* λ(
                Function.pipe(
                    config.Peers,
                    Array.map((peer) => ({ peer, ...(peerRequestMapper?.(peer) ?? {}) })),
                    Array.map((peerRequestOptions) => new WireguardPeer.WireguardSetPeerRequest(peerRequestOptions)),
                    Array.map(Effect.request(WireguardPeer.WireguardSetPeerResolver)),
                    Effect.allWith(),
                    Effect.map(Array.join("\n"))
                )
            );

            const uapiConfig = `${fwmark}${listenPort}${privateKey}${peers}\n` as const;
            const set = Function.pipe(
                Stream.make(`set=1\n\n${uapiConfig}`),
                Stream.encodeText,
                Stream.pipeThroughChannelOrFail(
                    NodeSocket.makeNetChannel({
                        path: wireguardInterface.SocketLocation,
                    })
                ),
                Stream.decodeText(),
                Stream.run(Sink.last()),
                Effect.map(Option.getOrThrow),
                Effect.map(String.trimEnd),
                Effect.andThen(Schema.decodeUnknown(WireguardErrors.SuccessErrno))
            );

            return yield* λ(set);
        })
    );

/**
 * @since 1.0.0
 * @category Models
 */
export interface WireguardControlImpl {
    readonly up: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<
        void,
        Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException,
        FileSystem.FileSystem | Path.Path
    >;

    readonly down: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<
        void,
        PlatformError.PlatformError | ParseResult.ParseError | Cause.UnknownException,
        FileSystem.FileSystem | Path.Path
    >;

    readonly upScoped: (
        wireguardConfig: WireguardConfig.WireguardConfig,
        wireguardInterface: WireguardInterface.WireguardInterface
    ) => Effect.Effect<
        void,
        Socket.SocketError | ParseResult.ParseError | PlatformError.PlatformError | Cause.UnknownException,
        FileSystem.FileSystem | Path.Path | Scope.Scope
    >;

    readonly getConfig: Resolver.RequestResolver<WireguardGetConfigRequest, never>;
    readonly setConfig: Resolver.RequestResolver<WireguardSetConfigRequest, never>;
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
export const makeUserspaceLayer = (): WireguardControlImpl => {
    const up: WireguardControlImpl["up"] = (wireguardConfig, wireguardInterface) =>
        Effect.request(
            new WireguardSetConfigRequest({ config: wireguardConfig, wireguardInterface }),
            WireguardSetConfigResolver
        );

    const down: WireguardControlImpl["down"] = (_wireguardConfig, wireguardInterface) =>
        Effect.flatMap(FileSystem.FileSystem, (fs) => fs.remove(wireguardInterface.SocketLocation));

    const upScoped: WireguardControlImpl["upScoped"] = (wireguardConfig, wireguardInterface) =>
        Effect.acquireRelease(up(wireguardConfig, wireguardInterface), () =>
            down(wireguardConfig, wireguardInterface).pipe(Effect.orDie)
        );

    return WireguardControl.of({
        up,
        down,
        upScoped,
        getConfig: WireguardGetConfigResolver,
        setConfig: WireguardSetConfigResolver,
    });
};

/**
 * @since 1.0.0
 * @category Constructors
 */
export const makeWgQuickLayer = (options: { sudo: boolean | "ask" }): WireguardControlImpl => {
    const execCommand = (command: string): Effect.Effect<void, Cause.UnknownException, never> =>
        options.sudo === "ask"
            ? Effect.try(() => sudoPrompt.exec(`${command}`, { name: "The-WireGuard-Effect" }))
            : Effect.tryPromise(() => {
                  const subprocess = execa.execaCommand(
                      `${options.sudo === true && process.platform !== "win32" ? "sudo " : ""}${command}`,
                      {
                          stdio: "ignore",
                          cleanup: !command.includes("wireguard-go"),
                          detached: command.includes("wireguard-go"),
                      }
                  );
                  if (command.includes("wireguard-go")) subprocess.unref();
                  return subprocess;
              });

    const up: WireguardControlImpl["up"] = (wireguardConfig, wireguardInterface) =>
        Effect.gen(function* (λ) {
            const path = yield* λ(Path.Path);
            const fs = yield* λ(FileSystem.FileSystem);
            const tempDirectory = yield* λ(fs.makeTempDirectory());
            const file = path.join(tempDirectory, `${wireguardInterface.Name}.conf`);
            yield* λ(wireguardConfig.writeToFile(file));

            const arch = process.arch === "x64" ? "amd64" : process.arch;
            const wireguardGoUrl = new URL(`./${process.platform}-${arch}-wireguard-go`, import.meta.url);
            const bundledWireguardGoExecutablePath = yield* λ(path.fromFileUrl(wireguardGoUrl));
            yield* λ(fs.access(bundledWireguardGoExecutablePath, { ok: true }));

            const wgQuickUrl = new URL(`./${process.platform}-wg-quick`, import.meta.url);
            const bundledWgQuickExecutablePath = yield* λ(path.fromFileUrl(wgQuickUrl));
            if (process.platform !== "win32") yield* λ(fs.access(bundledWgQuickExecutablePath, { ok: true }));

            const wgWindowsUrl = new URL(`./win32-${arch}-wireguard.exe`, import.meta.url);
            const bundledWgWindowsExecutablePath = yield* λ(path.fromFileUrl(wgWindowsUrl));
            if (process.platform === "win32") yield* λ(fs.access(bundledWgWindowsExecutablePath, { ok: true }));

            const wgQuickCommandWin = `${bundledWgWindowsExecutablePath} /installtunnelservice ${file}`;
            const wgQuickCommandNix = `${bundledWgQuickExecutablePath} up ${file}`;
            const wgQuickCommand = process.platform === "win32" ? wgQuickCommandWin : wgQuickCommandNix;
            const wireguardGoCommand = `${bundledWireguardGoExecutablePath} ${wireguardInterface.Name}`;

            yield* λ(execCommand(wireguardGoCommand));
            yield* λ(
                Effect.request(
                    new WireguardSetConfigRequest({ config: wireguardConfig, wireguardInterface }),
                    WireguardSetConfigResolver
                )
            );
            yield* λ(execCommand(wgQuickCommand));
        });

    const down: WireguardControlImpl["down"] = (wireguardConfig, wireguardInterface) =>
        Effect.gen(function* (λ) {
            const path = yield* λ(Path.Path);
            const fs = yield* λ(FileSystem.FileSystem);
            const tempDirectory = yield* λ(fs.makeTempDirectory());
            const file = path.join(tempDirectory, `${wireguardInterface.Name}.conf`);
            yield* λ(wireguardConfig.writeToFile(file));

            const wgQuickUrl = new URL(`./${process.platform}-wg-quick`, import.meta.url);
            const bundledWgQuickExecutablePath = yield* λ(path.fromFileUrl(wgQuickUrl));
            if (process.platform !== "win32") yield* λ(fs.access(bundledWgQuickExecutablePath, { ok: true }));

            const wgWindowsUrl = new URL(`./win32-${arch}-wireguard.exe`, import.meta.url);
            const bundledWgWindowsExecutablePath = yield* λ(path.fromFileUrl(wgWindowsUrl));
            if (process.platform === "win32") yield* λ(fs.access(bundledWgWindowsExecutablePath, { ok: true }));

            const wgQuickCommandWin = `${bundledWgWindowsExecutablePath} /uninstalltunnelservice ${file}`;
            const wgQuickCommandNix = `${bundledWgQuickExecutablePath} down ${file}`;
            const wgQuickCommand = process.platform === "win32" ? wgQuickCommandWin : wgQuickCommandNix;
            yield* λ(execCommand(wgQuickCommand));
        });

    const upScoped: WireguardControlImpl["upScoped"] = (wireguardConfig, wireguardInterface) =>
        Effect.acquireRelease(up(wireguardConfig, wireguardInterface), () =>
            down(wireguardConfig, wireguardInterface).pipe(Effect.orDie)
        );

    return WireguardControl.of({
        up,
        down,
        upScoped,
        getConfig: WireguardGetConfigResolver,
        setConfig: WireguardSetConfigResolver,
    });
};

/**
 * @since 1.0.0
 * @category Layers
 */
export const UserspaceLayer = Layer.sync(WireguardControl, makeUserspaceLayer);

/**
 * @since 1.0.0
 * @category Layers
 */
export const WgQuickLayer = Layer.sync(WireguardControl, () => makeWgQuickLayer({ sudo: true }));
