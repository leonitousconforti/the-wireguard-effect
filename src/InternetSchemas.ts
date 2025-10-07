/**
 * Internet schemas for wireguard configuration.
 *
 * @since 1.0.0
 */

import * as WireguardInternetSchemas from "effect/Duration";
import * as Predicate from "effect/Predicate";
import * as Schema from "effect/Schema";

import { IPv4, IPv4Family, IPv6, IPv6Family, Port } from "effect-schemas/Internet";
import * as internal from "./internal/internetSchemas.ts";

/**
 * Transforms a `number` of seconds into a `Duration`.
 *
 * @since 1.0.0
 * @category Schemas
 */
export class DurationFromSeconds extends Schema.transform(Schema.Int, Schema.DurationFromSelf, {
    decode: WireguardInternetSchemas.seconds,
    encode: WireguardInternetSchemas.toSeconds,
}).annotations({
    identifier: "DurationFromSeconds",
    description: "A duration from a number of seconds",
}) {}

/**
 * Transforms a `string` of seconds into a `Duration`.
 *
 * @since 1.0.0
 * @category Schemas
 */
export class DurationFromSecondsString extends Schema.compose(Schema.NumberFromString, DurationFromSeconds).annotations(
    {
        identifier: "DurationFromSecondsString",
        description: "A duration from a string of seconds",
    }
) {}

/**
 * An IPv4 wireguard endpoint, which consists of an IPv4 address followed by a
 * nat port then an optional local port. If only one port is provided, it is
 * assumed that the nat port and listen port are the same.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     ```ts
 *
 *     import * as assert from "node:assert";
 *
 *     import * as Schema from "effect/Schema";
 *     import { IPv4Endpoint } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeEndpoint = Schema.decodeSync(IPv4Endpoint);
 *     const endpoint1 = decodeEndpoint("1.2.3.4:51820");
 *     const endpoint2 = decodeEndpoint("1.2.3.4:51820:41820");
 *
 *     const endpoint3 = decodeEndpoint({
 *         ip: "1.2.3.4",
 *         port: 51820,
 *         family: "ipv4",
 *     });
 *
 *     const endpoint4 = decodeEndpoint({
 *         ip: "1.2.3.4",
 *         natPort: 51820,
 *         listenPort: 41820,
 *         family: "ipv4",
 *     });
 *     ```;
 */
export class IPv4Endpoint extends Schema.transform(
    Schema.Union(
        Schema.Struct({ ip: Schema.String, port: Schema.Number, family: IPv4Family }),
        Schema.Struct({ ip: Schema.String, natPort: Schema.Number, listenPort: Schema.Number, family: IPv4Family }),
        Schema.TemplateLiteral(Schema.String, Schema.Literal(":"), Schema.Number),
        Schema.TemplateLiteral(Schema.String, Schema.Literal(":"), Schema.Number, Schema.Literal(":"), Schema.Number)
    ),
    Schema.Struct({ address: IPv4, natPort: Port, listenPort: Port }),
    {
        decode: (data) => {
            const isObjectInput = !Predicate.isString(data);
            const [ip, natPort, listenPort] = isObjectInput
                ? ([
                      data.ip,
                      "natPort" in data ? (`${data.natPort}` as const) : (`${data.port}` as const),
                      "listenPort" in data ? (`${data.listenPort}` as const) : undefined,
                  ] as const)
                : internal.splitLiteral(data, ":");

            const natPortParsed = Number.parseInt(natPort, 10);
            const listenPortParsed = Predicate.isNotUndefined(listenPort)
                ? Number.parseInt(listenPort, 10)
                : natPortParsed;
            return { address: ip, natPort: natPortParsed, listenPort: listenPortParsed };
        },
        encode: ({ address, listenPort, natPort }) => `${address}:${natPort}:${listenPort}` as const,
    }
).annotations({
    identifier: "IPv4Endpoint",
    description: "An ipv4 wireguard endpoint",
}) {}

/**
 * An IPv6 wireguard endpoint, which consists of an IPv6 address in square
 * brackets followed by a nat port then an optional local port. If only one port
 * is provided, it is assumed that the nat port and listen port are the same.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     ```ts
 *
 *     import * as assert from "node:assert";
 *
 *     import * as Schema from "effect/Schema";
 *     import { IPv6Endpoint } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeEndpoint = Schema.decodeSync(IPv6Endpoint);
 *     const endpoint1 = decodeEndpoint(
 *         "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820"
 *     );
 *     const endpoint2 = decodeEndpoint(
 *         "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820"
 *     );
 *
 *     const endpoint3 = decodeEndpoint({
 *         ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *         port: 51820,
 *         family: "ipv6",
 *     });
 *
 *     const endpoint4 = decodeEndpoint({
 *         ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *         natPort: 51820,
 *         listenPort: 41820,
 *         family: "ipv6",
 *     });
 *     ```;
 */
export class IPv6Endpoint extends Schema.transform(
    Schema.Union(
        Schema.Struct({ ip: Schema.String, port: Schema.Number, family: IPv6Family }),
        Schema.Struct({ ip: Schema.String, natPort: Schema.Number, listenPort: Schema.Number, family: IPv6Family }),
        Schema.TemplateLiteral(
            Schema.Literal("["),
            Schema.String,
            Schema.Literal("]"),
            Schema.Literal(":"),
            Schema.Number
        ),
        Schema.TemplateLiteral(
            Schema.Literal("["),
            Schema.String,
            Schema.Literal("]"),
            Schema.Literal(":"),
            Schema.Number,
            Schema.Literal(":"),
            Schema.Number
        )
    ),
    Schema.Struct({ address: IPv6, natPort: Port, listenPort: Port }),
    {
        decode: (data) => {
            const isObjectInput = !Predicate.isString(data);
            const [ip, natPort, listenPort] = isObjectInput
                ? ([
                      data.ip,
                      "natPort" in data ? (`${data.natPort}` as const) : (`${data.port}` as const),
                      "listenPort" in data ? (`${data.listenPort}` as const) : undefined,
                  ] as const)
                : ([
                      internal.splitLiteral(data, "]")[0].slice(1),
                      ...internal.tail(internal.splitLiteral(internal.splitLiteral(data, "]")[1], ":")),
                  ] as const);

            const natPortParsed = Number.parseInt(natPort, 10);
            const listenPortParsed = Predicate.isNotUndefined(listenPort)
                ? Number.parseInt(listenPort, 10)
                : natPortParsed;
            return { address: ip.slice(1), natPort: natPortParsed, listenPort: listenPortParsed } as const;
        },
        encode: ({ address, listenPort, natPort }) => `[${address}]:${natPort}:${listenPort}` as const,
    }
).annotations({
    identifier: "IPv6Endpoint",
    description: "An ipv6 wireguard endpoint",
}) {}

/**
 * A hostname wireguard endpoint, which consists of a hostname followed by a\
 * Nat port then an optional local port. If only one port is provided, it is
 * assumed that the nat port and listen port are the same.
 *
 * @since 1.0.0
 * @category Schemas
 */
export class HostnameEndpoint extends Schema.transform(
    Schema.Union(
        Schema.Struct({ host: Schema.String, port: Schema.Number }),
        Schema.Struct({ host: Schema.String, natPort: Schema.Number, listenPort: Schema.Number }),
        Schema.TemplateLiteral(Schema.String, Schema.Literal(":"), Schema.Number),
        Schema.TemplateLiteral(Schema.String, Schema.Literal(":"), Schema.Number, Schema.Literal(":"), Schema.Number)
    ),
    Schema.Struct({ host: Schema.String, natPort: Port, listenPort: Port }),
    {
        decode: (data) => {
            const isObjectInput = !Predicate.isString(data);
            const [host, natPort, listenPort] = isObjectInput
                ? ([
                      data.host,
                      "natPort" in data ? (`${data.natPort}` as const) : (`${data.port}` as const),
                      "listenPort" in data ? (`${data.listenPort}` as const) : undefined,
                  ] as const)
                : internal.splitLiteral(data, ":");

            const natPortParsed = Number.parseInt(natPort, 10);
            const listenPortParsed = Predicate.isNotUndefined(listenPort)
                ? Number.parseInt(listenPort, 10)
                : natPortParsed;
            return { host, natPort: natPortParsed, listenPort: listenPortParsed };
        },
        encode: ({ host, listenPort, natPort }) => `${host}:${natPort}:${listenPort}` as const,
    }
).annotations({
    identifier: "HostnameEndpoint",
    description: "A hostname endpoint",
}) {}

/**
 * A wireguard endpoint, which is either an IPv4 or IPv6 endpoint.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
 *
 *     import { Endpoint } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeEndpoint = Schema.decodeSync(Endpoint);
 *     const endpoint1 = decodeEndpoint("1.2.3.4:51820");
 *     const endpoint2 = decodeEndpoint("1.2.3.4:51820:41820");
 *
 *     const endpoint3 = decodeEndpoint({
 *         ip: "1.2.3.4",
 *         port: 51820,
 *         family: "ipv4",
 *     });
 *
 *     const endpoint4: Endpoint = decodeEndpoint({
 *         ip: "1.2.3.4",
 *         natPort: 51820,
 *         listenPort: 41820,
 *         family: "ipv4",
 *     });
 *
 *     const endpoint5 = decodeEndpoint(
 *         "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820"
 *     );
 *     const endpoint6 = decodeEndpoint(
 *         "[2001:0db8:85a3:0000:0000:8a2e:0370:7334]:51820:41820"
 *     );
 *
 *     const endpoint7 = decodeEndpoint({
 *         ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *         port: 51820,
 *         family: "ipv6",
 *     });
 *
 *     const endpoint8: Endpoint = decodeEndpoint({
 *         ip: "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
 *         natPort: 51820,
 *         listenPort: 41820,
 *         family: "ipv6",
 *     });
 *     ```;
 */
export class Endpoint extends Schema.Union(IPv4Endpoint, IPv6Endpoint, HostnameEndpoint).annotations({
    identifier: "Endpoint",
    description: "An ipv4, ipv6, or hostname wireguard endpoint",
}) {}

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
 *     import { SetupData } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeSetupData = Schema.decodeSync(SetupData);
 *     const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"]);
 *     ```;
 */
export class IPv4SetupData extends Schema.Tuple(IPv4Endpoint, IPv4).annotations({
    identifier: "SetupData",
    description: "A wireguard setup data",
}) {}

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     import * as Schema from "effect/Schema";
 *     import { SetupData } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeSetupData = Schema.decodeSync(SetupData);
 *     const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"]);
 *     ```;
 */
export class IPv6SetupData extends Schema.Tuple(IPv6Endpoint, IPv6).annotations({
    identifier: "SetupData",
    description: "A wireguard setup data",
}) {}

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Schemas
 * @see {@link IPv4}
 * @see {@link HostnameEndpoint}
 */
export class HostnameIPv4SetupData extends Schema.Tuple(HostnameEndpoint, IPv4).annotations({
    identifier: "HostnameIPv4SetupData",
    description: "A wireguard hostname+ipv4 setup data",
}) {}

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Schemas
 * @see {@link IPv6}
 * @see {@link HostnameEndpoint}
 */
export class HostnameIPv6SetupData extends Schema.Tuple(HostnameEndpoint, IPv6).annotations({
    identifier: "HostnameIPv6SetupData",
    description: "A wireguard hostname+ipv6 setup data",
}) {}

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Schemas
 * @example
 *     ```ts
 *
 *     import * as assert from "node:assert";
 *
 *     import * as Schema from "effect/Schema";
 *     import { SetupData } from "the-wireguard-effect/InternetSchemas";
 *
 *     const decodeSetupData = Schema.decodeSync(SetupData);
 *     const setupData = decodeSetupData(["1.1.1.1:51280", "10.0.0.1"]);
 *     ```;
 *
 * @see {@link Address}
 * @see {@link Endpoint}
 */
export class SetupData extends Schema.Union(
    IPv4SetupData,
    IPv6SetupData,
    HostnameIPv4SetupData,
    HostnameIPv6SetupData
).annotations({
    identifier: "SetupData",
    description: "A wireguard setup data",
}) {}
