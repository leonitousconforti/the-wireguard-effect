/**
 * Utilities for connecting to the Wireguard demo server at demo.wireguard.com
 *
 * @since 1.0.0
 */

import * as SocketServer from "@effect/experimental/SocketServer";
import * as NodeSocket from "@effect/platform-node/NodeSocket";
import * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as HttpClient from "@effect/platform/HttpClient";
import * as Path from "@effect/platform/Path";
import * as Socket from "@effect/platform/Socket";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Array from "effect/Array";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as HashMap from "effect/MutableHashMap";
import * as Option from "effect/Option";
import * as Queue from "effect/Queue";
import * as Schedule from "effect/Schedule";
import * as Scope from "effect/Scope";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as String from "effect/String";
import * as Tuple from "effect/Tuple";
import * as dns from "node:dns";

import * as InternetSchemas from "./InternetSchemas.js";
import * as WireguardConfig from "./WireguardConfig.js";
import * as WireguardControl from "./WireguardControl.js";
import * as WireguardErrors from "./WireguardErrors.js";
import * as WireguardInterface from "./WireguardInterface.js";
import * as WireguardKey from "./WireguardKey.js";
import * as WireguardPeer from "./WireguardPeer.js";

/**
 * @since 1.0.0
 * @category Unbranded types
 */
export type WireguardDemoSchema = Schema.Schema.Type<typeof WireguardDemoSchema>;

/**
 * @since 1.0.0
 * @category Encoded types
 */
export type WireguardDemoSchemaEncoded = Schema.Schema.Encoded<typeof WireguardDemoSchema>;

/**
 * @since 1.0.0
 * @category Schema
 */
export const WireguardDemoSchema = Schema.transform(
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
        yourWireguardAddress: InternetSchemas.AddressFromString,
    }),
    {
        decode: (input) => {
            const [_status, key, port, address] = InternetSchemas.splitLiteral(input, ":");
            return {
                serverPort: Number.parseInt(port),
                serverPublicKey: key,
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

/** @internal */
const dnsLookup = (host: string): Effect.Effect<string, Socket.SocketGenericError, never> =>
    Effect.tryPromise({
        try: () =>
            new Promise<string>((resolve, reject) => {
                dns.lookup(host, (err, address, _family) => {
                    if (err) reject(err);
                    resolve(address);
                });
            }),
        catch: (_error) => new Socket.SocketGenericError({ error: `Could not lookup ${host}`, reason: "Open" }),
    });

/**
 * Creates a Wireguard configuration to connect to demo.wireguard.com. When
 * connected, you should be able to see the hidden page at 192.168.4.1
 *
 * @since 1.0.0
 * @code
 *     import * as NodeContext from "@effect/platform-node/NodeContext";
 *     import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
 *     import * as Effect from "effect/Effect";
 *
 *     import * as WireguardControl from "the-wireguard-effect/WireguardControl";
 *     import * as WireguardDemo from "the-wireguard-effect/WireguardDemo";
 *
 *     Effect.gen(function* (λ) {
 *         const config = yield* λ(
 *             WireguardDemo.requestWireguardDemoConfig({
 *                 host: "localhost",
 *                 port: 42912,
 *             })
 *         );
 *         return yield* λ(config.up());
 *     })
 *         .pipe(Effect.scoped)
 *         .pipe(Effect.provide(NodeContext.layer))
 *         .pipe(Effect.provide(WireguardControl.BundledWgQuickLayer))
 *         .pipe(NodeRuntime.runMain);
 *
 * @see https://git.zx2c4.com/wireguard-tools/plain/contrib/ncat-client-server/client.sh
 */
export const requestWireguardDemoConfig = (
    connectOptions = { port: 42912, host: "demo.wireguard.com" },
    { privateKey, publicKey } = WireguardKey.generateKeyPair()
): Effect.Effect<WireguardConfig.WireguardConfig, Socket.SocketError | ParseResult.ParseError, never> =>
    Function.pipe(
        Stream.make(`${publicKey}\n`),
        Stream.concat(Stream.never),
        Stream.pipeThroughChannelOrFail(NodeSocket.makeNetChannel(connectOptions)),
        Stream.decodeText(),
        Stream.run(Sink.head()),
        Effect.map(Option.getOrUndefined),
        Effect.andThen(Schema.decodeUnknown(WireguardDemoSchema)),
        Effect.andThen((response) =>
            dnsLookup(connectOptions.host).pipe(Effect.map((x) => ({ dnsLookup: x, ...response })))
        ),
        Effect.andThen((serverResponse) =>
            Schema.decode(WireguardConfig.WireguardConfig)({
                Dns: "1.1.1.1",
                PrivateKey: privateKey,
                Address: `${serverResponse.yourWireguardAddress.ip}/24`,
                ListenPort: 0,
                Peers: [
                    {
                        PersistentKeepalive: 25,
                        AllowedIPs: new Set(["0.0.0.0/0"]),
                        PublicKey: serverResponse.serverPublicKey,
                        Endpoint: `${serverResponse.dnsLookup}:${serverResponse.serverPort}`,
                    },
                ],
            })
        )
    );

/**
 * Mock implementation of the Wireguard demo server at demo.wireguard.com
 *
 * @since 1.0.0
 * @code
 *     import * as SocketServerNode from "@effect/experimental/SocketServer/Node";
 *     import * as NodeContext from "@effect/platform-node/NodeContext";
 *     import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
 *     import * as Effect from "effect/Effect";
 *
 *     import * as WireguardControl from "the-wireguard-effect/WireguardControl";
 *     import * as WireguardDemo from "the-wireguard-effect/WireguardDemo";
 *
 *     Effect.suspend(() =>
 *         WireguardDemo.WireguardDemoServer({
 *             wireguardPort: 12912,
 *             wireguardNetwork: "192.168.5.1/24",
 *         })
 *     )
 *         .pipe(Effect.scoped)
 *         .pipe(Effect.provide(NodeContext.layer))
 *         .pipe(Effect.provide(WireguardControl.BundledWgQuickLayer))
 *         .pipe(Effect.provide(SocketServerNode.layer({ port: 42912 })))
 *         .pipe(NodeRuntime.runMain);
 *
 * @see https://git.zx2c4.com/wireguard-tools/plain/contrib/ncat-client-server/server.sh
 */
export const WireguardDemoServer = (options: {
    wireguardPort: number;
    wireguardNetwork: InternetSchemas.CidrBlockFromStringEncoded;
}): Effect.Effect<
    void,
    | Socket.SocketError
    | ParseResult.ParseError
    | Cause.UnknownException
    | WireguardErrors.WireguardError
    | PlatformError.PlatformError
    | SocketServer.SocketServerError,
    Scope.Scope | FileSystem.FileSystem | Path.Path | SocketServer.SocketServer | WireguardControl.WireguardControl
> =>
    Effect.gen(function* () {
        // Parse parameters
        const server = yield* SocketServer.SocketServer;
        const serverWireguardKeys = WireguardKey.generateKeyPair();
        const wireguardPort = yield* Schema.decode(InternetSchemas.Port)(options.wireguardPort);
        const wireguardNetwork = yield* Schema.decode(InternetSchemas.CidrBlockFromString)(options.wireguardNetwork);

        // Setup the wireguard peer address pool
        const serverWireguardAddressPool = yield* Queue.dropping<InternetSchemas.Address>(
            Math.min(256, Number(wireguardNetwork.total))
        );
        yield* Function.pipe(
            wireguardNetwork.range,
            Stream.drop(2),
            Stream.run(Sink.fromQueue(serverWireguardAddressPool))
        );
        const addressReservationLookup = HashMap.empty<WireguardKey.WireguardKey, InternetSchemas.Address>();

        // Setup the wireguard interface and wireguard server config
        const wireguardControl = yield* WireguardControl.WireguardControl;
        const serverWireguardInterface = yield* WireguardInterface.WireguardInterface.getNextAvailableInterface;
        const serverWireguardConfig = yield* Schema.decode(WireguardConfig.WireguardConfig)({
            ListenPort: wireguardPort,
            Address: options.wireguardNetwork,
            PrivateKey: serverWireguardKeys.privateKey,
        });
        yield* serverWireguardInterface.upScoped(serverWireguardConfig);

        // Start the server
        yield* Effect.logInfo(`Server waiting for requests....`);
        const socketHandler = server.run((socket) =>
            Effect.gen(function* () {
                const responses = yield* Queue.unbounded<WireguardDemoSchemaEncoded>();

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

                            const config = yield* Effect.request(
                                new WireguardConfig.WireguardGetConfigRequest({
                                    address: options.wireguardNetwork,
                                    wireguardInterface: serverWireguardInterface,
                                }),
                                wireguardControl.getConfigRequestResolver
                            );
                            const lastPeer = Function.pipe(
                                config.Peers,
                                Array.sort(
                                    (
                                        a: WireguardPeer.WireguardUApiGetPeerResponse,
                                        b: WireguardPeer.WireguardUApiGetPeerResponse
                                    ) => {
                                        if (a.lastHandshakeTimeSeconds - b.lastHandshakeTimeSeconds <= -1) return -1;
                                        else if (a.lastHandshakeTimeSeconds - b.lastHandshakeTimeSeconds >= 1) return 1;
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
                                serverPort: wireguardPort,
                                serverPublicKey: serverWireguardKeys.publicKey,
                            })),
                            Effect.map((response) => Tuple.make(peer, response))
                        )
                    ),
                    Stream.runForEach(([peer, res]) =>
                        Effect.gen(function* () {
                            const encoded = yield* Schema.encode(WireguardDemoSchema)(res);
                            yield* responses.offer(encoded);
                            HashMap.set(addressReservationLookup, peer.PublicKey, res.yourWireguardAddress);
                            yield* serverWireguardInterface.addPeer(peer);
                        })
                    )
                );
            })
        );

        yield* socketHandler;
    });

/** @internal */
export const retryPolicy = Schedule.recurs(4).pipe(Schedule.addDelay(() => "3 seconds"));

/**
 * Attempts to view the hidden page on the demo.wireguard.com server, you should
 * only be able to see it when connected as a peer.
 *
 * @since 1.0.0
 */
export const requestHiddenPage = (
    hiddenPageLocation: string
): Effect.Effect<string, HttpClient.error.HttpClientError | Cause.TimeoutException, HttpClient.client.Client.Default> =>
    Effect.gen(function* () {
        const defaultClient = yield* HttpClient.client.Client;
        const client = defaultClient.pipe(HttpClient.client.filterStatusOk);
        const request = HttpClient.request.get(hiddenPageLocation);
        return yield* client(request).pipe(HttpClient.response.text, Effect.timeout("3 seconds"));
    }).pipe(Effect.retry(retryPolicy));

/**
 * Attempts to connect to https://www.google.com to ensure that dns is still
 * working and we can connect to the internet when the wireguard tunnel is up.
 *
 * @since 1.0.0
 */
export const requestGoogle: Effect.Effect<
    void,
    HttpClient.error.HttpClientError | Cause.TimeoutException,
    HttpClient.client.Client.Default
> = Effect.gen(function* () {
    const defaultClient = yield* HttpClient.client.Client;
    const client = defaultClient.pipe(HttpClient.client.filterStatusOk);
    const request = HttpClient.request.get("https://www.google.com");
    return yield* client(request).pipe(HttpClient.response.text, Effect.timeout("3 seconds"));
}).pipe(Effect.retry(retryPolicy));
