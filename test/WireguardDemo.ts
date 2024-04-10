/** https://git.zx2c4.com/wireguard-tools/plain/contrib/ncat-client-server/client.sh */

import * as NodeSocket from "@effect/platform-node/NodeSocket";
import * as HttpClient from "@effect/platform/HttpClient";
import * as Socket from "@effect/platform/Socket";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Option from "effect/Option";
import * as Schedule from "effect/Schedule";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";

import * as InternetSchemas from "the-wireguard-effect/InternetSchemas";
import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as WireguardKey from "the-wireguard-effect/WireguardKey";

export interface $WireguardDemoSchema
    extends Schema.Annotable<
        $WireguardDemoSchema,
        {
            readonly serverPort: InternetSchemas.PortBrand;
            readonly serverPublicKey: WireguardKey.WireguardKey;
            readonly internalAddress: InternetSchemas.Address;
        },
        `OK:${string}:${number}:${string}\n`,
        never
    > {}

export const WireguardDemoSchema: $WireguardDemoSchema = Schema.transform(
    Schema.templateLiteral(
        Schema.literal("OK"),
        Schema.literal(":"),
        Schema.string,
        Schema.literal(":"),
        Schema.number,
        Schema.literal(":"),
        Schema.string,
        Schema.literal("\n")
    ),
    Schema.struct({
        serverPort: InternetSchemas.Port,
        serverPublicKey: WireguardKey.WireguardKey,
        internalAddress: InternetSchemas.AddressFromString,
    }),
    (input) => {
        const [_status, key, port, address] = InternetSchemas.splitLiteral(input, ":");
        return { serverPort: Number.parseInt(port), serverPublicKey: key, internalAddress: address.slice(0, -1) };
    },
    ({ serverPort, serverPublicKey, internalAddress }) =>
        `OK:${serverPublicKey}:${serverPort}:${internalAddress}\n` as const
).annotations({
    identifier: "WireguardDemoSchema",
    description: "Wireguard demo server response",
});

/**
 * Creates a Wireguard configuration to connect to demo.wireguard.com. When
 * connected, you should be able to see the hidden page at 192.168.4.1
 */
export const createWireguardDemoConfig = (
    { publicKey, privateKey } = WireguardKey.generateKeyPair()
): Effect.Effect<WireguardConfig.WireguardConfig, Socket.SocketError | ParseResult.ParseError, never> =>
    Function.pipe(
        Stream.make(`${publicKey}\n`),
        Stream.concat(Stream.never),
        Stream.pipeThroughChannelOrFail(
            NodeSocket.makeNetChannel({
                port: 42912,
                host: "demo.wireguard.com",
            })
        ),
        Stream.decodeText(),
        Stream.run(Sink.head()),
        Effect.map(Option.getOrUndefined),
        Effect.flatMap(Schema.decodeUnknown(WireguardDemoSchema)),
        Effect.flatMap((serverResponse) =>
            Schema.decode(WireguardConfig.WireguardConfig)({
                PrivateKey: privateKey,
                Address: `${serverResponse.internalAddress.ip}/24`,
                ListenPort: 0,
                Peers: [
                    {
                        PublicKey: serverResponse.serverPublicKey,
                        Endpoint: `demo.wireguard.com:${serverResponse.serverPort}`,
                        AllowedIPs: ["0.0.0.0/0"],
                        PersistentKeepalive: 25,
                    },
                ],
            })
        )
    );

/**
 * Attempts to view the hidden page on the demo.wireguard.com server, you should
 * only be able to see it when connected as a peer.
 */
export const requestHiddenPage: Effect.Effect<string, HttpClient.error.HttpClientError, never> = HttpClient.request
    .get("http://192.168.4.1")
    .pipe(HttpClient.client.fetchOk())
    .pipe(HttpClient.response.text)
    .pipe(Effect.retry(Schedule.recurs(5).pipe(Schedule.addDelay(() => "5 seconds"))));
