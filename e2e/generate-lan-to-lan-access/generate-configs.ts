import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as Effect from "effect/Effect";

import * as GenerateExample from "../../examples/generate-lan-to-lan-access.js";

const server1LanNetworkCidr = "10.0.1.0/24" as const;
const server1Address = "10.0.0.2:51820:41820" as const;
const server2LanNetworkCidr = "10.0.2.0/24" as const;
const server2Address = "10.0.0.3:51820:41820" as const;
const wireguardNetworkCidr = "192.168.10.1/24" as const;

Effect.gen(function* () {
    const [configAlice, configBob] = yield* GenerateExample.program(
        wireguardNetworkCidr,
        server1LanNetworkCidr,
        server2LanNetworkCidr,
        server1Address,
        server2Address
    );
    yield* configBob.writeToFile("B-bob-wireguard.conf");
    yield* configAlice.writeToFile("A-alice-wireguard.conf");
})
    .pipe(Effect.provide(NodeContext.layer))
    .pipe(NodeRuntime.runMain);
