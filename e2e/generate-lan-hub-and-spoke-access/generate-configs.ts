import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as Effect from "effect/Effect";

import * as GenerateExample from "../../examples/generate-lan-hub-and-spoke-access.js";

const wireguardNetworkCidr = "192.168.10.1/24" as const;
const lanNetworkCidr = "10.0.4.0/24" as const;
const serverAddress = "10.0.5.5:51820:41820" as const;

Effect.gen(function* () {
    const [configD, configC, configA, configB, configE, configF] = yield* GenerateExample.program(
        wireguardNetworkCidr,
        lanNetworkCidr,
        serverAddress
    );

    yield* configD.writeToFile("D-dave.conf");
    yield* configC.writeToFile("C-charlie.conf");
    yield* configA!.writeToFile("A-alice.conf");
    yield* configB!.writeToFile("B-bob.conf");
    yield* configE!.writeToFile("D-eve.conf");
    yield* configF!.writeToFile("D-faye.conf");
})
    .pipe(Effect.provide(NodeContext.layer))
    .pipe(NodeRuntime.runMain);
