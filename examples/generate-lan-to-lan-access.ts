import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Array from "effect/Array";
import * as Chunk from "effect/Chunk";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Stream from "effect/Stream";
import * as Tuple from "effect/Tuple";
import * as esmMain from "es-main";

import * as InternetSchemas from "the-wireguard-effect/InternetSchemas";
import * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import * as WireguardErrors from "the-wireguard-effect/WireguardErrors";
import * as WireguardGenerate from "the-wireguard-effect/WireguardGenerate";

export const program = (
    /** The network cidr block that the wireguard network will use. */
    wireguardNetworkCidr: InternetSchemas.IPv4CidrBlockFromStringEncoded = "10.0.0.1/24" as const,

    /** The network cidr block of the lan on server1 that you want to expose. */
    lan1NetworkCidr: InternetSchemas.IPv4CidrBlockFromStringEncoded = "192.168.1.1/24" as const,

    /** The network cidr block of the lan on server2 that you want to expose. */
    lan2NetworkCidr: InternetSchemas.IPv4CidrBlockFromStringEncoded = "192.168.2.1/24" as const,

    /** Server 1's public address */
    server1Address = "server1.wireguard.com:51820" as const,

    /** Server 2's public address */
    server2Address = "server2.wireguard.com:51821" as const
): Effect.Effect<
    readonly [WireguardConfig.WireguardConfig, ...Array.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>],
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
> =>
    Effect.gen(function* () {
        /** This will be an IPv4 network, so we choose the IPv4 schemas */
        const decodeCidr = Schema.decode(InternetSchemas.IPv4CidrBlockFromString);
        const decodeSetupData = Schema.decode(InternetSchemas.HostnameIPv4SetupData);

        /** Decode the CIDR blocks */
        const lan1NetworkCidrDecoded = yield* decodeCidr(lan1NetworkCidr);
        const lan2NetworkCidrDecoded = yield* decodeCidr(lan2NetworkCidr);
        const wireguardNetworkCidrDecoded = yield* decodeCidr(wireguardNetworkCidr);

        /**
         * W'ell grab three IPs from the wireguard network to use for the
         * server's address and the first two clients. W'ell define a third
         * client manually to show you how that can be done
         */
        const [server1WireguardNetworkAddress, server2WireguardNetworkAddress] = yield* Function.pipe(
            wireguardNetworkCidrDecoded.range,
            Stream.drop(1),
            Stream.take(2),
            Stream.runCollect,
            Effect.map(Chunk.toReadonlyArray),
            Effect.map(Array.map(({ ip }) => ip))
        );

        /**
         * The server needs to be SetupData, which is a combination of a
         * hostname or IPv4 or IPv6 endpoint (public address on the internet)
         * and the address of the node in the network.
         */
        const server1SetupData = yield* decodeSetupData(Tuple.make(server1Address, server1WireguardNetworkAddress!));
        const server2SetupData = yield* decodeSetupData(Tuple.make(server2Address, server2WireguardNetworkAddress!));

        // Generate the network
        const network = WireguardGenerate.generateLanToLanAccess({
            server1Lan: lan1NetworkCidrDecoded,
            server2Lan: lan2NetworkCidrDecoded,
            wireguardNetworkCidr: wireguardNetworkCidrDecoded,
            nodes: [server1SetupData, server2SetupData] as const,
        });

        // Generate the configs
        return yield* WireguardGenerate.toConfigs(network);
    });

Effect.suspend(() => program())
    .pipe(Effect.andThen(Console.log))
    .pipe(Effect.provide(NodeContext.layer))
    .pipe(esmMain.default(import.meta) ? NodeRuntime.runMain : Function.identity);
