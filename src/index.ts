/**
 * Internet schemas for wireguard configuration.
 *
 * @since 1.0.0
 */
export * as InternetSchemas from "./InternetSchemas.js"

/**
 * Wireguard config schema definitions
 *
 * @since 1.0.0
 */
export * as WireguardConfig from "./WireguardConfig.js"

/**
 * Wireguard control mechanisms.
 *
 * @since 1.0.0
 */
export * as WireguardControl from "./WireguardControl.js"

/**
 * Wireguard errors
 *
 * @since 1.0.0
 */
export * as WireguardErrors from "./WireguardErrors.js"

/**
 * Helpers for generating Wireguard configurations.
 *
 * @since 1.0.0
 */
export * as WireguardGenerate from "./WireguardGenerate.js"

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
export * as WireguardGraph from "./WireguardGraph.js"

/**
 * Wireguard interface helpers
 *
 * @since 1.0.0
 */
export * as WireguardInterface from "./WireguardInterface.js"

/**
 * Wireguard key schemas and helpers
 *
 * @since 1.0.0
 */
export * as WireguardKey from "./WireguardKey.js"

/**
 * Wireguard peer schema definitions
 *
 * @since 1.0.0
 */
export * as WireguardPeer from "./WireguardPeer.js"

/**
 * Utilities for connecting to the Wireguard demo server at demo.wireguard.com
 *
 * @since 1.0.0
 */
export * as WireguardServer from "./WireguardServer.js"
