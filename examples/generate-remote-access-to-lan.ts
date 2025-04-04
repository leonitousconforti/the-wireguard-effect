/**
 * The example demonstrates how to generate a collection of wireguard
 * configurations for a network with one server and one client. The client will
 * be able to access the server, resources directly on the server, as well as
 * the specified lan(s) of the server.
 *
 * Inputs are provided as arguments to the program function (because this
 * example is used in the unit tests and e2e tests as well) and this example can
 * be ran with:
 *
 *      tsx examples/generate-remote-access-to-lan.ts
 */

import type * as ParseResult from "effect/ParseResult";
import type * as WireguardConfig from "the-wireguard-effect/WireguardConfig";
import type * as WireguardErrors from "the-wireguard-effect/WireguardErrors";

import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeRuntime from "@effect/platform-node/NodeRuntime";
import * as Array from "effect/Array";
import * as Chunk from "effect/Chunk";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Schema from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Tuple from "effect/Tuple";
import * as esmMain from "es-main";
import * as assert from "node:assert";

import * as InternetSchemas from "the-wireguard-effect/InternetSchemas";
import * as WireguardGenerate from "the-wireguard-effect/WireguardGenerate";

export const program = (
    /** The network cidr block that the wireguard network will use. */
    wireguardNetworkCidr: InternetSchemas.IPv4CidrBlockFromStringEncoded = "10.0.0.1/24" as const,

    /** The network cidr block of the lan on the server that you want to expose. */
    lanNetworkCidr: InternetSchemas.IPv4CidrBlockFromStringEncoded = "192.168.1.1/24" as const,

    /** Server's public address */
    serverAddress: `${string}:${number}` | `${string}:${number}:${number}` = "server.wireguard.com:51820" as const
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
        const decodeSetupData = Schema.decode(
            Schema.Union(InternetSchemas.IPv4SetupData, InternetSchemas.HostnameIPv4SetupData)
        );

        /** Decode the CIDR blocks */
        const lanNetworkCidrDecoded = yield* decodeCidr(lanNetworkCidr);
        const wireguardNetworkCidrDecoded = yield* decodeCidr(wireguardNetworkCidr);

        /**
         * W'ell grab three IPs from the wireguard network to use for the
         * server's address and the first two clients. W'ell define a third
         * client manually to show you how that can be done
         */
        const [serverWireguardNetworkAddress, ...clientAddresses] = yield* Function.pipe(
            wireguardNetworkCidrDecoded.range,
            Stream.drop(1),
            Stream.take(2),
            Stream.runCollect,
            Effect.map(Chunk.toReadonlyArray),
            Effect.map(Array.map(({ ip }) => ip))
        );

        assert.ok(serverWireguardNetworkAddress !== undefined);
        assert.ok(clientAddresses[0] !== undefined);

        /**
         * The server needs to be SetupData, which is a combination of a
         * hostname or IPv4 or IPv6 endpoint (public address on the internet)
         * and the address of the node in the network.
         */
        const serverSetupData = yield* decodeSetupData(Tuple.make(serverAddress, serverWireguardNetworkAddress));

        /**
         * Since clients are expected to be roaming, they only need an address
         * in the network. Here is how you could define a client manually
         * instead of pulling IPs from the cidr block, just make sure this ip is
         * not one that would have been assigned to another client.
         */
        const clientAddress = yield* decodeAddress(clientAddresses[0]);

        // Generate the network
        const network = WireguardGenerate.generateRemoteAccessToLan({
            lanNetworkCidr: lanNetworkCidrDecoded,
            wireguardNetworkCidr: wireguardNetworkCidrDecoded,
            nodes: [serverSetupData, clientAddress] as const,
        });

        // Generate the configs
        return yield* WireguardGenerate.toConfigs(network);
    });

Effect.suspend(() => program())
    .pipe(Effect.andThen(Console.log))
    .pipe(Effect.provide(NodeContext.layer))
    .pipe(esmMain.default(import.meta) ? NodeRuntime.runMain : Function.identity);
