---
title: WireguardGenerate.ts
nav_order: 6
parent: Modules
---

## WireguardGenerate overview

Tools to help generate wireguard configs for common situations.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [AllowedIPs Transformers](#allowedips-transformers)
  - [addAllowedIPs](#addallowedips)
  - [computeAllowedIPsFromConnections](#computeallowedipsfromconnections)
- [Connection Transformers](#connection-transformers)
  - [addConnection](#addconnection)
  - [generateHubAndSpokeConnections](#generatehubandspokeconnections)
  - [generateStarConnections](#generatestarconnections)
- [Generator](#generator)
  - [toConfigs](#toconfigs)
- [Generators](#generators)
  - [generateLanHubAndSpokeAccess](#generatelanhubandspokeaccess)
  - [generateLanToLanAccess](#generatelantolanaccess)
  - [generateRemoteAccessToLan](#generateremoteaccesstolan)
  - [generateRemoteAccessToServer](#generateremoteaccesstoserver)
  - [generateServerHubAndSpokeAccess](#generateserverhubandspokeaccess)
  - [generateServerToServerAccess](#generateservertoserveraccess)
- [Key Transformers](#key-transformers)
  - [addPreshareKeys](#addpresharekeys)
  - [generateKeys](#generatekeys)
- [WireguardGenerate](#wireguardgenerate)
  - [AllowedIPsLayer (type alias)](#allowedipslayer-type-alias)
  - [ConnectionsLayer (type alias)](#connectionslayer-type-alias)
  - [NodesLayer (type alias)](#nodeslayer-type-alias)
  - [WireguardNetwork (type alias)](#wireguardnetwork-type-alias)
  - [keysLayer (type alias)](#keyslayer-type-alias)

---

# AllowedIPs Transformers

## addAllowedIPs

Adds an allowed IP to a node in the network.

**Signature**

```ts
export declare const addAllowedIPs: (<
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: WireguardIPv4Node[]]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: WireguardIPv6Node[]]
>(
  nodeToIp: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
  nodeFromIp: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
  cidrs: readonly [
    `${string}/${number}` | InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">,
    ...(`${string}/${number}` | InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">)[]
  ]
) => (allowedIPsLayer: AllowedIPsLayer<Nodes>) => AllowedIPsLayer<Nodes>) &
  (<
    Nodes extends
      | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: WireguardIPv4Node[]]
      | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: WireguardIPv6Node[]]
  >(
    allowedIPsLayer: AllowedIPsLayer<Nodes>,
    nodeToIp: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
    nodeFromIp: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
    cidrs: readonly [
      `${string}/${number}` | InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">,
      ...(`${string}/${number}` | InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">)[]
    ]
  ) => AllowedIPsLayer<Nodes>)
```

Added in v1.0.0

## computeAllowedIPsFromConnections

Generates the allowed IPs for each node in the network based on the
connections is has to the other nodes.

**Signature**

```ts
export declare const computeAllowedIPsFromConnections: <
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: WireguardIPv4Node[]]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: WireguardIPv6Node[]]
>(
  connectionsLayer: ConnectionsLayer<Nodes>
) => AllowedIPsLayer<Nodes>
```

Added in v1.0.0

# Connection Transformers

## addConnection

Adds a direct connection between two nodes in the network.

**Signature**

```ts
export declare const addConnection: (<
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: WireguardIPv4Node[]]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: WireguardIPv6Node[]]
>(
  from: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
  to: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"]
) => (connectionsLayer: ConnectionsLayer<Nodes>) => ConnectionsLayer<Nodes>) &
  (<
    Nodes extends
      | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: WireguardIPv4Node[]]
      | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: WireguardIPv6Node[]]
  >(
    connectionsLayer: ConnectionsLayer<Nodes>,
    from: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
    to: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"]
  ) => ConnectionsLayer<Nodes>)
```

Added in v1.0.0

## generateHubAndSpokeConnections

Generates connections in a hub and spoke pattern for all nodes in the
network.

**Signature**

```ts
export declare const generateHubAndSpokeConnections: <
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: WireguardIPv4Node[]]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: WireguardIPv6Node[]]
>(
  keysLayer: keysLayer<Nodes>
) => ConnectionsLayer<Nodes>
```

Added in v1.0.0

## generateStarConnections

Generates connections in a star pattern for all nodes in the network.

**Signature**

```ts
export declare const generateStarConnections: <
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: WireguardIPv4Node[]]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: WireguardIPv6Node[]]
>(
  keysLayer: keysLayer<Nodes>
) => ConnectionsLayer<Nodes>
```

Added in v1.0.0

# Generator

## toConfigs

Converts a network into configs.

**Signature**

```ts
export declare const toConfigs: <
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: WireguardIPv4Node[]]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: WireguardIPv6Node[]]
>({
  allowedIPs,
  connections,
  keys,
  nodes,
  wireguardNetworkCidr
}: WireguardNetwork<Nodes>) => Effect.Effect<
  readonly [
    WireguardConfig.WireguardConfig,
    WireguardConfig.WireguardConfig,
    ...Array<WireguardConfig.WireguardConfig>
  ],
  ParseResult.ParseError | WireguardErrors.WireguardError,
  never
>
```

Added in v1.0.0

# Generators

## generateLanHubAndSpokeAccess

Builds on "Server hub and spoke access", allowing you to access your entire
LAN as well.

**Signature**

```ts
export declare const generateLanHubAndSpokeAccess: <
  Nodes extends
    | readonly [server: WireguardIPv4Server, WireguardIPv4Node, ...WireguardIPv4Node[]]
    | readonly [server: WireguardIPv6Server, WireguardIPv6Node, ...WireguardIPv6Node[]],
  NetworkCidr extends Nodes[0] extends WireguardIPv4Node
    ? InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
    : Nodes[0] extends WireguardIPv6Node
      ? InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
      : never,
  NetworkCidr2 extends Nodes[0] extends WireguardIPv4Server
    ?
        | InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
        | [InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">, ...InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">[]]
    : Nodes[0] extends WireguardIPv6Server
      ?
          | InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
          | [InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">, ...InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">[]]
      : never
>(options: {
  nodes: Nodes
  lanNetworkCidr: NetworkCidr2
  wireguardNetworkCidr: NetworkCidr
  enableDirectCommunication?: boolean | undefined
}) => WireguardNetwork<Nodes>
```

Added in v1.0.0

## generateLanToLanAccess

Builds on "Server to server access", allowing two entire networks to
communicate.

**Signature**

```ts
export declare const generateLanToLanAccess: <
  Nodes extends
    | readonly [server1: WireguardIPv4Server, server2: WireguardIPv4Server]
    | readonly [server1: WireguardIPv6Server, server2: WireguardIPv6Server],
  NetworkCidr1 extends Nodes[0] extends WireguardIPv4Node
    ? InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
    : Nodes[0] extends WireguardIPv6Node
      ? InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
      : never,
  NetworkCidr2 extends Nodes[0] extends WireguardIPv4Server
    ?
        | InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
        | [InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">, ...InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">[]]
    : Nodes[0] extends WireguardIPv6Server
      ?
          | InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
          | [InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">, ...InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">[]]
      : never,
  NetworkCidr3 extends Nodes[1] extends WireguardIPv4Server
    ?
        | InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
        | [InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">, ...InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">[]]
    : Nodes[1] extends WireguardIPv6Server
      ?
          | InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
          | [InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">, ...InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">[]]
      : never
>(options: {
  nodes: Nodes
  wireguardNetworkCidr: NetworkCidr1
  server1Lan: NetworkCidr2
  server2Lan: NetworkCidr3
}) => WireguardNetwork<Nodes>
```

Added in v1.0.0

## generateRemoteAccessToLan

Builds on "Remote access to server", allowing you to access your entire LAN
as well.

**Signature**

```ts
export declare const generateRemoteAccessToLan: <
  Nodes extends
    | readonly [server: WireguardIPv4Server, client: WireguardIPv4Node]
    | readonly [server: WireguardIPv6Server, client: WireguardIPv6Node],
  NetworkCidr1 extends Nodes[0] extends WireguardIPv4Node
    ? InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
    : Nodes[0] extends WireguardIPv6Node
      ? InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
      : never,
  NetworkCidr2 extends Nodes[0] extends WireguardIPv4Server
    ?
        | InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
        | [InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">, ...InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">[]]
    : Nodes[0] extends WireguardIPv6Server
      ?
          | InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
          | [InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">, ...InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">[]]
      : never
>(options: {
  nodes: Nodes
  wireguardNetworkCidr: NetworkCidr1
  lanNetworkCidr: NetworkCidr2
}) => WireguardNetwork<Nodes>
```

Added in v1.0.0

## generateRemoteAccessToServer

Use your phone or computer to remotely access just the wireguard server.

**Signature**

```ts
export declare const generateRemoteAccessToServer: <
  Nodes extends
    | readonly [server: WireguardIPv4Server, client: WireguardIPv4Node]
    | readonly [server: WireguardIPv6Server, client: WireguardIPv6Node],
  NetworkCidr extends Nodes[0] extends WireguardIPv4Node
    ? InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
    : Nodes[0] extends WireguardIPv6Node
      ? InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
      : never
>(options: {
  nodes: Nodes
  wireguardNetworkCidr: NetworkCidr
}) => WireguardNetwork<Nodes>
```

Added in v1.0.0

## generateServerHubAndSpokeAccess

Builds on "Remote access to server", except that all of the VPN clients can
connect to each other as well. The enableDirectCommunication flag determines
if traffic between nodes must pass through the server or if nodes are able to
communicate directly with each other.

**Signature**

```ts
export declare const generateServerHubAndSpokeAccess: <
  Nodes extends
    | readonly [server: WireguardIPv4Server, WireguardIPv4Node, ...WireguardIPv4Node[]]
    | readonly [server: WireguardIPv6Server, WireguardIPv6Node, ...WireguardIPv6Node[]],
  NetworkCidr extends Nodes[0] extends WireguardIPv4Node
    ? InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
    : Nodes[0] extends WireguardIPv6Node
      ? InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
      : never
>(options: {
  nodes: Nodes
  wireguardNetworkCidr: NetworkCidr
  enableDirectCommunication?: boolean | undefined
}) => WireguardNetwork<Nodes>
```

Added in v1.0.0

## generateServerToServerAccess

Allows two servers to connect to each other.

**Signature**

```ts
export declare const generateServerToServerAccess: <
  Nodes extends
    | readonly [server1: WireguardIPv4Server, server2: WireguardIPv4Server]
    | readonly [server1: WireguardIPv6Server, server2: WireguardIPv6Server],
  NetworkCidr extends Nodes[0] extends WireguardIPv4Node
    ? InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
    : Nodes[0] extends WireguardIPv6Node
      ? InternetSchemas.CidrBlockBase<"ipv4" | "ipv6">
      : never
>(options: {
  nodes: Nodes
  wireguardNetworkCidr: NetworkCidr
}) => WireguardNetwork<Nodes>
```

Added in v1.0.0

# Key Transformers

## addPreshareKeys

Generates preshare keys for all nodes in the network.

**Signature**

```ts
export declare const addPreshareKeys: <
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: WireguardIPv4Node[]]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: WireguardIPv6Node[]]
>(
  keysLayer: keysLayer<Nodes>
) => keysLayer<Nodes>
```

Added in v1.0.0

## generateKeys

Generates private+public keys for all nodes in the network.

**Signature**

```ts
export declare const generateKeys: <
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: WireguardIPv4Node[]]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: WireguardIPv6Node[]]
>(
  nodesLayer: NodesLayer<Nodes>
) => keysLayer<Nodes>
```

Added in v1.0.0

# WireguardGenerate

## AllowedIPsLayer (type alias)

Layer containing the allowed IPs for each node in the network.

**Signature**

```ts
export type AllowedIPsLayer<
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
> = ConnectionsLayer<Nodes> & {
  allowedIPs: Record.ReadonlyRecord<
    Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
    Array.NonEmptyReadonlyArray<{
      block: InternetSchemas.CidrBlockFromStringEncoded
      from: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"]
    }>
  >
}
```

Added in v1.0.0

## ConnectionsLayer (type alias)

Layer containing the connections for each node in the network.

**Signature**

```ts
export type ConnectionsLayer<
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
> = keysLayer<Nodes> & {
  connections: Record.ReadonlyRecord<
    Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
    Array.NonEmptyReadonlyArray<
      Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"]
    >
  >
}
```

Added in v1.0.0

## NodesLayer (type alias)

Base layer containing just the nodes in the network.

**Signature**

```ts
export type NodesLayer<
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
> = {
  nodes: Nodes
  wireguardNetworkCidr: Nodes[0] extends WireguardIPv4Node
    ? InternetSchemas.IPv4CidrBlock
    : Nodes[0] extends WireguardIPv6Node
      ? InternetSchemas.IPv6CidrBlock
      : never
}
```

Added in v1.0.0

## WireguardNetwork (type alias)

The final network type.

**Signature**

```ts
export type WireguardNetwork<
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
> = AllowedIPsLayer<Nodes>
```

Added in v1.0.0

## keysLayer (type alias)

Layer containing the keys for each node in the network.

**Signature**

```ts
export type keysLayer<
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
> = NodesLayer<Nodes> & {
  keys: Record.ReadonlyRecord<
    Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
    Keys
  >
}
```

Added in v1.0.0
