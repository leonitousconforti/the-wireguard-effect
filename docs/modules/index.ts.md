---
title: index.ts
nav_order: 1
parent: Modules
---

## index overview

Internet schemas for wireguard configuration.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [exports](#exports)
  - [From "./InternetSchemas.js"](#from-internetschemasjs)
  - [From "./WireguardConfig.js"](#from-wireguardconfigjs)
  - [From "./WireguardControl.js"](#from-wireguardcontroljs)
  - [From "./WireguardErrors.js"](#from-wireguarderrorsjs)
  - [From "./WireguardGenerate.js"](#from-wireguardgeneratejs)
  - [From "./WireguardInterface.js"](#from-wireguardinterfacejs)
  - [From "./WireguardKey.js"](#from-wireguardkeyjs)
  - [From "./WireguardPeer.js"](#from-wireguardpeerjs)
  - [From "./WireguardServer.js"](#from-wireguardserverjs)

---

# exports

## From "./InternetSchemas.js"

Internet schemas for wireguard configuration.

**Signature**

```ts
export * as InternetSchemas from "./InternetSchemas.js"
```

Added in v1.0.0

## From "./WireguardConfig.js"

Wireguard config schema definitions

**Signature**

```ts
export * as WireguardConfig from "./WireguardConfig.js"
```

Added in v1.0.0

## From "./WireguardControl.js"

Wireguard control mechanisms.

**Signature**

```ts
export * as WireguardControl from "./WireguardControl.js"
```

Added in v1.0.0

## From "./WireguardErrors.js"

Wireguard errors

**Signature**

```ts
export * as WireguardErrors from "./WireguardErrors.js"
```

Added in v1.0.0

## From "./WireguardGenerate.js"

Wireguard Multi Dimensional Graphing Utils. The first layer is the nodes with
the direct connections between then and the second layer is the allowedIPs
for each node. The second layer must be isomorphic to the base layer, hence
why I am experimenting with multi-dimensional graphs. The third layer is the
possible paths packets could take between nodes taking into account the first
and second layers. This third layer can be extracted into a single layer
graph and the extracted graph will be contravariant to the multi layer
graph.

**Signature**

```ts
export * as WireguardGenerate from "./WireguardGenerate.js"
```

Added in v1.0.0

## From "./WireguardInterface.js"

Wireguard interface helpers

**Signature**

```ts
export * as WireguardInterface from "./WireguardInterface.js"
```

Added in v1.0.0

## From "./WireguardKey.js"

Wireguard key schemas and helpers

**Signature**

```ts
export * as WireguardKey from "./WireguardKey.js"
```

Added in v1.0.0

## From "./WireguardPeer.js"

Wireguard peer schema definitions

**Signature**

```ts
export * as WireguardPeer from "./WireguardPeer.js"
```

Added in v1.0.0

## From "./WireguardServer.js"

Utilities for connecting to the Wireguard demo server at demo.wireguard.com

**Signature**

```ts
export * as WireguardServer from "./WireguardServer.js"
```

Added in v1.0.0
