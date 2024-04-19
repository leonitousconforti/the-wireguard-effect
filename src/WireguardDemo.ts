/**
 * Utilities for connecting to the Wireguard demo server at demo.wireguard.com
 *
 * @since 1.0.0
 */

import * as SocketServerNode from "@effect/experimental/SocketServer/Node";
import * as NodeSocket from "@effect/platform-node/NodeSocket";
import * as HttpClient from "@effect/platform/HttpClient";
import * as Socket from "@effect/platform/Socket";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Option from "effect/Option";
import * as Queue from "effect/Queue";
import * as Schedule from "effect/Schedule";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as Tuple from "effect/Tuple";

import * as InternetSchemas from "./InternetSchemas.js";
import * as WireguardConfig from "./WireguardConfig.js";
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
        Stream.make(`${publicKey}\n`),
        Stream.concat(Stream.never),
        Stream.pipeThroughChannelOrFail(NodeSocket.makeNetChannel(connectOptions)),
        Stream.decodeText(),
        Stream.run(Sink.head()),
        Effect.map(Option.getOrUndefined),
        Effect.andThen(Schema.decodeUnknown(WireguardDemoSchema)),
        Effect.andThen((serverResponse) =>
            Schema.decode(WireguardConfig.WireguardConfig)({
                Dns: "1.1.1.1",
                PrivateKey: privateKey,
                Address: `${serverResponse.yourWireguardAddress.ip}/24`,
                ListenPort: 0,
                Peers: [
                    {
                        PublicKey: serverResponse.serverPublicKey,
                        Endpoint: `${connectOptions.host}:${serverResponse.serverPort}`,
                        AllowedIPs: ["0.0.0.0/0"],
                        PersistentKeepalive: 25,
                    },
                ],
            })
        )
    );

/**
 * Mock implementation of the Wireguard demo server at demo.wireguard.com
 *
 * @since 1.0.0
 * @see https://git.zx2c4.com/wireguard-tools/plain/contrib/ncat-client-server/server.sh
 */
export const WireguardDemoServer = (options: {
    serverPort: number;
    wireguardPort: number;
    wireguardNetwork: `${string}/${number}`;
}) =>
    Effect.gen(function* (λ) {
        const serverPort = yield* λ(Schema.decode(InternetSchemas.Port)(options.serverPort));
        const wireguardPort = yield* λ(Schema.decode(InternetSchemas.Port)(options.wireguardPort));
        const wireguardNetwork = yield* λ(Schema.decode(InternetSchemas.CidrBlockFromString)(options.wireguardNetwork));
        const wireguardNetworkIps = yield* λ(Queue.bounded<InternetSchemas.Address>(Number(wireguardNetwork.total)));

        // const serverWireguardInterface = yield* λ(WireguardInterface.WireguardInterface.getNextAvailableInterface);
        const serverWireguardKeys = WireguardKey.generateKeyPair();
        // const serverWireguardConfig = yield* λ(
        //     Schema.decode(WireguardConfig.WireguardConfig)({
        //         ListenPort: wireguardPort,
        //         Address: options.wireguardNetwork,
        //         PrivateKey: serverWireguardKeys.privateKey,
        //     })
        // );

        const server = yield* λ(SocketServerNode.make({ port: serverPort }));

        const handler = server.run((socket) =>
            Effect.gen(function* (λ) {
                const requests = yield* λ(Queue.unbounded<WireguardKey.WireguardKey>());
                const responses = yield* λ(Queue.unbounded<WireguardDemoSchemaEncoded>());

                yield* λ(
                    Stream.fromQueue(responses),
                    Stream.pipeThroughChannel(Socket.toChannel(socket)),
                    Stream.decodeText(),
                    Stream.mapEffect(Schema.decode(WireguardKey.WireguardKey)),
                    Stream.runForEach((req) => requests.offer(req)),
                    Effect.ensuring(Effect.all([requests.shutdown, responses.shutdown])),
                    Effect.fork
                );

                yield* λ(
                    Stream.fromQueue(requests),
                    Stream.mapEffect((request) =>
                        Schema.decode(WireguardPeer.WireguardPeer)({
                            PublicKey: request,
                            PersistentKeepalive: 25,
                            AllowedIPs: ["0.0.0.0/0"],
                        } as any)
                    ),
                    Stream.mapEffect((peer) =>
                        Function.pipe(
                            wireguardNetworkIps,
                            Queue.take,
                            Effect.map((ip) => ({
                                yourWireguardAddress: ip,
                                serverPort: wireguardPort,
                                serverPublicKey: serverWireguardKeys.publicKey,
                            })),
                            Effect.flatMap(Schema.encode(WireguardDemoSchema)),
                            Effect.map((response) => Tuple.make(peer, response))
                        )
                    ),
                    Stream.runForEach(([peer, response]) =>
                        Effect.gen(function* (λ) {
                            yield* λ(responses.offer(response));
                            yield* λ(Console.log(peer));
                        })
                    ),
                    Effect.ensuring(Effect.all([requests.shutdown, responses.shutdown])),
                    Effect.forkScoped,
                    Effect.interruptible
                );
            })
        );

        yield* λ(handler);
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
    Effect.gen(function* (λ) {
        const defaultClient = yield* λ(HttpClient.client.Client);
        const client = defaultClient.pipe(HttpClient.client.filterStatusOk);
        const request = HttpClient.request.get(hiddenPageLocation);
        return yield* λ(client(request).pipe(HttpClient.response.text, Effect.timeout("3 seconds")));
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
> = Effect.gen(function* (λ) {
    const defaultClient = yield* λ(HttpClient.client.Client);
    const client = defaultClient.pipe(HttpClient.client.filterStatusOk);
    const request = HttpClient.request.get("https://www.google.com");
    return yield* λ(client(request).pipe(HttpClient.response.text, Effect.timeout("3 seconds")));
}).pipe(Effect.retry(retryPolicy));
