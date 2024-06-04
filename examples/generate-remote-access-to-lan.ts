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
    const client = yield* Schema.decode(InternetSchemas.IPv4)("1.1.1.2");
    const network = WireguardGenerate.generateRemoteAccessToLan({
        nodes: [server, client] as const,
        wireguardNetworkCidr,
        lanNetworkCidr,
    });
    const [clientConfig, serverConfig] = yield* WireguardGenerate.toConfigs(network);
    yield* clientConfig.writeToFile("./examples/client.conf");
    yield* serverConfig.writeToFile("./examples/server.conf");
});

Effect.suspend(() => program)
    .pipe(Effect.provide(NodeContext.layer))
    .pipe(NodeRuntime.runMain);
