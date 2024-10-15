/**
 * Utilities for connecting to the Wireguard demo server at demo.wireguard.com
 *
 * @since 1.0.0
 */

import * as SocketServer from "@effect/experimental/SocketServer";
import * as NodeHttpServer from "@effect/platform-node/NodeHttpServer";
import * as NodeSocket from "@effect/platform-node/NodeSocket";
import * as CommandExecutor from "@effect/platform/CommandExecutor";
import * as PlatformError from "@effect/platform/Error";
import * as FileSystem from "@effect/platform/FileSystem";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientError from "@effect/platform/HttpClientError";
import * as HttpClientRequest from "@effect/platform/HttpClientRequest";
import * as HttpServer from "@effect/platform/HttpServer";
import * as HttpServerResponse from "@effect/platform/HttpServerResponse";
import * as Path from "@effect/platform/Path";
import * as Socket from "@effect/platform/Socket";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Array from "effect/Array";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Layer from "effect/Layer";
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
import * as http from "node:http";

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
        catch: (_error) => new Socket.SocketGenericError({ cause: `Could not lookup ${host}`, reason: "Open" }),
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
        Effect.andThen(Schema.decodeUnknown(WireguardDemoServerSchema)),
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
                        AllowedIPs: new Set(["192.168.4.1/24"]),
                        PublicKey: serverResponse.serverPublicKey,
                        Endpoint: `${serverResponse.dnsLookup}:${serverResponse.serverPort}`,
                    },
                ],
            })
        )
    );

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
        const wireguardControl = yield* WireguardControl.WireguardControl;

        const serverWireguardKeys = WireguardKey.generateKeyPair();
        const wireguardNetwork = yield* Schema.decode(InternetSchemas.CidrBlockFromString)(options.wireguardNetwork);

        // Setup the wireguard peer address pool
        const serverWireguardAddressPool = yield* Queue.dropping<InternetSchemas.Address>(
            Math.min(options?.maxPeers || 256, Number(wireguardNetwork.total))
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

        yield* server.run(requestHandler);
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
): Effect.Effect<string, HttpClientError.HttpClientError | Cause.TimeoutException, HttpClient.HttpClient> =>
    Effect.gen(function* () {
        const defaultClient = yield* HttpClient.HttpClient;
        const client = defaultClient.pipe(HttpClient.filterStatusOk);
        const request = HttpClientRequest.get(hiddenPageLocation);
        const response = yield* client.execute(request);
        return yield* response.text;
    })
        .pipe(Effect.timeout("7 seconds"))
        .pipe(Effect.scoped)
        .pipe(Effect.retry(retryPolicy));

/**
 * Attempts to connect to https://www.google.com to ensure that dns is still
 * working and we can connect to the internet when the wireguard tunnel is up.
 *
 * @since 1.0.0
 */
export const requestGoogle: Effect.Effect<
    void,
    HttpClientError.HttpClientError | Cause.TimeoutException,
    HttpClient.HttpClient
> = Effect.gen(function* () {
    const defaultClient = yield* HttpClient.HttpClient;
    const client = defaultClient.pipe(HttpClient.filterStatusOk);
    const request = HttpClientRequest.get("https://www.google.com");
    const response = yield* client.execute(request);
    yield* response.text;
})
    .pipe(Effect.timeout("7 seconds"))
    .pipe(Effect.scoped)
    .pipe(Effect.retry(retryPolicy));
