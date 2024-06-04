import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
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

    /** Server's public address */
    serverAddress = "server.wireguard.com:51820" as const
): Effect.Effect<
    readonly [
        WireguardConfig.WireguardConfig,
        WireguardConfig.WireguardConfig,
        ...ReadonlyArray<WireguardConfig.WireguardConfig>,
    ],
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
> =>
    Effect.gen(function* () {
        /** This will be an IPv4 network, so we choose the IPv4 schemas */
        const decodeAddress = Schema.decode(InternetSchemas.IPv4);
        const decodeCidr = Schema.decode(InternetSchemas.IPv4CidrBlockFromString);
        const decodeSetupData = Schema.decode(InternetSchemas.HostnameIPv4SetupData);

        /** Decode the CIDR blocks */
        const wireguardNetworkCidrDecoded = yield* decodeCidr(wireguardNetworkCidr);

        /**
         * W'ell grab three IPs from the wireguard network to use for the
         * server's address and the first two clients. W'ell define a third
         * client manually to show you how that can be done
         */
        const [serverWireguardNetworkAddress, ...clientAddresses] = yield* Function.pipe(
            wireguardNetworkCidrDecoded.range,
            Stream.drop(1),
            Stream.take(3),
            Stream.runCollect,
            Effect.map(Chunk.toReadonlyArray)
        );

        /**
         * The server needs to be SetupData, which is a combination of a
         * hostname or IPv4 or IPv6 endpoint (public address on the internet)
         * and the address of the node in the network.
         */
        const serverSetupData = yield* decodeSetupData(Tuple.make(serverAddress, serverWireguardNetworkAddress!.ip));

        /**
         * Since clients are expected to be roaming, they only need an address
         * in the network. Here is how you could define a client manually
         * instead of pulling IPs from the cidr block, just make sure this ip is
         * not one that would have been assigned to another client.
         */
        const client3 = yield* decodeAddress("10.0.0.100");

        // Generate the network
        const network = WireguardGenerate.generateServerHubAndSpokeAccess({
            wireguardNetworkCidr: wireguardNetworkCidrDecoded,
            nodes: [serverSetupData, client3, ...clientAddresses] as const,
        });

        // Generate the configs
        return yield* WireguardGenerate.toConfigs(network);
    });

Effect.suspend(() => program())
    .pipe(Effect.andThen(Console.log))
    .pipe(Effect.provide(NodeContext.layer))
    .pipe(esmMain.default(import.meta) ? NodeRuntime.runMain : Function.identity);
