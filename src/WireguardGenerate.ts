/**
 * Wireguard Multi Dimensional Graphing Utils. The first layer is the nodes with
 * the direct connections between then and the second layer is the allowedIPs
 * for each node. The second layer must be isomorphic to the base layer, hence
 * why I am experimenting with multi-dimensional graphs. The third layer is the
 * possible paths packets could take between nodes taking into account the first
 * and second layers. This third layer can be extracted into a single layer
 * graph and the extracted graph will be contravariant to the multi layer
 * graph.
 *
 * @since 1.0.0
 * @see https://en.wikipedia.org/wiki/Multidimensional_network
 */

import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Array from "effect/Array";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Option from "effect/Option";
import * as Record from "effect/Record";
import * as Tuple from "effect/Tuple";

import * as InternetSchemas from "./InternetSchemas.js";
import * as WireguardConfig from "./WireguardConfig.js";
import * as WireguardErrors from "./WireguardErrors.js";
import * as WireguardKey from "./WireguardKey.js";

/** A node in the network can either have an ipv4 or ipv6 address. */
type WireguardIPv4Node = InternetSchemas.IPv4;
type WireguardIPv6Node = InternetSchemas.IPv6;

/**
 * A server in the network can either have an ipv4 address pool or ipv6 address
 * pool.
 */
type WireguardIPv4Server = InternetSchemas.IPv4SetupData;
type WireguardIPv6Server = InternetSchemas.IPv6SetupData;

/**
 * Every node in the network must have a public+private key pair and possibly a
 * preshare key as well.
 */
type Keys = {
    publicKey: WireguardKey.WireguardKey;
    privateKey: WireguardKey.WireguardKey;
    preshareKey?: WireguardKey.WireguardKey;
};

/**
 * The nodes in the network must be homogeneous (either all ipv4 or all ipv6).
 * If you want dual stack, you must have two separate networks.
 */
type WireguardNetworkNodes =
    | Array.NonEmptyReadonlyArray<(WireguardIPv4Server | WireguardIPv4Node) & Keys>
    | Array.NonEmptyReadonlyArray<(WireguardIPv6Server | WireguardIPv6Node) & Keys>;

/**
 * Nodes that have public facing addresses (server nodes) can be connected to
 * any other node, but nodes that are not servers can only connect to servers.
 */
type ConnectionLayer<Nodes extends WireguardNetworkNodes> = HashMap.HashMap<
    Extract<Nodes[number], WireguardIPv4Server | WireguardIPv6Server>,
    Array.NonEmptyReadonlyArray<Nodes[number]>
> &
    HashMap.HashMap<
        Extract<Nodes[number], WireguardIPv4Node | WireguardIPv6Node>,
        Array.NonEmptyReadonlyArray<Extract<Nodes[number], WireguardIPv4Server | WireguardIPv6Server>>
    >;

/** Allowed IPs for each node in the network. */
type FirewallLayer<Nodes extends WireguardNetworkNodes> = HashMap.HashMap<
    Nodes[number],
    Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
>;

/** The network is a combination of nodes, allowed IPs, and connections. */
type WireguardNetwork<Nodes extends WireguardNetworkNodes> = {
    nodes: Nodes;
    allowedIPs: FirewallLayer<Nodes>;
    connections: ConnectionLayer<Nodes>;
    cidr: InternetSchemas.IPv4CidrBlock | InternetSchemas.IPv6CidrBlock;
};

/** @internal */
export const toConfigs = <Nodes extends WireguardNetworkNodes>({
    allowedIPs,
    cidr,
    connections,
    nodes,
}: WireguardNetwork<Nodes>): Effect.Effect<
    Array.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
> => {
    const peerConfigsBySetupData = Function.pipe(
        nodes,
        Array.map(
            (node: (WireguardIPv4Server | WireguardIPv4Node | WireguardIPv6Node | WireguardIPv6Server) & Keys) => {
                const allowedIps = HashMap.unsafeGet(allowedIPs, node);

                const endpoint = Schema.is(InternetSchemas.IPv4SetupData)(node)
                    ? Tuple.getFirst(node)
                    : Schema.is(InternetSchemas.IPv6SetupData)(node)
                      ? Tuple.getFirst(node)
                      : undefined;

                const id = Schema.is(InternetSchemas.IPv4SetupData)(node)
                    ? Tuple.getSecond(node).ip
                    : Schema.is(InternetSchemas.IPv6SetupData)(node)
                      ? Tuple.getSecond(node).ip
                      : node.ip;

                return Tuple.make(id, {
                    PublicKey: node.publicKey,
                    PresharedKey: node.preshareKey,
                    AllowedIPs: new Set(allowedIps),
                    Endpoint: endpoint !== undefined ? { ...endpoint, ip: endpoint.address.ip } : undefined,
                });
            }
        ),
        Record.fromEntries
    );

    const findPeerConfigBySetupData = (
        node: WireguardIPv4Server | WireguardIPv4Node | WireguardIPv6Node | WireguardIPv6Server
    ) => {
        const id = Schema.is(InternetSchemas.IPv4SetupData)(node)
            ? Tuple.getSecond(node).ip
            : Schema.is(InternetSchemas.IPv6SetupData)(node)
              ? Tuple.getSecond(node).ip
              : node.ip;
        return Record.get(peerConfigsBySetupData, id).pipe(Option.getOrThrow);
    };

    return Function.pipe(
        nodes,
        Array.map((node: (WireguardIPv4Server | WireguardIPv4Node | WireguardIPv6Node | WireguardIPv6Server) & Keys) =>
            Effect.gen(function* () {
                const address = Schema.is(InternetSchemas.IPv4SetupData)(node)
                    ? Tuple.getSecond(node)
                    : Schema.is(InternetSchemas.IPv6SetupData)(node)
                      ? Tuple.getSecond(node)
                      : node;

                const listenPort = Schema.is(InternetSchemas.IPv4SetupData)(node)
                    ? Tuple.getFirst(node).listenPort
                    : Schema.is(InternetSchemas.IPv6SetupData)(node)
                      ? Tuple.getFirst(node).listenPort
                      : 0;

                const directConnections = Function.pipe(
                    connections,
                    HashMap.get(node),
                    Option.map(Array.map(findPeerConfigBySetupData)),
                    Option.getOrElse(() => [])
                );

                return yield* Schema.decode(WireguardConfig.WireguardConfig)({
                    Address: `${address}/${cidr.mask}`,
                    ListenPort: listenPort,
                    Peers: directConnections,
                    PrivateKey: node.privateKey,
                });
            })
        ),
        (_) =>
            _ as Array.NonEmptyReadonlyArray<
                Effect.Effect<WireguardConfig.WireguardConfig, ParseResult.ParseError, never>
            >,
        Effect.allWith()
    );
};
