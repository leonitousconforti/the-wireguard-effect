import { describe, it } from "@effect/vitest";

import * as PlatformNode from "@effect/platform-node";
import * as Schema from "@effect/schema/Schema";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as Tuple from "effect/Tuple";

import * as InternetSchemas from "the-wireguard-effect/InternetSchemas";
import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";

describe("WireguardConfig", () => {
    it.effect("should generate p2p configs", () =>
        Effect.gen(function* (λ) {
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

            yield* λ(
                WireguardConfig.WireguardConfig.generateP2PConfigs({
                    aliceData: aliceSetupData,
                    bobData: bobSetupData,
                })
            );

            // const [aliceConfig, bobConfig] = yield* λ(
            //     WireguardConfig.WireguardConfig.generateP2PConfigs({
            //         aliceData: aliceSetupData,
            //         bobData: bobSetupData,
            //     })
            // );

            // yield* λ(aliceConfig.writeToFile("alice.conf"));
            // yield* λ(bobConfig.writeToFile("bob.conf"));

            // const aliceConfig2 = yield* λ(WireguardConfig.WireguardConfig.fromConfigFile("alice.conf"));
            // const bobConfig2 = yield* λ(WireguardConfig.WireguardConfig.fromConfigFile("bob.conf"));

            // yield* λ(Console.log(aliceConfig2));
            // yield* λ(Console.log(bobConfig2));
        })
    );

    it.effect("advanced config generation", () =>
        Effect.gen(function* (λ) {
            // Alice will be the hub
            const aliceSetupData = Tuple.make("10.0.1.1:51820" as const, "1.1.1.1");

            // Bob, Charlie, Dave, and Eve will be spokes
            const bobSetupData = Tuple.make("10.0.2.1:51820" as const, "2.2.2.2");
            const charlieSetupData = Tuple.make("10.0.3.1:51820" as const, "3.3.3.3");
            const daveSetupData = Tuple.make("10.0.4.1:51820" as const, "4.4.4.4");
            const eveSetupData = Tuple.make("10.0.5.1:51820" as const, "5.5.5.5");
            const spokesSetupData = [bobSetupData, charlieSetupData, daveSetupData, eveSetupData] as const;

            // Bob will trust charlie and dave
            const bobTrustsCharlieAndDave = [bobSetupData, [charlieSetupData, daveSetupData]] as const;

            // Eve will trust bob and charlie
            const eveTrustsBobAndCharlie = [eveSetupData, [bobSetupData, charlieSetupData]] as const;

            yield* λ(
                WireguardConfig.WireguardConfig.generate({
                    hubData: aliceSetupData,
                    spokeData: spokesSetupData,
                    preshareKeys: "generate",
                    trustMap: HashMap.make(bobTrustsCharlieAndDave, eveTrustsBobAndCharlie),
                })
            );

            // const aliceConfig = hubConfig;
            // const [bobConfig, charlieConfig, daveConfig, eveConfig] = spokeConfigs;

            // yield* λ(aliceConfig.writeToFile("alice.conf"));
            // yield* λ(bobConfig.writeToFile("bob.conf"));
            // yield* λ(charlieConfig.writeToFile("charlie.conf"));
            // yield* λ(daveConfig.writeToFile("dave.conf"));
            // yield* λ(eveConfig.writeToFile("eve.conf"));
        }).pipe(Effect.provide(PlatformNode.NodeContext.layer))
    );
});
