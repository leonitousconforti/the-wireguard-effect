/**
 * Tools to help generate wireguard configs for common situations.
 *
 * @since 1.0.0
 */

import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Array from "effect/Array";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Match from "effect/Match";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Record from "effect/Record";
import * as Tuple from "effect/Tuple";
import * as assert from "node:assert";

import * as InternetSchemas from "./InternetSchemas.js";
import * as WireguardConfig from "./WireguardConfig.js";
import * as WireguardErrors from "./WireguardErrors.js";
import * as WireguardKey from "./WireguardKey.js";

/** A node in the network can either have an ipv4 or ipv6 address. */
type WireguardIPv4RoamingPeer = InternetSchemas.IPv4;
type WireguardIPv6RoamingPeer = InternetSchemas.IPv6;
type WireguardRoamingPeer = WireguardIPv4RoamingPeer | WireguardIPv6RoamingPeer;

/**
 * A server in the network can either have an ipv4 address pool or ipv6 address
 * pool.
 */
type WireguardIPv4Server = InternetSchemas.IPv4SetupData | InternetSchemas.HostnameIPv4SetupData;
type WireguardIPv6Server = InternetSchemas.IPv6SetupData | InternetSchemas.HostnameIPv6SetupData;
type WireguardServer = WireguardIPv4Server | WireguardIPv6Server;

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
type WireguardIPv4Node = WireguardIPv4Server | WireguardIPv4RoamingPeer;
type WireguardIPv6Node = WireguardIPv6Server | WireguardIPv6RoamingPeer;
type WireguardNode = WireguardIPv4Node | WireguardIPv6Node;

/**
 * Base layer containing just the nodes in the network.
 *
 * @since 1.0.0
 * @category WireguardGenerate
 */
export type NodesLayer<
    Nodes extends
        | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
        | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
> = {
    nodes: Nodes;
    wireguardNetworkCidr: Nodes[0] extends WireguardIPv4Node
        ? InternetSchemas.IPv4CidrBlock
        : Nodes[0] extends WireguardIPv6Node
          ? InternetSchemas.IPv6CidrBlock
          : never;
};

/**
 * Layer containing the keys for each node in the network.
 *
 * @since 1.0.0
 * @category WireguardGenerate
 */
export type keysLayer<
    Nodes extends
        | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
        | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
> = NodesLayer<Nodes> & {
    keys: Record.ReadonlyRecord<
        Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
        Keys
    >;
};

/**
 * Layer containing the connections for each node in the network.
 *
 * @since 1.0.0
 * @category WireguardGenerate
 */
export type ConnectionsLayer<
    Nodes extends
        | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
        | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
> = keysLayer<Nodes> & {
    connections: Record.ReadonlyRecord<
        Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
        Array.NonEmptyReadonlyArray<
            Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"]
        >
    >;
};

/**
 * Layer containing the allowed IPs for each node in the network.
 *
 * @since 1.0.0
 * @category WireguardGenerate
 */
export type AllowedIPsLayer<
    Nodes extends
        | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
        | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
> = ConnectionsLayer<Nodes> & {
    allowedIPs: Record.ReadonlyRecord<
        Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
        Array.NonEmptyReadonlyArray<{
            block: InternetSchemas.CidrBlockFromStringEncoded;
            from: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"];
        }>
    >;
};

/**
 * The final network type.
 *
 * @since 1.0.0
 * @category WireguardGenerate
 */
export type WireguardNetwork<
    Nodes extends
        | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
        | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
> = AllowedIPsLayer<Nodes>;

/** @internal */
export const ipForNode = Function.pipe(
    Match.type<WireguardIPv4Node | WireguardIPv6Node>(),
    Match.when(Schema.is(InternetSchemas.IPv4), ({ ip }) => ip),
    Match.when(Schema.is(InternetSchemas.IPv6), ({ ip }) => ip),
    Match.whenOr(
        Schema.is(InternetSchemas.HostnameIPv4SetupData),
        Schema.is(InternetSchemas.HostnameIPv6SetupData),
        Schema.is(InternetSchemas.HostnameIPv4SetupData),
        Schema.is(InternetSchemas.HostnameIPv6SetupData),
        ([_, { ip }]) => ip
    ),
    Match.orElseAbsurd
);

/** @internal */
export const nodesByIp = <
    Nodes extends
        | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
        | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
>(
    nodes: Nodes
): Record.ReadonlyRecord<
    Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
    Nodes[number]
> =>
    Function.pipe(
        nodes,
        Array.map((node) => Tuple.make(ipForNode(node), node)),
        Record.fromEntries
    );

/** @internal */
export const makeEmptyContext = <
    Nodes extends
        | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
        | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
>(
    nodes: Nodes
): Record.ReadonlyRecord<
    Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
    undefined
> => Record.map(nodesByIp(nodes), Function.constUndefined);

/**
 * Generates private+public keys for all nodes in the network.
 *
 * @since 1.0.0
 * @category Key Transformers
 */
export const generateKeys = <
    Nodes extends
        | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
        | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
>(
    nodesLayer: NodesLayer<Nodes>
): keysLayer<Nodes> => ({
    nodes: nodesLayer.nodes,
    wireguardNetworkCidr: nodesLayer.wireguardNetworkCidr,
    keys: Function.pipe(nodesLayer.nodes, makeEmptyContext, Record.map(WireguardKey.generateKeyPair)),
});

/**
 * Generates preshare keys for all nodes in the network.
 *
 * @since 1.0.0
 * @category Key Transformers
 */
export const addPreshareKeys = <
    Nodes extends
        | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
        | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
>(
    keysLayer: keysLayer<Nodes>
): keysLayer<Nodes> => ({
    nodes: keysLayer.nodes,
    wireguardNetworkCidr: keysLayer.wireguardNetworkCidr,
    keys: Record.map(keysLayer.keys, (keys) => ({
        ...keys,
        preshareKey: WireguardKey.generatePreshareKey(),
    })),
});

/**
 * Generates connections in a star pattern for all nodes in the network.
 *
 * @since 1.0.0
 * @category Connection Transformers
 */
export const generateStarConnections = <
    Nodes extends
        | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
        | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
>(
    keysLayer: keysLayer<Nodes>
): ConnectionsLayer<Nodes> => {
    const allNodeIps = Array.map(keysLayer.nodes, ipForNode);

    const connections = Function.pipe(
        keysLayer.nodes,
        makeEmptyContext,
        Record.map((_, currentNode) => {
            const neighbors = Array.filter(allNodeIps, (ip) => ip !== currentNode);
            assert.ok(Array.isNonEmptyReadonlyArray(neighbors), "There must be at least one neighbor");
            return neighbors;
        })
    );

    return {
        connections,
        nodes: keysLayer.nodes,
        keys: keysLayer.keys,
        wireguardNetworkCidr: keysLayer.wireguardNetworkCidr,
    };
};

/**
 * Generates connections in a hub and spoke pattern for all nodes in the
 * network.
 *
 * @since 1.0.0
 * @category Connection Transformers
 */
export const generateHubAndSpokeConnections = <
    Nodes extends
        | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
        | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
>(
    keysLayer: keysLayer<Nodes>
): ConnectionsLayer<Nodes> => ({
    nodes: keysLayer.nodes,
    keys: keysLayer.keys,
    wireguardNetworkCidr: keysLayer.wireguardNetworkCidr,
    connections: Function.pipe(
        keysLayer.nodes,
        makeEmptyContext,
        Record.map((_, node) => {
            if (node === ipForNode(keysLayer.nodes[0])) {
                return InternetSchemas.tail(keysLayer.nodes);
            } else {
                return Array.of(keysLayer.nodes[0]);
            }
        }),
        Record.map(Array.map(ipForNode))
    ),
});

/**
 * Adds a direct connection between two nodes in the network.
 *
 * @since 1.0.0
 * @category Connection Transformers
 */
export const addConnection = Function.dual<
    <
        Nodes extends
            | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
            | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
    >(
        from: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
        to: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"]
    ) => (connectionsLayer: ConnectionsLayer<Nodes>) => ConnectionsLayer<Nodes>,
    <
        Nodes extends
            | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
            | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
    >(
        connectionsLayer: ConnectionsLayer<Nodes>,
        from: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
        to: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"]
    ) => ConnectionsLayer<Nodes>
>(
    3,
    <
        Nodes extends
            | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
            | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
    >(
        connectionsLayer: ConnectionsLayer<Nodes>,
        from: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
        to: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"]
    ): ConnectionsLayer<Nodes> => {
        const oldConnections = Record.get(connectionsLayer.connections, from);
        const newConnections = Function.pipe(
            oldConnections,
            Option.map((connections) => Array.append(connections, to)),
            Option.getOrElse(() => Array.of(to))
        );
        return {
            nodes: connectionsLayer.nodes,
            keys: connectionsLayer.keys,
            wireguardNetworkCidr: connectionsLayer.wireguardNetworkCidr,
            connections: Record.set(connectionsLayer.connections, from, newConnections),
        };
    }
);

/**
 * Generates the allowed IPs for each node in the network based on the
 * connections is has to the other nodes.
 *
 * @since 1.0.0
 * @category AllowedIPs Transformers
 */
export const computeAllowedIPsFromConnections = <
    Nodes extends
        | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
        | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
>(
    connectionsLayer: ConnectionsLayer<Nodes>
): AllowedIPsLayer<Nodes> => ({
    nodes: connectionsLayer.nodes,
    keys: connectionsLayer.keys,
    connections: connectionsLayer.connections,
    wireguardNetworkCidr: connectionsLayer.wireguardNetworkCidr,
    allowedIPs: Record.map(
        connectionsLayer.connections,
        Array.map((ip) => ({ from: ip, block: `${ip}/32` as const }))
    ),
});

/**
 * Adds an allowed IP to a node in the network.
 *
 * @since 1.0.0
 * @category AllowedIPs Transformers
 */
export const addAllowedIPs = Function.dual<
    <
        Nodes extends
            | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
            | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
    >(
        nodeToIp: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
        nodeFromIp:
            | Extract<Nodes[number], WireguardRoamingPeer>["ip"]
            | Extract<Nodes[number], WireguardServer>[1]["ip"],
        cidrs: Array.NonEmptyReadonlyArray<
            InternetSchemas.IPv4CidrBlock | InternetSchemas.IPv6CidrBlock | InternetSchemas.CidrBlockFromStringEncoded
        >
    ) => (allowedIPsLayer: AllowedIPsLayer<Nodes>) => AllowedIPsLayer<Nodes>,
    <
        Nodes extends
            | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
            | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
    >(
        allowedIPsLayer: AllowedIPsLayer<Nodes>,
        nodeToIp: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
        nodeFromIp:
            | Extract<Nodes[number], WireguardRoamingPeer>["ip"]
            | Extract<Nodes[number], WireguardServer>[1]["ip"],
        cidrs: Array.NonEmptyReadonlyArray<
            InternetSchemas.IPv4CidrBlock | InternetSchemas.IPv6CidrBlock | InternetSchemas.CidrBlockFromStringEncoded
        >
    ) => AllowedIPsLayer<Nodes>
>(
    4,
    <
        Nodes extends
            | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
            | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
    >(
        allowedIPsLayer: AllowedIPsLayer<Nodes>,
        nodeToIp: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
        nodeFromIp:
            | Extract<Nodes[number], WireguardRoamingPeer>["ip"]
            | Extract<Nodes[number], WireguardServer>[1]["ip"],
        cidrs: Array.NonEmptyReadonlyArray<
            InternetSchemas.IPv4CidrBlock | InternetSchemas.IPv6CidrBlock | InternetSchemas.CidrBlockFromStringEncoded
        >
    ): AllowedIPsLayer<Nodes> => {
        const oldCidrs = Record.get(allowedIPsLayer.allowedIPs, nodeToIp);

        const cidrsEncoded = Array.map(cidrs, (cidr) =>
            Function.pipe(
                Match.value(cidr),
                Match.when(
                    Schema.is(InternetSchemas.IPv4CidrBlock),
                    ({ address, mask }): InternetSchemas.CidrBlockFromStringEncoded => `${address.ip}/${mask}` as const
                ),
                Match.when(
                    Schema.is(InternetSchemas.IPv6CidrBlock),
                    ({ address, mask }): InternetSchemas.CidrBlockFromStringEncoded => `${address.ip}/${mask}` as const
                ),
                Match.when(Predicate.isString, Function.identity<InternetSchemas.CidrBlockFromStringEncoded>),
                Match.exhaustive
            )
        );

        const mappedCidrs = Array.map(cidrsEncoded, (cidr) => ({ from: nodeFromIp, block: cidr }));
        const newCidrs = Function.pipe(
            oldCidrs,
            Option.map((oldCidrs) => Array.appendAll(oldCidrs, mappedCidrs)),
            Option.getOrElse(() => mappedCidrs)
        );

        return {
            nodes: allowedIPsLayer.nodes,
            keys: allowedIPsLayer.keys,
            connections: allowedIPsLayer.connections,
            wireguardNetworkCidr: allowedIPsLayer.wireguardNetworkCidr,
            allowedIPs: Record.set(allowedIPsLayer.allowedIPs, nodeToIp, newCidrs),
        };
    }
);

/**
 * Converts a network into configs.
 *
 * @since 1.0.0
 * @category Generator
 */
export const toConfigs = <
    Nodes extends
        | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
        | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>],
>({
    allowedIPs,
    connections,
    keys,
    nodes,
    wireguardNetworkCidr,
}: WireguardNetwork<Nodes>): Effect.Effect<
    readonly [
        WireguardConfig.WireguardConfig,
        WireguardConfig.WireguardConfig,
        ...Array<WireguardConfig.WireguardConfig>,
    ],
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
> => {
    const endpointsByIp = nodesByIp(nodes) as Record.ReadonlyRecord<
        Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
        WireguardNode
    >;

    const peerConfigsByIp = Function.pipe(
        nodes,
        nodesByIp,
        Record.map((node) =>
            Effect.gen(function* () {
                const keysForNode = Record.get(keys, ipForNode(node)).pipe(Option.getOrThrow);
                const endpointForNode = Record.get(endpointsByIp, ipForNode(node)).pipe(Option.getOrThrow);

                const endpointForNodeEncoded = yield* Schema.is(InternetSchemas.SetupData)(endpointForNode)
                    ? Schema.encode(InternetSchemas.SetupData)(endpointForNode).pipe(Effect.map((x) => x[0]))
                    : Effect.succeed(undefined);

                const address = Schema.is(InternetSchemas.SetupData)(endpointForNode)
                    ? endpointForNode[1].ip
                    : endpointForNode.ip;

                return {
                    Address: address,
                    Endpoint: endpointForNodeEncoded,
                    PublicKey: keysForNode.publicKey,
                    PresharedKey: keysForNode.preshareKey,
                } as const;
            })
        )
    );

    const configs = Array.map(nodes, (node) =>
        Effect.gen(function* () {
            const keysForNode = Record.get(keys, ipForNode(node)).pipe(Option.getOrThrow);
            const endpointForNode = Record.get(endpointsByIp, ipForNode(node)).pipe(Option.getOrThrow);
            const allowedIPsForNode = Record.get(allowedIPs, ipForNode(node)).pipe(Option.getOrThrow);

            const address = Schema.is(InternetSchemas.SetupData)(endpointForNode)
                ? endpointForNode[1].ip
                : endpointForNode.ip;

            const listenPort = Schema.is(InternetSchemas.SetupData)(endpointForNode)
                ? endpointForNode[0].listenPort
                : 0;

            const directConnectionsForNode = yield* Function.pipe(
                connections,
                Record.get(ipForNode(node)),
                Option.getOrThrow,
                Array.filterMap((peerAddress) => Record.get(peerConfigsByIp, peerAddress)),
                Effect.allWith()
            );

            const dcsWithAllowedIPs = Array.map(directConnectionsForNode, (dc) => ({
                Endpoint: dc.Endpoint,
                PublicKey: dc.PublicKey,
                PresharedKey: dc.PresharedKey,
                AllowedIPs: Function.pipe(
                    allowedIPsForNode,
                    Array.filter(({ from }) => from === dc.Address),
                    Array.map(({ block }) => block),
                    (x) => new Set(x)
                ),
            }));

            return yield* Schema.decode(WireguardConfig.WireguardConfig)({
                ListenPort: listenPort,
                Peers: dcsWithAllowedIPs,
                PrivateKey: keysForNode.privateKey,
                Address: `${address}/${wireguardNetworkCidr.mask}`,
            });
        })
    );

    // FIXME: can use iSTupleOf from https://github.com/Effect-TS/effect/pull/2830/files once effect 3.3.0 is released
    if (configs.length >= 2) {
        return Effect.all(
            configs as [
                Effect.Effect<WireguardConfig.WireguardConfig, ParseResult.ParseError, never>,
                Effect.Effect<WireguardConfig.WireguardConfig, ParseResult.ParseError, never>,
                ...Array<Effect.Effect<WireguardConfig.WireguardConfig, ParseResult.ParseError, never>>,
            ]
        );
    } else {
        return Effect.fail(new WireguardErrors.WireguardError({ message: "There must be at least two nodes" }));
    }
};

/**
 * Use your phone or computer to remotely access just the wireguard server.
 *
 * @since 1.0.0
 * @category Generators
 */
export const generateRemoteAccessToServer = <
    Nodes extends
        | readonly [server: WireguardIPv4Server, client: WireguardIPv4Node]
        | readonly [server: WireguardIPv6Server, client: WireguardIPv6Node],
    NetworkCidr extends Nodes[0] extends WireguardIPv4Node
        ? InternetSchemas.IPv4CidrBlock
        : Nodes[0] extends WireguardIPv6Node
          ? InternetSchemas.IPv6CidrBlock
          : never,
>(options: {
    nodes: Nodes;
    wireguardNetworkCidr: NetworkCidr;
}): WireguardNetwork<Nodes> =>
    Function.flow(generateKeys, addPreshareKeys, generateStarConnections, computeAllowedIPsFromConnections)(options);

/**
 * Builds on "Remote access to server", allowing you to access your entire LAN
 * as well.
 *
 * @since 1.0.0
 * @category Generators
 */
export const generateRemoteAccessToLan = <
    Nodes extends
        | readonly [server: WireguardIPv4Server, client: WireguardIPv4Node]
        | readonly [server: WireguardIPv6Server, client: WireguardIPv6Node],
    NetworkCidr1 extends Nodes[0] extends WireguardIPv4Node
        ? InternetSchemas.IPv4CidrBlock
        : Nodes[0] extends WireguardIPv6Node
          ? InternetSchemas.IPv6CidrBlock
          : never,
    NetworkCidr2 extends Nodes[0] extends WireguardIPv4Server
        ? InternetSchemas.IPv4CidrBlock | Array.NonEmptyArray<InternetSchemas.IPv4CidrBlock>
        : Nodes[0] extends WireguardIPv6Server
          ? InternetSchemas.IPv6CidrBlock | Array.NonEmptyArray<InternetSchemas.IPv6CidrBlock>
          : never,
>(options: {
    nodes: Nodes;
    wireguardNetworkCidr: NetworkCidr1;
    lanNetworkCidr: NetworkCidr2;
}): WireguardNetwork<Nodes> =>
    Function.flow(
        generateRemoteAccessToServer,
        addAllowedIPs(
            ipForNode(options.nodes[0]),
            ipForNode(options.nodes[1]),
            Array.isArray(options.lanNetworkCidr)
                ? options.lanNetworkCidr
                : Array.of(options.lanNetworkCidr as InternetSchemas.CidrBlockBase<InternetSchemas.Family>)
        )
    )(options);

/**
 * Allows two servers to connect to each other.
 *
 * @since 1.0.0
 * @category Generators
 */
export const generateServerToServerAccess = <
    Nodes extends
        | readonly [server1: WireguardIPv4Server, server2: WireguardIPv4Server]
        | readonly [server1: WireguardIPv6Server, server2: WireguardIPv6Server],
    NetworkCidr extends Nodes[0] extends WireguardIPv4Node
        ? InternetSchemas.IPv4CidrBlock
        : Nodes[0] extends WireguardIPv6Node
          ? InternetSchemas.IPv6CidrBlock
          : never,
>(options: {
    nodes: Nodes;
    wireguardNetworkCidr: NetworkCidr;
}): WireguardNetwork<Nodes> =>
    Function.flow(generateKeys, generateHubAndSpokeConnections, computeAllowedIPsFromConnections)(options);

/**
 * Builds on "Server to server access", allowing two entire networks to
 * communicate.
 *
 * @since 1.0.0
 * @category Generators
 */
export const generateLanToLanAccess = <
    Nodes extends
        | readonly [server1: WireguardIPv4Server, server2: WireguardIPv4Server]
        | readonly [server1: WireguardIPv6Server, server2: WireguardIPv6Server],
    NetworkCidr1 extends Nodes[0] extends WireguardIPv4Node
        ? InternetSchemas.IPv4CidrBlock
        : Nodes[0] extends WireguardIPv6Node
          ? InternetSchemas.IPv6CidrBlock
          : never,
    NetworkCidr2 extends Nodes[0] extends WireguardIPv4Server
        ? InternetSchemas.IPv4CidrBlock | Array.NonEmptyArray<InternetSchemas.IPv4CidrBlock>
        : Nodes[0] extends WireguardIPv6Server
          ? InternetSchemas.IPv6CidrBlock | Array.NonEmptyArray<InternetSchemas.IPv6CidrBlock>
          : never,
    NetworkCidr3 extends Nodes[1] extends WireguardIPv4Server
        ? InternetSchemas.IPv4CidrBlock | Array.NonEmptyArray<InternetSchemas.IPv4CidrBlock>
        : Nodes[1] extends WireguardIPv6Server
          ? InternetSchemas.IPv6CidrBlock | Array.NonEmptyArray<InternetSchemas.IPv6CidrBlock>
          : never,
>(options: {
    nodes: Nodes;
    wireguardNetworkCidr: NetworkCidr1;
    server1Lan: NetworkCidr2;
    server2Lan: NetworkCidr3;
}): WireguardNetwork<Nodes> =>
    Function.flow(
        generateServerToServerAccess,
        addAllowedIPs(
            ipForNode(options.nodes[1]),
            ipForNode(options.nodes[0]),
            Array.isArray(options.server1Lan)
                ? options.server1Lan
                : Array.of(options.server1Lan as InternetSchemas.CidrBlockBase<InternetSchemas.Family>)
        ),
        addAllowedIPs(
            ipForNode(options.nodes[0]),
            ipForNode(options.nodes[1]),
            Array.isArray(options.server2Lan)
                ? options.server2Lan
                : Array.of(options.server2Lan as InternetSchemas.CidrBlockBase<InternetSchemas.Family>)
        )
    )(options);

/**
 * Builds on "Remote access to server", except that all of the VPN clients can
 * connect to each other as well. The enableDirectCommunication flag determines
 * if traffic between nodes must pass through the server or if nodes are able to
 * communicate directly with each other.
 *
 * @since 1.0.0
 * @category Generators
 */
export const generateServerHubAndSpokeAccess = <
    Nodes extends
        | readonly [server: WireguardIPv4Server, ...nodes: Array.NonEmptyReadonlyArray<WireguardIPv4Node>]
        | readonly [server: WireguardIPv6Server, ...nodes: Array.NonEmptyReadonlyArray<WireguardIPv6Node>],
    NetworkCidr extends Nodes[0] extends WireguardIPv4Node
        ? InternetSchemas.IPv4CidrBlock
        : Nodes[0] extends WireguardIPv6Node
          ? InternetSchemas.IPv6CidrBlock
          : never,
>(options: {
    nodes: Nodes;
    wireguardNetworkCidr: NetworkCidr;
    enableDirectCommunication?: boolean | undefined;
}): WireguardNetwork<Nodes> =>
    Function.flow(
        generateKeys,
        addPreshareKeys,
        Predicate.isTruthy(options.enableDirectCommunication)
            ? generateStarConnections
            : generateHubAndSpokeConnections,
        computeAllowedIPsFromConnections
    )(options);

/**
 * Builds on "Server hub and spoke access", allowing you to access your entire
 * LAN as well.
 *
 * @since 1.0.0
 * @category Generators
 */
export const generateLanHubAndSpokeAccess = <
    Nodes extends
        | readonly [server: WireguardIPv4Server, ...nodes: Array.NonEmptyReadonlyArray<WireguardIPv4Node>]
        | readonly [server: WireguardIPv6Server, ...nodes: Array.NonEmptyReadonlyArray<WireguardIPv6Node>],
    NetworkCidr extends Nodes[0] extends WireguardIPv4Node
        ? InternetSchemas.IPv4CidrBlock
        : Nodes[0] extends WireguardIPv6Node
          ? InternetSchemas.IPv6CidrBlock
          : never,
    NetworkCidr2 extends Nodes[0] extends WireguardIPv4Server
        ? InternetSchemas.IPv4CidrBlock | Array.NonEmptyArray<InternetSchemas.IPv4CidrBlock>
        : Nodes[0] extends WireguardIPv6Server
          ? InternetSchemas.IPv6CidrBlock | Array.NonEmptyArray<InternetSchemas.IPv6CidrBlock>
          : never,
>(options: {
    nodes: Nodes;
    lanNetworkCidr: NetworkCidr2;
    wireguardNetworkCidr: NetworkCidr;
    enableDirectCommunication?: boolean | undefined;
}): WireguardNetwork<Nodes> => {
    const addAllowedIPsToAllNodes = Function.pipe(
        options.nodes,
        Array.map(ipForNode),
        Array.tailNonEmpty,
        Array.reduce(Function.identity<AllowedIPsLayer<Nodes>>, (acc, node) =>
            Function.compose(
                addAllowedIPs(
                    node,
                    ipForNode(options.nodes[0]),
                    Array.isArray(options.lanNetworkCidr)
                        ? options.lanNetworkCidr
                        : Array.of(options.lanNetworkCidr as InternetSchemas.CidrBlockBase<InternetSchemas.Family>)
                ),
                acc
            )
        )
    );

    return addAllowedIPsToAllNodes(generateServerHubAndSpokeAccess(options));
};

/**
 * Route specific traffic through a commercial WireGuard VPN provider.
 *
 * @since 1.0.0
 * @category Generators
 * @todo Implement
 */
// export const generateVpnTunneledAccess = (): WireguardNetwork<Nodes> => {};

/**
 * Securely access the Internet from untrusted networks by routing all of your
 * traffic through the VPN and out the server's internet connection.
 *
 * @since 1.0.0
 * @category Generators
 * @todo Implement
 */
// export const generateRemoteTunneledAccess = (): WireguardNetwork<Nodes> => {};
