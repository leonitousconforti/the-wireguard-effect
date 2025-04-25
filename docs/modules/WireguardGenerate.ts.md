---
title: WireguardGenerate.ts
nav_order: 6
parent: Modules
---

## WireguardGenerate.ts overview

Tools to help generate wireguard configs for common situations.

Since v1.0.0

---

## Exports Grouped by Category

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
  - [generateRemoteTunneledAccess](#generateremotetunneledaccess)
  - [generateServerHubAndSpokeAccess](#generateserverhubandspokeaccess)
  - [generateServerToServerAccess](#generateservertoserveraccess)
  - [generateVpnTunneledAccess](#generatevpntunneledaccess)
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
declare const addAllowedIPs: (<
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
>(
  nodeToIp: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
  nodeFromIp: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
  cidrs: Array.NonEmptyReadonlyArray<
    InternetSchemas.IPv4CidrBlock | InternetSchemas.IPv6CidrBlock | InternetSchemas.CidrBlockFromStringEncoded
  >
) => (allowedIPsLayer: AllowedIPsLayer<Nodes>) => AllowedIPsLayer<Nodes>) &
  (<
    Nodes extends
      | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
      | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
  >(
    allowedIPsLayer: AllowedIPsLayer<Nodes>,
    nodeToIp: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
    nodeFromIp: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
    cidrs: Array.NonEmptyReadonlyArray<
      InternetSchemas.IPv4CidrBlock | InternetSchemas.IPv6CidrBlock | InternetSchemas.CidrBlockFromStringEncoded
    >
  ) => AllowedIPsLayer<Nodes>)
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L375)

Since v1.0.0

## computeAllowedIPsFromConnections

Generates the allowed IPs for each node in the network based on the
connections is has to the other nodes.

**Signature**

```ts
declare const computeAllowedIPsFromConnections: <
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
>(
  connectionsLayer: ConnectionsLayer<Nodes>
) => AllowedIPsLayer<Nodes>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L352)

Since v1.0.0

# Connection Transformers

## addConnection

Adds a direct connection between two nodes in the network.

**Signature**

```ts
declare const addConnection: (<
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
>(
  from: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
  to: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"]
) => (connectionsLayer: ConnectionsLayer<Nodes>) => ConnectionsLayer<Nodes>) &
  (<
    Nodes extends
      | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
      | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
  >(
    connectionsLayer: ConnectionsLayer<Nodes>,
    from: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
    to: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"]
  ) => ConnectionsLayer<Nodes>)
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L301)

Since v1.0.0

## generateHubAndSpokeConnections

Generates connections in a hub and spoke pattern for all nodes in the
network.

**Signature**

```ts
declare const generateHubAndSpokeConnections: <
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
>(
  keysLayer: keysLayer<Nodes>
) => ConnectionsLayer<Nodes>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L271)

Since v1.0.0

## generateStarConnections

Generates connections in a star pattern for all nodes in the network.

**Signature**

```ts
declare const generateStarConnections: <
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
>(
  keysLayer: keysLayer<Nodes>
) => ConnectionsLayer<Nodes>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L237)

Since v1.0.0

# Generator

## toConfigs

Converts a network into configs.

**Signature**

```ts
declare const toConfigs: <
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
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
    ...ReadonlyArray<WireguardConfig.WireguardConfig>
  ],
  ParseResult.ParseError | WireguardErrors.WireguardError,
  never
>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L460)

Since v1.0.0

# Generators

## generateLanHubAndSpokeAccess

Builds on "Server hub and spoke access", allowing you to access your entire
LAN as well.

**Signature**

```ts
declare const generateLanHubAndSpokeAccess: <
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
      : never
>(options: {
  nodes: Nodes
  lanNetworkCidr: NetworkCidr2
  wireguardNetworkCidr: NetworkCidr
}) => WireguardNetwork<Nodes>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L751)

Since v1.0.0

## generateLanToLanAccess

Builds on "Server to server access", allowing two entire networks to
communicate.

**Signature**

```ts
declare const generateLanToLanAccess: <
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
      : never
>(options: {
  nodes: Nodes
  server1Lan: NetworkCidr2
  server2Lan: NetworkCidr3
  wireguardNetworkCidr: NetworkCidr1
}) => WireguardNetwork<Nodes>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L651)

Since v1.0.0

## generateRemoteAccessToLan

Builds on "Remote access to server", allowing you to access your entire LAN
as well.

**Signature**

```ts
declare const generateRemoteAccessToLan: <
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
      : never
>(options: {
  nodes: Nodes
  wireguardNetworkCidr: NetworkCidr1
  lanNetworkCidr: NetworkCidr2
}) => WireguardNetwork<Nodes>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L588)

Since v1.0.0

## generateRemoteAccessToServer

Use your phone or computer to remotely access just the wireguard server.

**Signature**

```ts
declare const generateRemoteAccessToServer: <
  Nodes extends
    | readonly [server: WireguardIPv4Server, client: WireguardIPv4Node]
    | readonly [server: WireguardIPv6Server, client: WireguardIPv6Node],
  NetworkCidr extends Nodes[0] extends WireguardIPv4Node
    ? InternetSchemas.IPv4CidrBlock
    : Nodes[0] extends WireguardIPv6Node
      ? InternetSchemas.IPv6CidrBlock
      : never
>(options: {
  nodes: Nodes
  wireguardNetworkCidr: NetworkCidr
}) => WireguardNetwork<Nodes>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L566)

Since v1.0.0

## generateRemoteTunneledAccess

Securely access the Internet from untrusted networks by routing all of your
traffic through the VPN and out the server's internet connection.

**Signature**

```ts
declare const generateRemoteTunneledAccess: <
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
      : never
>(options: {
  nodes: Nodes
  lanNetworkCidr: NetworkCidr2
  wireguardNetworkCidr: NetworkCidr1
}) => WireguardNetwork<Nodes>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L822)

Since v1.0.0

## generateServerHubAndSpokeAccess

Builds on "Remote access to server", except that all of the VPN clients can
connect to each other as well. Note: all traffic between nodes must pass
through the server.

**Signature**

```ts
declare const generateServerHubAndSpokeAccess: <
  Nodes extends
    | readonly [server: WireguardIPv4Server, ...nodes: Array.NonEmptyReadonlyArray<WireguardIPv4Node>]
    | readonly [server: WireguardIPv6Server, ...nodes: Array.NonEmptyReadonlyArray<WireguardIPv6Node>],
  NetworkCidr extends Nodes[0] extends WireguardIPv4Node
    ? InternetSchemas.IPv4CidrBlock
    : Nodes[0] extends WireguardIPv6Node
      ? InternetSchemas.IPv6CidrBlock
      : never
>(options: {
  nodes: Nodes
  wireguardNetworkCidr: NetworkCidr
}) => WireguardNetwork<Nodes>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L702)

Since v1.0.0

## generateServerToServerAccess

Allows two servers to connect to each other.

**Signature**

```ts
declare const generateServerToServerAccess: <
  Nodes extends
    | readonly [server1: WireguardIPv4Server, server2: WireguardIPv4Server]
    | readonly [server1: WireguardIPv6Server, server2: WireguardIPv6Server],
  NetworkCidr extends Nodes[0] extends WireguardIPv4Node
    ? InternetSchemas.IPv4CidrBlock
    : Nodes[0] extends WireguardIPv6Node
      ? InternetSchemas.IPv6CidrBlock
      : never
>(options: {
  nodes: Nodes
  wireguardNetworkCidr: NetworkCidr
}) => WireguardNetwork<Nodes>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L624)

Since v1.0.0

## generateVpnTunneledAccess

Route specific traffic through a commercial WireGuard VPN provider.

**Signature**

```ts
declare const generateVpnTunneledAccess: <
  Nodes extends
    | readonly [server: WireguardIPv4Server, client: WireguardIPv4Node]
    | readonly [server: WireguardIPv6Server, client: WireguardIPv6Node],
  NetworkCidr extends Nodes[0] extends WireguardIPv4Node
    ? InternetSchemas.IPv4CidrBlock
    : Nodes[0] extends WireguardIPv6Node
      ? InternetSchemas.IPv6CidrBlock
      : never
>(options: {
  nodes: Nodes
  wireguardNetworkCidr: NetworkCidr
}) => WireguardNetwork<Nodes>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L797)

Since v1.0.0

# Key Transformers

## addPreshareKeys

Generates preshare keys for all nodes in the network.

**Signature**

```ts
declare const addPreshareKeys: <
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
>(
  keysLayer: keysLayer<Nodes>
) => keysLayer<Nodes>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L212)

Since v1.0.0

## generateKeys

Generates private+public keys for all nodes in the network.

**Signature**

```ts
declare const generateKeys: <
  Nodes extends
    | readonly [node1: WireguardIPv4Node, node2: WireguardIPv4Node, ...rest: Array<WireguardIPv4Node>]
    | readonly [node1: WireguardIPv6Node, node2: WireguardIPv6Node, ...rest: Array<WireguardIPv6Node>]
>(
  nodesLayer: NodesLayer<Nodes>
) => keysLayer<Nodes>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L194)

Since v1.0.0

# WireguardGenerate

## AllowedIPsLayer (type alias)

Layer containing the allowed IPs for each node in the network.

**Signature**

```ts
type AllowedIPsLayer<Nodes> = ConnectionsLayer<Nodes> & {
  allowedIPs: Record.ReadonlyRecord<
    Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
    Array.NonEmptyReadonlyArray<{
      block: InternetSchemas.CidrBlockFromStringEncoded
      from: Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"]
    }>
  >
}
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L118)

Since v1.0.0

## ConnectionsLayer (type alias)

Layer containing the connections for each node in the network.

**Signature**

```ts
type ConnectionsLayer<Nodes> = keysLayer<Nodes> & {
  connections: Record.ReadonlyRecord<
    Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
    Array.NonEmptyReadonlyArray<
      Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"]
    >
  >
}
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L99)

Since v1.0.0

## NodesLayer (type alias)

Base layer containing just the nodes in the network.

**Signature**

```ts
type NodesLayer<Nodes> = {
  nodes: Nodes
  wireguardNetworkCidr: Nodes[0] extends WireguardIPv4Node
    ? InternetSchemas.IPv4CidrBlock
    : Nodes[0] extends WireguardIPv6Node
      ? InternetSchemas.IPv6CidrBlock
      : never
}
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L63)

Since v1.0.0

## WireguardNetwork (type alias)

The final network type.

**Signature**

```ts
type WireguardNetwork<Nodes> = AllowedIPsLayer<Nodes>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L138)

Since v1.0.0

## keysLayer (type alias)

Layer containing the keys for each node in the network.

**Signature**

```ts
type keysLayer<Nodes> = NodesLayer<Nodes> & {
  keys: Record.ReadonlyRecord<
    Extract<Nodes[number], WireguardRoamingPeer>["ip"] | Extract<Nodes[number], WireguardServer>[1]["ip"],
    Keys
  >
}
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardGenerate.ts#L82)

Since v1.0.0
