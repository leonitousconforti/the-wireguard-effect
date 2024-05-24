---
title: WireguardGenerate.ts
nav_order: 6
parent: Modules
---

## WireguardGenerate overview

Wireguard Multi Dimensional Graphing Utils. The first layer is the nodes with
the direct connections between then and the second layer is the allowedIPs
for each node. The second layer must be isomorphic to the base layer, hence
why I am experimenting with multi-dimensional graphs. The third layer is the
possible paths packets could take between nodes taking into account the first
and second layers. This third layer can be extracted into a single layer
graph and the extracted graph will be contravariant to the multi layer
graph.

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

---
