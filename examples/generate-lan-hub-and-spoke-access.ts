import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as Schema from "@effect/schema/Schema";
import * as Effect from "effect/Effect";
import * as Tuple from "effect/Tuple";

import * as InternetSchemas from "the-wireguard-effect/InternetSchemas";
import * as WireguardGenerate from "the-wireguard-effect/WireguardGenerate";

const program = Effect.gen(function* () {
    const wireguardNetworkCidr = yield* Schema.decode(InternetSchemas.IPv4CidrBlockFromString)("1.1.1.1/24");
    const lanNetworkCidr = yield* Schema.decode(InternetSchemas.IPv4CidrBlockFromString)("192.168.2.1/24");

    const server = yield* Schema.decode(InternetSchemas.HostnameIPv4SetupData)(
        Tuple.make("server.wireguard.com:51820", "1.1.1.1")
    );
    const client1 = yield* Schema.decode(InternetSchemas.IPv4)("1.1.1.2");
    const client2 = yield* Schema.decode(InternetSchemas.IPv4)("1.1.1.3");
    const client3 = yield* Schema.decode(InternetSchemas.IPv4)("1.1.1.4");
    const network = WireguardGenerate.generateLanHubAndSpokeAccess({
        nodes: [server, client1, client2, client3] as const,
        wireguardNetworkCidr,
        lanNetworkCidr,
        enableDirectCommunication: false,
    });

    const configs = yield* WireguardGenerate.toConfigs(network);
    for (const config of configs) {
        yield* config.writeToFile(`./examples/${config.Address.address.ip}.conf`);
    }
});

Effect.suspend(() => program)
    .pipe(Effect.provide(NodeContext.layer))
    .pipe(NodeRuntime.runMain);
