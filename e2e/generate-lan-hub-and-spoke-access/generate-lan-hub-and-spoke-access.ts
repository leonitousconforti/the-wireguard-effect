import * as PlatformNode from "@effect/platform-node";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Config from "effect/Config";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Queue from "effect/Queue";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as Tuple from "effect/Tuple";

import * as InternetSchemas from "the-wireguard-effect/InternetSchemas";
import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as WireguardErrors from "the-wireguard-effect/WireguardErrors";

const MAX_PEERS = Function.pipe(Config.integer("MAX_PEERS"), Config.withDefault(32));

Effect.gen(function* () {
    /** The maximum number of peers that this server will support. */
    const max_peers = yield* MAX_PEERS;

    /** First thing we need is an address pool for this wireguard network. */
    const addressPoolCidrString = "10.253.0.0/24" as const;
    const addressPool = yield* Schema.decode(InternetSchemas.CidrBlockFromString)(addressPoolCidrString);

    /**
     * This will take care of generating an ip address for each peer that is
     * within the address pool supplied above. If you know how many peers you
     * will have and want to hardcode peer address in TS or you have some other
     * way of generating ip addresses that are inside your address then you
     * don't need this.
     */
    const ips = yield* Queue.dropping<InternetSchemas.Address>(Math.min(max_peers, Number(addressPool.total)));

    /**
     * This will populate the ips queue with the addresses from the pool. We
     * drop the first two address because the first one, the network address,
     * 10.253.0.0 is unusable and the second address, 10.253.0.0 will be the
     * address of the wireguard server which is reserved for Dave.
     */
    yield* Function.pipe(addressPool.range, Stream.drop(2), Stream.run(Sink.fromQueue(ips)));

    /**
     * We know these peers will exists in the network, so we can declare their
     * addresses here. We also know that Charlie will exist in the network, but
     * lets pretend like we don't know that right now so we can see how to
     * dynamically add peers to this type of network later.
     */
    const alicePeerAddress = yield* Queue.take(ips); // "10.254.0.2" as const
    const bobPeerAddress = yield* Queue.take(ips); // "10.254.0.3" as const
});

const daveSetupData = Tuple.make("10.0.4.1:51820" as const, "4.4.4.4");
const eveSetupData = Tuple.make("10.0.5.1:51820" as const, "5.5.5.5");
const nodesSetupData = [aliceSetupData, bobSetupData, charlieSetupData, daveSetupData, eveSetupData] as const;

const program: Effect.Effect<void, ParseResult.ParseError | WireguardErrors.WireguardError, never> = Effect.gen(
    function* (λ) {
        const [hubConfig, spokeConfigs] = yield* λ(WireguardConfig.generateStarConfigs({ nodes: nodesSetupData }));

        // Distribute these configs somehow
        yield* λ(Console.log(hubConfig));
        yield* λ(Console.log(spokeConfigs));
    }
);

Effect.suspend(() => program).pipe(Effect.provide(PlatformNode.NodeContext.layer), PlatformNode.NodeRuntime.runMain);
