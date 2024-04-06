import { describe, it } from "vitest";

import * as PlatformNode from "@effect/platform-node";
import * as Schema from "@effect/schema/Schema";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as Tuple from "effect/Tuple";

import * as InternetSchemas from "the-wireguard-effect/InternetSchemas";
import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";

describe("WireguardConfig", () => {
    it("should generate p2p configs", async () =>
        await Effect.gen(function* (λ) {
            const aliceEndpoint = "1.1.1.1:51820" as const;
            const bobEndpoint = "2.2.2.2:51820" as const;
            const networkCidr = "192.168.0.1/24" as const;

            const cidrBlock = yield* λ(Schema.decode(InternetSchemas.CidrBlockFromString)(networkCidr));
            const ips = yield* λ(
                Function.pipe(
                    cidrBlock.range,
                    Stream.map(({ ip }) => ip),
                    Stream.run(Sink.collectAllN(2)),
                    Effect.map(Chunk.toArray)
                )
            );

            const aliceSetupData = Tuple.make(aliceEndpoint, ips[0]);
            const bobSetupData = Tuple.make(bobEndpoint, ips[1]);

            const [aliceConfig, bobConfig] = yield* λ(
                WireguardConfig.WireguardConfig.generateP2PConfigs({
                    aliceData: aliceSetupData,
                    bobData: bobSetupData,
                })
            );

            yield* λ(aliceConfig.writeToFile("alice.conf"));
            yield* λ(bobConfig.writeToFile("bob.conf"));

            // const aliceConfig2 = yield* λ(WireguardConfig.WireguardConfig.fromConfigFile("alice.conf"));
            // const bobConfig2 = yield* λ(WireguardConfig.WireguardConfig.fromConfigFile("bob.conf"));
        })
            .pipe(Effect.provide(PlatformNode.NodeContext.layer))
            .pipe(Effect.runPromise));
});
