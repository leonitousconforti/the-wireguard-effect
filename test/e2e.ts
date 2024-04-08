/** https://git.zx2c4.com/wireguard-tools/plain/contrib/ncat-client-server/client.sh */

import { describe, expect, it } from "@effect/vitest";

import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeSocket from "@effect/platform-node/NodeSocket";
import * as HttpClient from "@effect/platform/HttpClient";
import * as Schema from "@effect/schema/Schema";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Option from "effect/Option";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";

import * as InternetSchemas from "the-wireguard-effect/InternetSchemas";
import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as WireguardKey from "the-wireguard-effect/WireguardKey";

const WireguardDemoSchema = Schema.transform(
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
);

const WireguardDemoConfig = ({ publicKey, privateKey } = WireguardKey.generateKeyPair()) =>
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

describe("wireguard e2e test using demo.wireguard.com", () => {
    it.effect("Should be able to connect to the demo server", () =>
        Effect.gen(function* (λ) {
            const config = yield* λ(WireguardDemoConfig());
            const remotePeer = yield* λ(
                Function.pipe(
                    config.Address.range,
                    Stream.drop(1),
                    Stream.runHead,
                    Effect.map(Option.getOrThrow),
                    Effect.map((address) => address.ip)
                )
            );
            yield* λ(config.writeToFile("wg0.conf"));
            yield* λ(config.up({ how: "system-wireguard+system-wg-quick", sudo: true }));

            const hiddenPageUrl = new URL(`http://${remotePeer}`);
            const hiddenPage = yield* λ(
                HttpClient.request.get(hiddenPageUrl).pipe(HttpClient.client.fetchOk(), HttpClient.response.text)
            );
            expect(hiddenPage).toMatchSnapshot();
        }).pipe(Effect.provide(NodeContext.layer))
    );
});
