/**
 * Helpers for generating Wireguard configurations.
 *
 * @since 1.0.0
 */

import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Array from "effect/Array";
import * as Chunk from "effect/Chunk";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as HashMap from "effect/HashMap";
import * as Match from "effect/Match";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as Tuple from "effect/Tuple";

import * as InternetSchemas from "./InternetSchemas.js";
import * as WireguardConfig from "./WireguardConfig.js";
import * as WireguardErrors from "./WireguardErrors.js";
import * as WireguardKey from "./WireguardKey.js";

/** @internal */
export type AllowedIpsMap<
    Peer extends
        | Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded | InternetSchemas.AddressFromStringEncoded>
        | Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded | InternetSchemas.AddressFromStringEncoded>,
> =
    | HashMap.HashMap<
          Peer[number],
          | "allowEverything"
          | Array.NonEmptyReadonlyArray<
                | Peer[number]
                | "allowAllDefinedPeers"
                | "allowWholeWireguardNetwork"
                | InternetSchemas.CidrBlockFromStringEncoded
            >
      >
    | "allPeersAllowEverything"
    | "allPeersAllowAllDefinedPeers"
    | "allPeersAllowWholeWireguardNetwork"
    | readonly ["allPeersAllowLan", Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>]
    | readonly [
          "allPeersAllowAllDefinedPeersAndLan",
          Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>,
      ]
    | readonly [
          "allPeersAllowWholeWireguardNetworkAndLan",
          Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>,
      ];

/** @internal */
export type DirectlyConnectedPeersMap<
    Peer extends
        | Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded | InternetSchemas.AddressFromStringEncoded>
        | Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded | InternetSchemas.AddressFromStringEncoded>,
> =
    | (HashMap.HashMap<
          Extract<Peer[number], InternetSchemas.SetupDataEncoded>,
          Array.NonEmptyReadonlyArray<Peer[number]>
      > &
          HashMap.HashMap<
              Extract<Peer[number], InternetSchemas.AddressFromStringEncoded>,
              Array.NonEmptyReadonlyArray<Extract<Peer[number], InternetSchemas.SetupDataEncoded>>
          >)
    | "stronglyConnected"
    | "weaklyConnected"
    | "connectNoPeers";

/** @internal */
export type GenerateReturn = Effect.Effect<
    readonly [
        hubConfig: WireguardConfig.WireguardConfig,
        spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
    ],
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
>;

/** @internal */
export type Options1<
    HubData1 extends InternetSchemas.SetupDataEncoded,
    PeerData1 extends Array.NonEmptyReadonlyArray<
        InternetSchemas.SetupDataEncoded | InternetSchemas.AddressFromStringEncoded
    >,
> = {
    hubData: HubData1;
    peerData: PeerData1;
    allowedIpsMap?: AllowedIpsMap<PeerData1> | undefined;
    directlyConnectedPeersMap?: DirectlyConnectedPeersMap<PeerData1> | undefined;
    preshareKeysMap?:
        | HashMap.HashMap<HubData1 | PeerData1[number], WireguardKey.WireguardKey | "generate">
        | "generateAll"
        | undefined;
};

/** @internal */
export type Options2<
    HubData2 extends InternetSchemas.EndpointEncoded,
    PeerData2 extends Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
> = {
    hubData: HubData2;
    peerData: PeerData2;
    cidrBlock: InternetSchemas.CidrBlockFromStringEncoded;
    addressStartingIndex?: number | undefined;
    allowedIpsMap?: AllowedIpsMap<PeerData2> | undefined;
    directlyConnectedPeersMap?: DirectlyConnectedPeersMap<PeerData2> | undefined;
    preshareKeysMap?:
        | HashMap.HashMap<HubData2 | PeerData2[number], WireguardKey.WireguardKey | "generate">
        | "generateAll"
        | undefined;
};

/** @internal */
export type Options3<HubData3 extends InternetSchemas.EndpointEncoded> = {
    hubData: HubData3;
    numberOfPeers: number;
    cidrBlock: InternetSchemas.CidrBlockFromStringEncoded;
    addressStartingIndex?: number | undefined;
    allowedIpsMap?: AllowedIpsMap<never> | undefined;
    directlyConnectedPeersMap?: DirectlyConnectedPeersMap<never> | undefined;
    preshareKeysMap?: HashMap.HashMap<HubData3, WireguardKey.WireguardKey | "generate"> | "generateAll" | undefined;
};

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/** @internal */
export const generate2 = <
    HubData extends InternetSchemas.IPv4SetupData | InternetSchemas.IPv6SetupData,
    PeerData extends HubData extends InternetSchemas.IPv4SetupData
        ? Array.NonEmptyReadonlyArray<InternetSchemas.IPv4SetupData | InternetSchemas.IPv4>
        : Array.NonEmptyReadonlyArray<InternetSchemas.IPv6SetupData | InternetSchemas.IPv6>,
    CidrBlock extends HubData extends InternetSchemas.IPv4SetupData
        ? InternetSchemas.CidrBlockBase<InternetSchemas.IPv4>
        : InternetSchemas.CidrBlockBase<InternetSchemas.IPv6>,
>(options: {
    hubData: HubData;
    peerData: PeerData;
    wireguardNetwork: CidrBlock;
    allowedIpsMap?:
        | HashMap.HashMap<
              PeerData[number],
              | "allowEverything"
              | Array.NonEmptyReadonlyArray<
                    | PeerData[number]
                    | "allowAllDefinedPeers"
                    | "allowWholeWireguardNetwork"
                    | InternetSchemas.CidrBlockFromStringEncoded
                >
          >
        | "allPeersAllowEverything"
        | "allPeersAllowAllDefinedPeers"
        | "allPeersAllowWholeWireguardNetwork"
        | readonly ["allPeersAllowLan", Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>]
        | readonly [
              "allPeersAllowAllDefinedPeersAndLan",
              Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>,
          ]
        | readonly [
              "allPeersAllowWholeWireguardNetworkAndLan",
              Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>,
          ]
        | undefined;
    directlyConnectedPeersMap?:
        | (HashMap.HashMap<
              Extract<PeerData[number], InternetSchemas.IPv4SetupData | InternetSchemas.IPv6SetupData>,
              Array.NonEmptyReadonlyArray<PeerData[number]>
          > &
              HashMap.HashMap<
                  Extract<PeerData[number], InternetSchemas.IPv4 | InternetSchemas.IPv6>,
                  Array.NonEmptyReadonlyArray<
                      Extract<PeerData[number], InternetSchemas.IPv4SetupData | InternetSchemas.IPv6SetupData>
                  >
              >)
        | "stronglyConnected"
        | "weaklyConnected"
        | "connectNoPeers"
        | undefined;
    preshareKeysMap?:
        | HashMap.HashMap<HubData | PeerData[number], WireguardKey.WireguardKey | "generate">
        | "generateAll"
        | undefined;
}): Effect.Effect<
    readonly [
        hubConfig: WireguardConfig.WireguardConfig,
        spokeConfigs: Array.NonEmptyReadonlyArray<WireguardConfig.WireguardConfig>,
    ],
    ParseResult.ParseError | WireguardErrors.WireguardError,
    never
> =>
    Effect.gen(function* () {
        // Collect all the ip addresses that will be used by all the peers
        const ips = Array.map(options.peerData, (_) => {
            if (Schema.is(InternetSchemas.IPv4SetupData)(_)) {
                return Tuple.getSecond(_);
            } else if (Schema.is(InternetSchemas.IPv6SetupData)(_)) {
                return Tuple.getSecond(_);
            } else if (Schema.is(InternetSchemas.Address)(_)) {
                return _;
            } else {
                return Function.absurd<InternetSchemas.Address>(_);
            }
        });

        // Convert the used ips to allowedIps
        const allDefinedIpsAsAllowedIps: Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded> =
            Array.map(ips, (_) => `${_}/32` as const);

        // Get the cidrBlock as a string
        const cidrBlockEncoded = yield* Schema.encode(InternetSchemas.CidrBlockFromString)(options.wireguardNetwork);

        // Helper for the whole wireguard network
        const wholeWireguardNetwork: Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded> = [
            cidrBlockEncoded,
        ];

        // Helper for all everything allowed ip entries
        const allowEverything: Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded> = ["0.0.0.0/0"];

        // Convert the preshareKeys to a HashMap if it's not already
        const preshareKeysMap = Function.pipe(
            Match.value(options?.preshareKeysMap),
            Match.when(Predicate.isUndefined, () =>
                HashMap.empty<HubData | PeerData[number], WireguardKey.WireguardKey>()
            ),
            Match.when(HashMap.isHashMap, (map) =>
                HashMap.map(map, (value) => (value === "generate" ? WireguardKey.generatePreshareKey() : value))
            ),
            Match.when("generateAll", () =>
                Function.pipe(
                    [options.hubData, ...options.peerData],
                    Array.map((peer) => Tuple.make(peer, WireguardKey.generatePreshareKey())),
                    HashMap.fromIterable
                )
            ),
            Match.exhaustive
        );

        // Convert the allowedIps to a HashMap if it's not already
        const allowedIpsMap = Function.pipe(
            Match.value(options.allowedIpsMap),
            Match.when(Predicate.isUndefined, () =>
                HashMap.empty<
                    PeerData[number],
                    Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                >()
            ),
            Match.when(
                HashMap.isHashMap,
                (
                    map
                ): HashMap.HashMap<
                    PeerData[number],
                    Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                > =>
                    HashMap.map(map, (value) =>
                        value === "allowEverything"
                            ? allowEverything
                            : Array.flatMap(
                                  value,
                                  (e): Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded> => {
                                      if (e === "allowAllDefinedPeers") {
                                          return allDefinedIpsAsAllowedIps;
                                      } else if (e === "allowWholeWireguardNetwork") {
                                          return wholeWireguardNetwork;
                                      } else if (Predicate.isString(e)) {
                                          return [e];
                                      } else {
                                          if (Schema.is(InternetSchemas.Address)(e)) {
                                              return [`${e.value}/32`];
                                          } else if (Schema.is(InternetSchemas.IPv4SetupData)(e)) {
                                              return [`${Tuple.getSecond(e)}/32`];
                                          } else if (Schema.is(InternetSchemas.IPv6SetupData)(e)) {
                                              return [`${Tuple.getSecond(e)}/32`];
                                          } else {
                                              return Function.absurd(e as never);
                                          }
                                      }
                                  }
                              )
                    )
            ),
            Match.when("allPeersAllowEverything", () =>
                HashMap.fromIterable(
                    Array.map(options.peerData, (peer: PeerData[number]) => Tuple.make(peer, allowEverything))
                )
            ),
            Match.when("allPeersAllowAllDefinedPeers", () =>
                HashMap.fromIterable(
                    Array.map(options.peerData, (peer: PeerData[number]) => Tuple.make(peer, allDefinedIpsAsAllowedIps))
                )
            ),
            Match.when("allPeersAllowWholeWireguardNetwork", () =>
                HashMap.fromIterable(
                    Array.map(options.peerData, (peer: PeerData[number]) => Tuple.make(peer, wholeWireguardNetwork))
                )
            ),
            Match.when(Array.isNonEmptyReadonlyArray, ([how, lans]) => {
                if (how === "allPeersAllowLan") {
                    return HashMap.fromIterable(
                        Array.map(options.peerData, (peer: PeerData[number]) => Tuple.make(peer, lans))
                    );
                } else if (how === "allPeersAllowAllDefinedPeersAndLan") {
                    return HashMap.fromIterable(
                        Array.map(options.peerData, (peer: PeerData[number]) =>
                            Tuple.make(peer, Array.appendAll(allDefinedIpsAsAllowedIps, lans))
                        )
                    );
                } else if (how === "allPeersAllowWholeWireguardNetworkAndLan") {
                    return HashMap.fromIterable(
                        Array.map(options.peerData, (peer: PeerData[number]) =>
                            Tuple.make(peer, Array.appendAll(wholeWireguardNetwork, lans))
                        )
                    );
                } else {
                    return Function.absurd<
                        HashMap.HashMap<
                            PeerData[number],
                            Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded>
                        >
                    >(how);
                }
            }),
            Match.exhaustive
        );

        // Convert the directlyConnectedPeers to a HashMap if it's not already
        const directlyConnectedPeersMap = Function.pipe(
            Match.value(options.directlyConnectedPeersMap),
            Match.when(Predicate.isUndefined, () => HashMap.empty()),
            Match.when(HashMap.isHashMap, (_) => Function.unsafeCoerce(_)),
            Match.when("stronglyConnected" as const, () => {
                return HashMap.fromIterable([]);
            }),
            Match.when("weaklyConnected" as const, () => {
                return HashMap.fromIterable([]);
            }),
            Match.when("connectNoPeers" as const, () => {
                return HashMap.fromIterable([]);
            }),
            Match.exhaustive
        );

        // Generate the keys for the hub
        const hubKeys = WireguardKey.generateKeyPair();
        const hubPreshareKey = HashMap.get(preshareKeysMap, options.hubData).pipe(Option.getOrUndefined);

        // const hubEndpoint = Schema.is(InternetSchemas.SetupDataEncoded)(options.hubData);

        // This hub peer config will be added to all the spoke interface configs
        const hubPeerConfig = {
            PresharedKey: hubPreshareKey,
            PublicKey: hubKeys.publicKey,
            Endpoint: Tuple.getFirst(options.hubData),
            AllowedIPs: new Set([`${Tuple.getSecond(hubSetupDataEncoded)}/32`] as const),
        };

        // All these spoke peer configs will be added to the hub interface config
        const peerPeerConfigs = Array.map(peerSetupDataBoth, ([spokeEncoded, spokeDecoded]) => {
            const keys = WireguardKey.generateKeyPair();
            const preshareKey = HashMap.get(preshareKeysMap, spokeEncoded).pipe(Option.getOrUndefined);
            const endpoint = Predicate.isString(spokeEncoded) ? undefined : Tuple.getFirst(spokeEncoded);
            const allowedIps = Predicate.isString(spokeEncoded)
                ? HashMap.get(allowedIpsMap, spokeEncoded).pipe(
                      Option.getOrElse(() => Array.empty<InternetSchemas.CidrBlockFromStringEncoded>())
                  )
                : HashMap.get(allowedIpsMap, Tuple.getFirst(spokeEncoded)).pipe(
                      Option.getOrElse(() => Array.empty<InternetSchemas.CidrBlockFromStringEncoded>())
                  );

            return {
                setupDataEncoded: spokeEncoded,
                setupDataDecoded: spokeDecoded,
                keys: {
                    preshareKey,
                    privateKey: keys.privateKey,
                },
                peerConfig: {
                    Endpoint: endpoint,
                    PresharedKey: preshareKey,
                    PublicKey: keys.publicKey,
                    AllowedIPs: new Set(allowedIps),
                },
            };
        });

        // // The hub will get all the peers added to it
        // const spokePeerConfigsBySetupData = Function.pipe(
        //     spokePeerConfigs,
        //     Array.map((peer) => Tuple.make(peer.setupDataEncoded, peer)),
        //     HashMap.fromIterable
        // );

        // // The hub interface config will have all the spoke peer configs
        // const hubConfig = yield* Schema.decode(WireguardConfig)({
        //     PrivateKey: hubKeys.privateKey,
        //     ListenPort: Tuple.getFirst(hubSetupData).listenPort,
        //     Peers: Array.map(spokePeerConfigs, ({ peerConfig }) => peerConfig),
        //     Address: `${Tuple.getSecond(hubSetupDataEncoded)}/${cidrBlock.mask}` as const,
        // });

        // // Each spoke interface config will have the hub peer config and the other peers from the trust map
        // const spokeConfigs = yield* Function.pipe(
        //     spokePeerConfigs,
        //     Array.map(({ keys: { privateKey }, setupDataDecoded, setupDataEncoded }) => {
        //         const listenPort = Schema.is(InternetSchemas.SetupData)(setupDataDecoded)
        //             ? Tuple.getFirst(setupDataDecoded).listenPort
        //             : 0;
        //         const address =
        //             `${Predicate.isString(setupDataEncoded) ? setupDataEncoded : Tuple.getSecond(setupDataEncoded)}/${cidrBlock.mask}` as const;

        //         const directConnections = Function.pipe(
        //             directlyConnectedPeersMap,
        //             HashMap.get(setupDataEncoded),
        //             Option.getOrElse(() => Array.empty()),
        //             Array.map((friend) => HashMap.get(spokePeerConfigsBySetupData, friend)),
        //             Array.map(Option.getOrThrow),
        //             Array.map(({ peerConfig }) => peerConfig)
        //         );

        // return Schema.decode(WireguardConfig)({
        //     Address: address,
        //     ListenPort: listenPort,
        //     PrivateKey: privateKey,
        //     Peers: [hubPeerConfig, ...directConnections],
        // });
        //     }),
        //     Effect.allWith()
        // );

        // return Tuple.make(hubConfig, spokeConfigs);
        return {} as any;
    });

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

/** @internal */
const transformPresharedKeysMap = <
    HubData extends InternetSchemas.SetupDataEncoded | InternetSchemas.EndpointEncoded,
    PeerData extends
        | Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded | InternetSchemas.AddressFromStringEncoded>
        | Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded | InternetSchemas.AddressFromStringEncoded>,
>(input: {
    peerData: PeerData;
    preshareKeysMap?:
        | HashMap.HashMap<HubData | PeerData[number], WireguardKey.WireguardKey | "generate">
        | "generateAll"
        | undefined;
}): HashMap.HashMap<HubData | PeerData[number], WireguardKey.WireguardKey> =>
    Function.pipe(
        Match.value(input?.preshareKeysMap),
        Match.when(Predicate.isUndefined, () => HashMap.empty()),
        Match.when(HashMap.isHashMap, (map) =>
            HashMap.map(map, (value) => (value === "generate" ? WireguardKey.generatePreshareKey() : value))
        ),
        Match.when("generateAll", () =>
            Function.pipe(
                input.peerData,
                Array.map((spoke) => Tuple.make(spoke, WireguardKey.generatePreshareKey())),
                HashMap.fromIterable
            )
        ),
        Match.exhaustive
    );

/** @internal */
const transformAllowedIpsMap = <
    PeerData extends
        | Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded | InternetSchemas.AddressFromStringEncoded>
        | Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
>(input: {
    peerData: PeerData;
    allowedIpsMap?: AllowedIpsMap<PeerData> | undefined;
    cidrBlock: InternetSchemas.CidrBlockBase<InternetSchemas.IPv4 | InternetSchemas.IPv6>;
    ips: Array.NonEmptyReadonlyArray<InternetSchemas.IPv4> | Array.NonEmptyReadonlyArray<InternetSchemas.IPv6>;
}): HashMap.HashMap<PeerData[number], InternetSchemas.CidrBlockFromStringEncoded> =>
    Function.pipe(
        Match.value(input.allowedIpsMap),
        Match.when(Predicate.isUndefined, () => HashMap.empty()),
        Match.when(HashMap.isHashMap, (map) =>
            HashMap.map(map, (value) => {
                if (value === "allowEverything") {
                    return "0.0.0.0/0" as const;
                } else {
                    return Array.flatMap(value, (v) => {
                        if (v === "allowAllDefinedPeers") {
                            return input.ips.map((_) => `${_}/32` as const);
                        } else if (v === "allowWholeWireguardNetwork") {
                            return [`${input.cidrBlock.ip.value}/${input.cidrBlock.mask}` as const];
                        } else if (Predicate.isString(v)) {
                            return [v];
                        } else {
                            return [];
                        }
                    });
                }
            })
        ),
        Match.when("AllPeersAllowEverything", () =>
            HashMap.fromIterable(Array.map(input.peerData, (spoke) => Tuple.make(spoke, ["0.0.0.0/0"] as const)))
        ),
        Match.when("AllPeersAllowAllDefinedPeers", () => {
            const allowedIps = Array.map(input.peerData, (spoke) =>
                Tuple.make(
                    spoke,
                    input.ips.map((_) => `${_}/32` as const)
                )
            );
            return HashMap.fromIterable(allowedIps);
        }),
        Match.when("AllPeersAllowWholeWireguardNetwork", () => {
            const allowedIps = Array.map(input.peerData, (spoke) =>
                Tuple.make(spoke, [`${input.cidrBlock.ip.value}/${input.cidrBlock.mask}`] as const)
            );
            return HashMap.fromIterable(allowedIps);
        }),
        Match.when(Array.isNonEmptyReadonlyArray, ([how, moreOptions]) => {
            const lans: Array.NonEmptyReadonlyArray<InternetSchemas.CidrBlockFromStringEncoded> = Predicate.isString(
                moreOptions
            )
                ? [moreOptions]
                : moreOptions;
            if (how === "AllPeersAllowLan") {
                return HashMap.fromIterable(Array.map(input.peerData, (spoke) => Tuple.make(spoke, lans)));
            } else if (how === "AllPeersAllowAllDefinedPeersAndLan") {
                return HashMap.fromIterable(
                    Array.map(input.peerData, (spoke) =>
                        Tuple.make(spoke, [...input.ips.map((_) => `${_}/32` as const), ...lans])
                    )
                );
            } else if (how === "AllPeersAllowWholeWireguardNetworkAndLan") {
                return HashMap.fromIterable(
                    Array.map(input.peerData, (spoke) =>
                        Tuple.make(spoke, [
                            ...([`${input.cidrBlock.ip.value}/${input.cidrBlock.mask}`] as const),
                            ...lans,
                        ])
                    )
                );
            }
            return Function.absurd(how);
        }),
        Match.exhaustive
    );

const transformDirectlyConnectedPeersMap = <
    PeerData extends
        | Array.NonEmptyReadonlyArray<InternetSchemas.SetupDataEncoded | InternetSchemas.AddressFromStringEncoded>
        | Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
>(input: {
    peerData: PeerData;
    directlyConnectedPeersMap?: DirectlyConnectedPeersMap<PeerData> | undefined;
}): HashMap.HashMap<
    Extract<PeerData[number], InternetSchemas.SetupDataEncoded>,
    Array.NonEmptyReadonlyArray<PeerData[number]>
> &
    HashMap.HashMap<
        Extract<PeerData[number], InternetSchemas.AddressFromStringEncoded>,
        Array.NonEmptyReadonlyArray<Extract<PeerData[number], InternetSchemas.SetupDataEncoded>>
    > =>
    Function.pipe(
        Match.value(input.directlyConnectedPeersMap),
        Match.when(Predicate.isUndefined, () => HashMap.empty()),
        Match.when(HashMap.isHashMap, (_) => Function.unsafeCoerce(_)),
        Match.when("stronglyConnected" as const, () => {
            return HashMap.fromIterable([]);
        }),
        Match.when("weaklyConnected" as const, () => {
            return HashMap.fromIterable([]);
        }),
        Match.when("connectNoPeers" as const, () => {
            return HashMap.fromIterable([]);
        }),
        Match.exhaustive
    );

/**
 * Generates a collection of wireguard configurations. This function has a
 * couple of different overloads and many options, you probably want to use one
 * of the more specified generator helpers unless you really know what you are
 * doing.
 *
 * @since 1.0.0
 * @category Constructors
 */
export const generate: {
    /**
     * Overload for when cidrBlock is not provided. The hub data must be setup
     * data - which is a tuple with ipv4, ipv6, or hostname endpoint followed by
     * an ipv4 or ipv6 address. Every peer can either be a setup data tuple if
     * the endpoint is static/known or just an address if its endpoint will be
     * dynamic/unknown. The preshareKeysMap enables defining a preshared key for
     * the hub node or any of the peer nodes by using their setup data or
     * endpoint as the key. The allowedIpsMap enables defining which peers are
     * allowed to communicate with each other and the LAN. The
     * directlyConnectedPeersMap enables defining which peers are directly
     * connected to each other with additional peer entries in their configs.
     * One should not attempt to directly connect two dynamic peers (peers
     * without endpoints), though, as that doesn't make sense since there is no
     * channel for them to communicate the necessary information about where
     * they are (this is not Tailscale).
     */
    <
        HubData extends InternetSchemas.SetupDataEncoded,
        PeerData extends Array.NonEmptyReadonlyArray<
            InternetSchemas.SetupDataEncoded | InternetSchemas.AddressFromStringEncoded
        >,
    >(
        options: Options1<HubData, PeerData>
    ): GenerateReturn;
    /**
     * Overload for when cidrBlock and spoke data are provided. The hub data
     * must be an endpoint, it will be assigned an address from the cidrBlock
     * address pool. In this configuration, peers that are static and have know
     * endpoints supply just their endpoints in the peerData field. There is no
     * information to provide for peers with dynamic/unknown endpoints as they
     * will be assigned an address from the cidrBlock address pool so these
     * peers can be requested by number in the additionPeers field.
     */
    <
        HubData extends InternetSchemas.EndpointEncoded,
        PeerData extends Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
    >(
        options: Options2<HubData, PeerData>
    ): GenerateReturn;
    /**
     * Overload for when cidrBlock is provided and no spoke data is provided.
     * The hub data must be an endpoint, it will be assigned an address from the
     * cidrBlock address pool. In the configuration, no peer data is provided
     * and the number of peers to generate is defined by the numberOfPeers
     * field. Since there is no peer data to provide, the preshareKeys and
     * trustMap fields can not be hash maps like above.
     */
    <HubData extends InternetSchemas.EndpointEncoded>(options: Options3<HubData>): GenerateReturn;
} = <
    HubData1 extends InternetSchemas.SetupDataEncoded,
    HubData2 extends InternetSchemas.EndpointEncoded,
    HubData3 extends InternetSchemas.EndpointEncoded,
    PeerData1 extends Array.NonEmptyReadonlyArray<
        InternetSchemas.SetupDataEncoded | InternetSchemas.AddressFromStringEncoded
    >,
    PeerData2 extends Array.NonEmptyReadonlyArray<InternetSchemas.EndpointEncoded>,
    Options extends Options1<HubData1, PeerData1> | Options2<HubData2, PeerData2> | Options3<HubData3>,
>(
    options: Options
): GenerateReturn =>
    Effect.gen(function* () {
        // FIXME: get rid of these helper types
        type A = Array.NonEmptyReadonlyArray<InternetSchemas.IPv4> | Array.NonEmptyReadonlyArray<InternetSchemas.IPv6>;
        type B = Stream.Stream<InternetSchemas.IPv4 | InternetSchemas.IPv6, ParseResult.ParseError, never>;

        type On123Return<On1, On2, On3> =
            Options extends Options1<HubData1, PeerData1>
                ? On1
                : Options extends Options2<HubData2, PeerData2>
                  ? On2
                  : Options extends Options3<HubData3>
                    ? On3
                    : never;

        // Helper function to dispatch to the correct on function based on the context
        const on123WithContext = <A, B, C, On1, On2, On3>(
            additionalContext: On123Return<A, B, C>,
            {
                on1,
                on2,
                on3,
            }: {
                on1: (context: Options1<HubData1, PeerData1>, additionalContext: A) => On1;
                on2: (context: Options2<HubData2, PeerData2>, additionalContext: B) => On2;
                on3: (context: Options3<HubData3>, additionalContext: C) => On3;
            }
        ): On123Return<On1, On2, On3> => {
            const is1 = (_context: Record<string, unknown>): _context is Options1<HubData1, PeerData1> =>
                Array.isArray(_context.hubData);
            const is2 = (_context: Record<string, unknown>): _context is Options2<HubData2, PeerData2> =>
                "cidrBlock" in _context && "peerData" in _context;
            const is3 = (_context: Record<string, unknown>): _context is Options3<HubData3> =>
                "numberOfPeers" in _context;

            if (is1(options)) {
                return on1(options, additionalContext as unknown as A) as On123Return<On1, On2, On3>;
            } else if (is2(options)) {
                return on2(options, additionalContext as unknown as B) as On123Return<On1, On2, On3>;
            } else if (is3(options)) {
                return on3(options, additionalContext as unknown as C) as On123Return<On1, On2, On3>;
            } else {
                return Function.absurd<On123Return<On1, On2, On3>>(options);
            }
        };

        // Helper function to dispatch to the correct on function based on the context
        const on123 = <On1, On2, On3>({
            on1,
            on2,
            on3,
        }: {
            on1: (context: Options1<HubData1, PeerData1>) => On1;
            on2: (context: Options2<HubData2, PeerData2>) => On2;
            on3: (context: Options3<HubData3>) => On3;
        }): On123Return<On1, On2, On3> =>
            on123WithContext(undefined as On123Return<never, never, never>, { on1, on2, on3 });

        // Decode the number of peers
        const numPeers = yield* on123({
            on1: (context) => Effect.succeed(context.peerData.length),
            on2: (context) => Effect.succeed(context.peerData.length),
            on3: (context) => Schema.decode(Schema.nonNegative()(Schema.Int))(context.numberOfPeers),
        });

        // Collect all the ip addresses that will be used by all the peers
        const ips = yield* on123({
            on1: (context) =>
                Function.pipe(
                    context.peerData.map((_) => (Predicate.isString(_) ? _ : Tuple.getSecond(_))),
                    Array.map((_) => Schema.decode(InternetSchemas.AddressFromString)(_)),
                    Effect.allWith(),
                    Effect.map((_) => _ as unknown as A)
                ),
            on2: (context) =>
                Function.pipe(
                    Schema.decode(InternetSchemas.CidrBlockFromString)(context.cidrBlock),
                    Effect.map((cidrBlock) => cidrBlock.range as B),
                    Stream.unwrap,
                    Stream.drop(context.addressStartingIndex ?? 0),
                    Stream.run(Sink.collectAllN(numPeers + 1)),
                    Effect.map(Chunk.toArray),
                    Effect.map((_) => _ as unknown as A)
                ),
            on3: (context) =>
                Function.pipe(
                    Schema.decode(InternetSchemas.CidrBlockFromString)(context.cidrBlock),
                    Effect.map((cidrBlock) => cidrBlock.range as B),
                    Stream.unwrap,
                    Stream.drop(context.addressStartingIndex ?? 0),
                    Stream.run(Sink.collectAllN(numPeers + 1)),
                    Effect.map(Chunk.toArray),
                    Effect.map((_) => _ as unknown as A)
                ),
        });

        // If the user provided a cidrBlock, then the address that is used for all the hub
        // and peer address is easy to compute. Otherwise, we must derive a cidrBlock that
        // would include all the addresses we plan to use.
        const cidrBlock = yield* on123({
            on1: (_context) => InternetSchemas.CidrBlockBase.cidrBlockForRange(ips),
            on2: (context) => Schema.decode(InternetSchemas.CidrBlockFromString)(context.cidrBlock),
            on3: (context) => Schema.decode(InternetSchemas.CidrBlockFromString)(context.cidrBlock),
        });

        // Bounds checking on the cidr block
        // TODO: do I even need this with Sink.CollectionALlN
        if ("cidrBlock" in options && cidrBlock.total < numPeers + 1) {
            return yield* new WireguardErrors.WireguardError({
                message: `Not enough IPs in the CIDR block for ${numPeers + 1} peers`,
            });
        }

        // Convert hub data to SetupDataEncoded
        const hubSetupDataEncoded = on123({
            on1: (context) => context.hubData,
            on2: (context) => Tuple.make(context.hubData, ips[0].value),
            on3: (context) => Tuple.make(context.hubData, ips[0].value),
        });

        // Convert spoke data to SetupDataEncoded or just an Address
        const peerSetupDataEncoded = on123({
            on1: (context) => context.peerData,
            on2: (context) => Array.map(context.peerData, (peer) => Tuple.make(peer, ips.at(1)?.value ?? "")),
            on3: (context) => Array.makeBy(context.numberOfPeers, (index) => ips.at(index + 1)?.value ?? ""),
        });

        // Decode all SetupData inputs
        const hubSetupData = yield* Schema.decode(InternetSchemas.SetupData)(hubSetupDataEncoded);
        const peerSetupData = on123WithContext(peerSetupDataEncoded, {
            on1: (context, peerSetupDataEncoded) =>
                Effect.all(
                    Array.map(peerSetupDataEncoded, (spoke) =>
                        Schema.decode(Schema.Union(InternetSchemas.SetupData, InternetSchemas.AddressFromString))(spoke)
                    )
                ),
            on2: (context, peerSetupDataEncoded) =>
                Effect.all(
                    Array.map(peerSetupDataEncoded, (spoke) =>
                        Schema.decode(Schema.Union(InternetSchemas.SetupData, InternetSchemas.AddressFromString))(spoke)
                    )
                ),
            on3: (context, peerSetupDataEncoded) =>
                Effect.all(
                    Array.map(peerSetupDataEncoded, (spoke) =>
                        Schema.decode(Schema.Union(InternetSchemas.SetupData, InternetSchemas.AddressFromString))(spoke)
                    )
                ),
        });
        const peerSetupDataBoth = Array.zip(peerSetupDataEncoded, peerSetupData);

        // Convert the preshareKeys to a HashMap if it's not already
        const preshareKeysMap = on123WithContext(peerSetupDataEncoded, {
            on1: (context) => transformPresharedKeysMap(context),
            on2: (context) => transformPresharedKeysMap(context),
            on3: (context, peerData) =>
                transformPresharedKeysMap({
                    peerData,
                    preshareKeysMap: context.preshareKeysMap,
                }),
        });

        // Convert the allowedIps to a HashMap if it's not already
        const allowedIpsMap = on123WithContext(peerSetupDataEncoded, {
            on1: (context) => transformPresharedKeysMap(context),
            on2: (context) => transformPresharedKeysMap(context),
            on3: (context, peerData) =>
                transformAllowedIpsMap({
                    ips,
                    peerData,
                    cidrBlock,
                    allowedIpsMap: context.allowedIpsMap,
                }),
        });

        // Convert the directlyConnectedPeers to a HashMap if it's not already
        const directlyConnectedPeersMap = on123WithContext(peerSetupDataEncoded, {
            on1: (context) => transformDirectlyConnectedPeersMap(context),
            on2: (context) => transformDirectlyConnectedPeersMap(context),
            on3: (context, peerData) =>
                transformDirectlyConnectedPeersMap({
                    peerData,
                    directlyConnectedPeersMap: context.directlyConnectedPeersMap,
                }),
        });

        // Generate the keys for the hub
        const hubKeys = WireguardKey.generateKeyPair();
        const hubPreshareKey = on123WithContext(preshareKeysMap, {
            on1: (context, preshareKeysMap) => HashMap.get(preshareKeysMap, context.hubData),
            on2: (context, preshareKeysMap) => HashMap.get(preshareKeysMap, context.hubData),
            on3: (context, preshareKeysMap) => HashMap.get(preshareKeysMap, context.hubData),
        }).pipe(Option.getOrUndefined);

        // Array.isArray(hubSetupDataEncoded)
        //     ? HashMap.get(preshareKeysMap, Tuple.getFirst(hubSetupDataEncoded)).pipe(Option.getOrUndefined)
        //     : HashMap.get(preshareKeysMap, hubSetupDataEncoded).pipe(Option.getOrUndefined);

        // This hub peer config will be added to all the spoke interface configs
        const hubPeerConfig = {
            PresharedKey: hubPreshareKey,
            PublicKey: hubKeys.publicKey,
            Endpoint: Tuple.getFirst(hubSetupDataEncoded),
            AllowedIPs: new Set([`${Tuple.getSecond(hubSetupDataEncoded)}/32`] as const),
        };

        // All these spoke peer configs will be added to the hub interface config
        const peerPeerConfigs = Array.map(peerSetupDataBoth, ([spokeEncoded, spokeDecoded]) => {
            const keys = WireguardKey.generateKeyPair();
            const preshareKey = HashMap.get(preshareKeysMap, spokeEncoded).pipe(Option.getOrUndefined);
            const endpoint = Predicate.isString(spokeEncoded) ? undefined : Tuple.getFirst(spokeEncoded);
            const allowedIps = Predicate.isString(spokeEncoded)
                ? HashMap.get(allowedIpsMap, spokeEncoded).pipe(
                      Option.getOrElse(() => Array.empty<InternetSchemas.CidrBlockFromStringEncoded>())
                  )
                : HashMap.get(allowedIpsMap, Tuple.getFirst(spokeEncoded)).pipe(
                      Option.getOrElse(() => Array.empty<InternetSchemas.CidrBlockFromStringEncoded>())
                  );

            return {
                setupDataEncoded: spokeEncoded,
                setupDataDecoded: spokeDecoded,
                keys: {
                    preshareKey,
                    privateKey: keys.privateKey,
                },
                peerConfig: {
                    Endpoint: endpoint,
                    PresharedKey: preshareKey,
                    PublicKey: keys.publicKey,
                    AllowedIPs: new Set(allowedIps),
                },
            };
        });

        // // The hub will get all the peers added to it
        // const spokePeerConfigsBySetupData = Function.pipe(
        //     spokePeerConfigs,
        //     Array.map((peer) => Tuple.make(peer.setupDataEncoded, peer)),
        //     HashMap.fromIterable
        // );

        // // The hub interface config will have all the spoke peer configs
        // const hubConfig = yield* Schema.decode(WireguardConfig)({
        //     PrivateKey: hubKeys.privateKey,
        //     ListenPort: Tuple.getFirst(hubSetupData).listenPort,
        //     Peers: Array.map(spokePeerConfigs, ({ peerConfig }) => peerConfig),
        //     Address: `${Tuple.getSecond(hubSetupDataEncoded)}/${cidrBlock.mask}` as const,
        // });

        // // Each spoke interface config will have the hub peer config and the other peers from the trust map
        // const spokeConfigs = yield* Function.pipe(
        //     spokePeerConfigs,
        //     Array.map(({ keys: { privateKey }, setupDataDecoded, setupDataEncoded }) => {
        //         const listenPort = Schema.is(InternetSchemas.SetupData)(setupDataDecoded)
        //             ? Tuple.getFirst(setupDataDecoded).listenPort
        //             : 0;
        //         const address =
        //             `${Predicate.isString(setupDataEncoded) ? setupDataEncoded : Tuple.getSecond(setupDataEncoded)}/${cidrBlock.mask}` as const;

        //         const directConnections = Function.pipe(
        //             directlyConnectedPeersMap,
        //             HashMap.get(setupDataEncoded),
        //             Option.getOrElse(() => Array.empty()),
        //             Array.map((friend) => HashMap.get(spokePeerConfigsBySetupData, friend)),
        //             Array.map(Option.getOrThrow),
        //             Array.map(({ peerConfig }) => peerConfig)
        //         );

        //         return Schema.decode(WireguardConfig)({
        //             Address: address,
        //             ListenPort: listenPort,
        //             PrivateKey: privateKey,
        //             Peers: [hubPeerConfig, ...directConnections],
        //         });
        //     }),
        //     Effect.allWith()
        // );

        // return Tuple.make(hubConfig, spokeConfigs);
        return {} as any;
    });
