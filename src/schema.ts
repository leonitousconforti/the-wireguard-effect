import * as Schema from "@effect/schema/Schema";
import * as Data from "effect/Data";

/** Generic wireguard interface config error. */
export class WireguardError extends Data.TaggedError("WireguardError")<{ message: string }> {}

/** @see https://github.com/WireGuard/wgctrl-go/blob/925a1e7659e675c94c1a659d39daa9141e450c7d/wgtypes/types.go#L236-L276 */
export class WireguardPeer extends Schema.Class<WireguardPeer>()({
    /**
     * The value for this is a decimal-string integer corresponding to the
     * persistent keepalive interval. The value 0 disables it.
     */
    PersistentKeepaliveInterval: Schema.number,

    /**
     * The value for this is IP/cidr, indicating a new added allowed IP entry
     * for the previously added peer entry. If an identical value already exists
     * as part of a prior peer, the allowed IP entry will be removed from that
     * peer and added to this peer.
     */
    AllowedIPs: Schema.array(Schema.string),

    /**
     * The value for this key is either IP:port for IPv4 or [IP]:port for IPv6,
     * indicating the endpoint of the previously added peer entry.
     */
    Endpoint: Schema.string.pipe(Schema.nonEmpty()),

    /**
     * The value for this key should be a lowercase hex-encoded public key of a
     * new peer entry.
     */
    PublicKey: Schema.string.pipe(Schema.nonEmpty()),
}) {}

/** @see https://github.com/WireGuard/wgctrl-go/blob/925a1e7659e675c94c1a659d39daa9141e450c7d/wgtypes/types.go#L207-L232 */
export class WireguardInterface extends Schema.Class<WireguardInterface>()({
    /**
     * The value for this is a decimal-string integer corresponding to the
     * listening port of the interface.
     */
    ListenPort: Schema.number,

    /**
     * The value for this is a decimal-string integer corresponding to the
     * fwmark of the interface. The value may 0 in the case of a set operation,
     * in which case it indicates that the fwmark should be removed.
     */
    FirewallMark: Schema.optional(Schema.number),

    /**
     * The value for this key should be a lowercase hex-encoded private key of
     * the interface. The value may be an all zero string in the case of a set
     * operation, in which case it indicates that the private key should be
     * removed.
     */
    PrivateKey: Schema.string,

    /**
     * Indicates that the subsequent peers (perhaps an empty list) should
     * replace any existing peers, rather than append to the existing peer
     * list.
     */
    ReplacePeers: Schema.optional(Schema.boolean, { default: () => true }),

    /** List of peers to add. */
    Peers: Schema.nonEmptyArray(WireguardPeer),
}) {}
