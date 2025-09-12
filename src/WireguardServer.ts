/**
 * Utilities for connecting to the Wireguard demo server at demo.wireguard.com
 *
 * @since 1.0.0
 */

import type * as CommandExecutor from "@effect/platform/CommandExecutor";
import type * as PlatformError from "@effect/platform/Error";
import type * as FileSystem from "@effect/platform/FileSystem";
import type * as Path from "@effect/platform/Path";
import type * as Cause from "effect/Cause";
import type * as ParseResult from "effect/ParseResult";
import type * as Scope from "effect/Scope";
import type * as WireguardControl from "./WireguardControl.js";
import type * as WireguardErrors from "./WireguardErrors.js";

import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer";
import * as NodeSocket from "@effect/platform-node/NodeSocket";
import * as HttpServer from "@effect/platform/HttpServer";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Socket from "@effect/platform/Socket";
import * as SocketServer from "@effect/platform/SocketServer";
import * as Array from "effect/Array";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Layer from "effect/Layer";
import * as HashMap from "effect/MutableHashMap";
import * as Option from "effect/Option";
import * as Queue from "effect/Queue";
import * as Schema from "effect/Schema";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as String from "effect/String";
import * as Tuple from "effect/Tuple";
import * as dns from "node:dns";
import * as http from "node:http";
import * as InternetSchemas from "./InternetSchemas.js";
import * as WireguardConfig from "./WireguardConfig.js";
import * as WireguardInterface from "./WireguardInterface.js";
import * as WireguardKey from "./WireguardKey.js";
import * as WireguardPeer from "./WireguardPeer.js";

import * as internalInternetSchemas from "./internal/internetSchemas.js";

/**
 * @since 1.0.0
 * @category Unbranded types
 */
export type WireguardDemoServerSchema = Schema.Schema.Type<typeof WireguardDemoServerSchema>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type WireguardDemoServerSchemaEncoded = Schema.Schema.Encoded<typeof WireguardDemoServerSchema>;

/**
 * @since 1.0.0
 * @category Schema
 */
export const WireguardDemoServerSchema = Schema.transform(
    Schema.TemplateLiteral(
        Schema.Literal("OK"),
        Schema.Literal(":"),
        Schema.String,
        Schema.Literal(":"),
        Schema.Number,
        Schema.Literal(":"),
        Schema.String,
        Schema.Literal("\n")
    ),
    Schema.Struct({
        serverPort: InternetSchemas.Port,
        serverPublicKey: WireguardKey.WireguardKey,
        yourWireguardAddress: InternetSchemas.Address,
    }),
    {
        decode: (input) => {
            const [_status, key, port, address] = internalInternetSchemas.splitLiteral(input, ":");
            return {
                serverPublicKey: key,
                serverPort: Number.parseInt(port),
                yourWireguardAddress: address.slice(0, -1),
            };
        },
        encode: ({ serverPort, serverPublicKey, yourWireguardAddress }) =>
            `OK:${serverPublicKey}:${serverPort}:${yourWireguardAddress}\n` as const,
    }
).annotations({
    identifier: "WireguardDemoSchema",
    description: "Wireguard demo server response",
});

/**
 * Attempts a DNS lookup of the given host (needed because wireguard will not
 * perform dns lookups).
 *
 * @internal
 */
const dnsLookup = (host: string): Effect.Effect<string, Socket.SocketGenericError, never> =>
    Effect.async<string, Socket.SocketGenericError>((resume) => {
        dns.lookup(host, (err, address, _family) => {
            if (err) {
                const error = new Socket.SocketGenericError({ cause: `Could not lookup ${host}`, reason: "Open" });
                return resume(Effect.fail(error));
            } else {
                return resume(Effect.succeed(address));
            }
        });
    });

/**
 * Creates a Wireguard configuration to connect to demo.wireguard.com. When
 * connected, you should be able to see the hidden page at 192.168.4.1
 *
 * @since 1.0.0
 * @see https://git.zx2c4.com/wireguard-tools/plain/contrib/ncat-client-server/client.sh
 */
export const requestWireguardDemoConfig = (
    connectOptions = { port: 42912, host: "demo.wireguard.com" },
    { privateKey, publicKey } = WireguardKey.generateKeyPair()
): Effect.Effect<WireguardConfig.WireguardConfig, Socket.SocketError | ParseResult.ParseError, never> =>
    Function.pipe(
        // Connect to the server and send our public key
        Stream.make(`${publicKey}\n`),
        Stream.concat(Stream.never),
        Stream.pipeThroughChannelOrFail(NodeSocket.makeNetChannel(connectOptions)),

        // Decode the server's response
        Stream.decodeText(),
        Stream.run(Sink.head()),
        Effect.map(Option.getOrUndefined),
        Effect.flatMap(Schema.decodeUnknown(WireguardDemoServerSchema)),

        // Create the wireguard configuration
        Effect.andThen((serverResponse) =>
            Effect.gen(function* () {
                // TODO: Is this a safe assumption?
                const netmask = "/24" as const;
                const host = yield* dnsLookup(connectOptions.host);
                const address = `${serverResponse.yourWireguardAddress.ip}${netmask}` as const;
                const cidr = yield* Schema.decode(InternetSchemas.CidrBlockFromString)(address);
                const networkAddress = yield* cidr.networkAddress();
                const allowedIps = new Set([`${networkAddress.ip}${netmask}`] as const);
                return yield* Schema.decode(WireguardConfig.WireguardConfig)({
                    ListenPort: 0,
                    Dns: "1.1.1.1",
                    Address: address,
                    PrivateKey: privateKey,
                    Peers: [
                        {
                            AllowedIPs: allowedIps,
                            PersistentKeepalive: 25,
                            PublicKey: serverResponse.serverPublicKey,
                            Endpoint: `${host}:${serverResponse.serverPort}`,
                        },
                    ],
                });
            })
        )
    );

/** @internal */
const hiddenPageContent = `<title>WireGuard Demo Configuration: Success!</title>
<body bgcolor="#444444">
<script src="snowstorm.js"></script>
<script src="trail.js"></script>
<center>
<blink>
<marquee width="100%" behavior="alternate" direction="right" scrollamount="10">
<marquee height="100%" behavior="alternate" direction="down">
<marquee width="100%" bgcolor="#33aadd" direction="right" behavior="alternate"><font face="comic sans ms" size="7" style="font-size: 3vw" color="#ddaa33">Congrats! You've successfully configured WireGuard!</font><br><marquee scrollamount="30"><img src="emblem.svg" width="20%"></marquee><br><marquee direction="left" scrollamount="40" behavior="alternate"><script>document.write('<iframe frameborder="0" height="80%" width="70%" src="/?' + (((document.location.search.substring(1)|0) + 1) % 4) + '"></iframe>');</script></marquee><br><br></marquee>
</marquee>
</marquee>
</blink>
</center>
</body>
`;

/**
 * Mock implementation of the Wireguard demo server at demo.wireguard.com
 *
 * @since 1.0.0
 * @see https://git.zx2c4.com/wireguard-tools/plain/contrib/ncat-client-server/server.sh
 */
export const WireguardDemoServer = (options: {
    maxPeers?: number | undefined;
    serverEndpoint: InternetSchemas.Endpoint;
    wireguardNetwork: InternetSchemas.CidrBlockFromStringEncoded;
}): Effect.Effect<
    void,
    | Socket.SocketError
    | ParseResult.ParseError
    | Cause.TimeoutException
    | WireguardErrors.WireguardError
    | PlatformError.PlatformError
    | SocketServer.SocketServerError,
    | Scope.Scope
    | FileSystem.FileSystem
    | Path.Path
    | SocketServer.SocketServer
    | WireguardControl.WireguardControl
    | CommandExecutor.CommandExecutor
> =>
    Effect.gen(function* () {
        const server = yield* SocketServer.SocketServer;

        // Generate the server's wireguard keys and network
        const serverWireguardKeys = WireguardKey.generateKeyPair();
        const wireguardNetwork = yield* Schema.decode(InternetSchemas.CidrBlockFromString)(options.wireguardNetwork);
        const networkSize = yield* wireguardNetwork.total;

        // Setup the wireguard peer address pool
        const serverWireguardAddressPool = yield* Queue.dropping<InternetSchemas.Address>(
            Math.min(options?.maxPeers || 256, Number(networkSize))
        );
        yield* Function.pipe(
            wireguardNetwork.range as Stream.Stream<InternetSchemas.Address, ParseResult.ParseError, never>,
            Stream.drop(2),
            Stream.run(Sink.fromQueue(serverWireguardAddressPool))
        );
        const addressReservationLookup = HashMap.empty<WireguardKey.WireguardKey, InternetSchemas.Address>();

        // Setup the wireguard interface and wireguard server config
        const serverWireguardInterface = yield* WireguardInterface.WireguardInterface.getNextAvailableInterface;
        const serverWireguardConfig = yield* Schema.decode(WireguardConfig.WireguardConfig)({
            Address: options.wireguardNetwork,
            PrivateKey: serverWireguardKeys.privateKey,
            ListenPort: options.serverEndpoint.listenPort,
        });
        yield* serverWireguardInterface.upScoped(serverWireguardConfig);

        const requestHandler = (socket: Socket.Socket) =>
            Effect.gen(function* () {
                const responses = yield* Queue.unbounded<WireguardDemoServerSchemaEncoded>();

                yield* Stream.fromQueue(responses).pipe(
                    Stream.pipeThroughChannel(Socket.toChannel(socket)),
                    Stream.decodeText(),
                    Stream.map(String.replace("\n", "")),
                    Stream.mapEffect(Schema.decode(WireguardKey.WireguardKey)),
                    Stream.mapEffect((request) =>
                        Schema.decode(WireguardPeer.WireguardPeer)({
                            PublicKey: request,
                            PersistentKeepalive: 25,
                            AllowedIPs: new Set(["0.0.0.0/0"]),
                        })
                    ),
                    // Prune the oldest peer if we run out of addresses in the queue
                    Stream.mapEffect((peer) =>
                        Effect.gen(function* () {
                            const size = yield* Queue.size(serverWireguardAddressPool);
                            if (size > 0) return peer;

                            const config = yield* serverWireguardInterface.getConfig(options.wireguardNetwork);

                            const lastPeer = Function.pipe(
                                config.Peers,
                                Array.sort(
                                    (
                                        a: Schema.Schema.Type<(typeof WireguardPeer.WireguardPeer)["uapi"]>,
                                        b: Schema.Schema.Type<(typeof WireguardPeer.WireguardPeer)["uapi"]>
                                    ) => {
                                        const aLastHandshake = DateTime.toEpochMillis(a.lastHandshake);
                                        const bLastHandshake = DateTime.toEpochMillis(b.lastHandshake);
                                        if (aLastHandshake < bLastHandshake) return -1;
                                        else if (aLastHandshake > bLastHandshake) return 1;
                                        else return 0;
                                    }
                                ),
                                Array.head,
                                Option.getOrThrow
                            );

                            yield* serverWireguardInterface.removePeer(lastPeer);
                            const freedAddress = HashMap.get(addressReservationLookup, lastPeer.PublicKey).pipe(
                                Option.getOrThrow
                            );
                            yield* Queue.offer(serverWireguardAddressPool, freedAddress);
                            HashMap.remove(addressReservationLookup, lastPeer.PublicKey);
                            return peer;
                        })
                    ),
                    Stream.mapEffect((peer) =>
                        Function.pipe(
                            serverWireguardAddressPool,
                            Queue.take,
                            Effect.map((ip) => ({
                                yourWireguardAddress: ip,
                                serverPort: options.serverEndpoint.natPort,
                                serverPublicKey: serverWireguardKeys.publicKey,
                            })),
                            Effect.map((response) => Tuple.make(peer, response))
                        )
                    ),
                    Stream.runForEach(([peer, res]) =>
                        Effect.gen(function* () {
                            const encoded = yield* Schema.encode(WireguardDemoServerSchema)(res);
                            yield* responses.offer(encoded);
                            HashMap.set(addressReservationLookup, peer.PublicKey, res.yourWireguardAddress);
                            yield* serverWireguardInterface.addPeer(peer);
                        })
                    )
                );
            });

        // Start the server
        Layer.launch(HttpServer.serve(Effect.succeed(HttpServerResponse.html(hiddenPageContent))))
            .pipe(
                Effect.provide(
                    NodeHttpServer.layer(() => http.createServer(), {
                        port: 8080,
                        host: "192.168.4.1",
                    })
                )
            )
            .pipe(Effect.runFork);

        return yield* server.run(requestHandler);
    });
