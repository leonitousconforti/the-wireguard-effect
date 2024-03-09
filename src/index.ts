import * as Socket from "@effect/experimental/Socket/Node";
import * as Platform from "@effect/platform";
import * as ParseResult from "@effect/schema/ParseResult";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as Chunk from "effect/Chunk";
import * as Console from "effect/Console";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Match from "effect/Match";
import * as Number from "effect/Number";
import * as Option from "effect/Option";
import * as Predicate from "effect/Predicate";
import * as ReadonlyArray from "effect/ReadonlyArray";
import * as ReadonlyRecord from "effect/ReadonlyRecord";
import * as Scope from "effect/Scope";
import * as Sink from "effect/Sink";
import * as Stream from "effect/Stream";
import * as String from "effect/String";
import * as Tuple from "effect/Tuple";
import * as execa from "execa";
import * as ini from "ini";
import * as crypto from "node:crypto";
import * as os from "node:os";

/** @see https://stackoverflow.com/questions/70831365/can-i-slice-literal-type-in-typescript */
type Split<S extends string, D extends string> = string extends S | ""
    ? string[]
    : S extends `${infer T}${D}${infer U}`
      ? [T, ...Split<U, D>]
      : [S];

/**
 * An operating system port number.
 *
 * @since 1.0.0
 * @category Datatypes
 * @internal
 */
export const Port = Function.pipe(
    Schema.Int,
    Schema.between(0, 2 ** 16 - 1),
    Schema.identifier("Port"),
    Schema.description("A port number"),
    Schema.brand("Port")
);

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type Port = Schema.Schema.To<typeof Port>;

const IPv4SegmentFormat = "(?:[0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])";
const IPv4AddressFormat = `(${IPv4SegmentFormat}[.]){3}${IPv4SegmentFormat}`;
const IPv4AddressRegExp = new RegExp(`^${IPv4AddressFormat}$`);

/**
 * An IPv4 address.
 *
 * @since 1.0.0
 * @category Datatypes
 * @internal
 */
export const IPv4 = Function.pipe(
    Schema.string,
    Schema.pattern(IPv4AddressRegExp),
    Schema.identifier("IPv4"),
    Schema.description("An ipv4 address"),
    Schema.brand("IPv4")
);

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type IPv4 = Schema.Schema.To<typeof IPv4>;

const IPv6SegmentFormat = "(?:[0-9a-fA-F]{1,4})";
const IPv6AddressRegExp = new RegExp(
    "^(" +
        `(?:${IPv6SegmentFormat}:){7}(?:${IPv6SegmentFormat}|:)|` +
        `(?:${IPv6SegmentFormat}:){6}(?:${IPv4AddressFormat}|:${IPv6SegmentFormat}|:)|` +
        `(?:${IPv6SegmentFormat}:){5}(?::${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,2}|:)|` +
        `(?:${IPv6SegmentFormat}:){4}(?:(:${IPv6SegmentFormat}){0,1}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,3}|:)|` +
        `(?:${IPv6SegmentFormat}:){3}(?:(:${IPv6SegmentFormat}){0,2}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,4}|:)|` +
        `(?:${IPv6SegmentFormat}:){2}(?:(:${IPv6SegmentFormat}){0,3}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,5}|:)|` +
        `(?:${IPv6SegmentFormat}:){1}(?:(:${IPv6SegmentFormat}){0,4}:${IPv4AddressFormat}|(:${IPv6SegmentFormat}){1,6}|:)|` +
        `(?::((?::${IPv6SegmentFormat}){0,5}:${IPv4AddressFormat}|(?::${IPv6SegmentFormat}){1,7}|:))` +
        ")(%[0-9a-zA-Z-.:]{1,})?$"
);

/**
 * An IPv6 address.
 *
 * @since 1.0.0
 * @category Datatypes
 * @internal
 */
export const IPv6 = Function.pipe(
    Schema.string,
    Schema.pattern(IPv6AddressRegExp),
    Schema.identifier("IPv6"),
    Schema.description("An ipv6 address"),
    Schema.brand("IPv6")
);

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type IPv6 = Schema.Schema.To<typeof IPv6>;

/**
 * An IP address, which is either an IPv4 or IPv6 address.
 *
 * @since 1.0.0
 * @category Datatypes
 * @internal
 */
export const Address = Function.pipe(
    Schema.union(IPv4, IPv6),
    Schema.identifier("Address"),
    Schema.description("An ipv4 or ipv6 address"),
    Schema.brand("Address")
);

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type Address = Schema.Schema.To<typeof Address>;

/**
 * An ipv4 cidr mask, which is a number between 0 and 32.
 *
 * @since 1.0.0
 * @category Datatypes
 * @internal
 */
export const IPv4CidrMask = Function.pipe(
    Schema.Int,
    Schema.between(0, 32),
    Schema.identifier("IPv4CidrMask"),
    Schema.description("An ipv4 cidr mask"),
    Schema.brand("IPv4CidrMask")
);

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type IPv4CidrMask = Schema.Schema.To<typeof IPv4CidrMask>;

/**
 * An ipv6 cidr mask, which is a number between 0 and 128.
 *
 * @since 1.0.0
 * @category Datatypes
 * @internal
 */
export const IPv6CidrMask = Function.pipe(
    Schema.Int,
    Schema.between(0, 128),
    Schema.identifier("IPv6CidrMask"),
    Schema.description("An ipv6 cidr mask"),
    Schema.brand("IPv6CidrMask")
);

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type IPv6CidrMask = Schema.Schema.To<typeof IPv6CidrMask>;

/**
 * A cidr block, which is an IP address followed by a slash and a number between
 * 0 and 32.
 *
 * @since 1.0.0
 * @category Datatypes
 * @internal
 */
export const CidrBlock = Function.pipe(
    Schema.transformOrFail(
        Schema.union(
            Schema.struct({ ipv4: IPv4, mask: IPv4CidrMask }),
            Schema.struct({ ipv6: IPv6, mask: IPv6CidrMask }),
            Schema.templateLiteral(Schema.string, Schema.literal("/"), Schema.number)
        ),
        Schema.union(
            Schema.struct({ ipv4: IPv4, mask: IPv4CidrMask }),
            Schema.struct({ ipv6: IPv6, mask: IPv6CidrMask })
        ),
        (data, _options, ast) =>
            Effect.gen(function* (λ) {
                if (typeof data === "object") return data;
                const [ip, mask] = data.split("/") as Split<typeof data, "/">;
                const ipParsed = yield* λ(Schema.decode(Schema.union(IPv4, IPv6))(ip));
                const isV4 = String.includes(".")(ipParsed);
                const maskParsed = isV4
                    ? yield* λ(Schema.decode(Schema.compose(Schema.NumberFromString, IPv4CidrMask))(mask))
                    : yield* λ(Schema.decode(Schema.compose(Schema.NumberFromString, IPv6CidrMask))(mask));
                return isV4 ? { ipv4: ipParsed, mask: maskParsed } : { ipv6: ipParsed, mask: maskParsed };
            }).pipe(Effect.mapError((error) => ParseResult.forbidden(ast, data, error.message))),
        (data) => {
            if ("ipv4" in data) return Effect.succeed(`${data.ipv4}/${data.mask}` as const);
            if ("ipv6" in data) return Effect.succeed(`${data.ipv6}/${data.mask}` as const);
            return Effect.succeed(Function.absurd<`${string}/${number}`>(data));
        }
    ),
    Schema.identifier("CidrBlock"),
    Schema.description("A cidr block"),
    Schema.brand("CidrBlock")
);

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type CidrBlockTo = Schema.Schema.To<typeof CidrBlock>;

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type CidrBlockFrom = Schema.Schema.From<typeof CidrBlock>;

/**
 * An IPv4 wireguard endpoint, which consists of an IPv4 address followed by a
 * port.
 *
 * @since 1.0.0
 * @category Datatypes
 * @internal
 */
export const IPv4Endpoint = Function.pipe(
    Schema.transformOrFail(
        Schema.union(
            Schema.struct({ ip: IPv4, port: Port }),
            Schema.templateLiteral(Schema.string, Schema.literal(":"), Schema.number)
        ),
        Schema.struct({ ip: IPv4, port: Port }),
        (data, _options, ast) =>
            Effect.gen(function* (λ) {
                if (typeof data === "object") return data;
                const [ip, port] = data.split(":") as Split<typeof data, ":">;
                const ipParsed = yield* λ(Schema.decode(IPv4)(ip));
                const portParsed = yield* λ(Schema.decode(Schema.compose(Schema.NumberFromString, Port))(port));
                return { ip: ipParsed, port: portParsed };
            }).pipe(Effect.mapError((error) => ParseResult.forbidden(ast, data, error.message))),
        ({ ip, port }) => Effect.succeed(`${ip}:${port}` as const)
    ),
    Schema.identifier("IPv4Endpoint"),
    Schema.description("An ipv4 wireguard endpoint"),
    Schema.brand("IPv4Endpoint")
);

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type IPv4EndpointTo = Schema.Schema.To<typeof IPv4Endpoint>;

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type IPv4EndpointFrom = Schema.Schema.From<typeof IPv4Endpoint>;

/**
 * An IPv6 wireguard endpoint, which consists of an IPv6 address in square
 * brackets followed by a port.
 *
 * @since 1.0.0
 * @category Datatypes
 * @internal
 */
export const IPv6Endpoint = Function.pipe(
    Schema.transformOrFail(
        Schema.union(
            Schema.struct({ ip: IPv6, port: Port }),
            Schema.templateLiteral(
                Schema.literal("["),
                Schema.string,
                Schema.literal("]"),
                Schema.literal(":"),
                Schema.number
            )
        ),
        Schema.struct({ ip: IPv6, port: Port }),
        (data, _options, ast) =>
            Effect.gen(function* (λ) {
                if (typeof data === "object") return data;
                const [ip, port] = data.split("]") as Split<typeof data, "]:">;
                const ipParsed = yield* λ(Schema.decode(IPv6)(ip.slice(1)));
                const portParsed = yield* λ(Schema.decode(Schema.compose(Schema.NumberFromString, Port))(port));
                return { ip: ipParsed, port: portParsed };
            }).pipe(Effect.mapError((error) => ParseResult.forbidden(ast, data, error.message))),
        ({ ip, port }) => Effect.succeed(`[${ip}]:${port}` as const)
    ),
    Schema.identifier("IPv6Endpoint"),
    Schema.description("An ipv6 wireguard endpoint"),
    Schema.brand("IPv6Endpoint")
);

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type IPv6EndpointTo = Schema.Schema.To<typeof IPv6Endpoint>;

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type IPv6EndpointFrom = Schema.Schema.From<typeof IPv6Endpoint>;

/**
 * A wireguard endpoint, which is either an IPv4 or IPv6 endpoint.
 *
 * @since 1.0.0
 * @category Datatypes
 * @internal
 */
export const Endpoint = Function.pipe(
    Schema.union(IPv4Endpoint, IPv6Endpoint),
    Schema.identifier("Endpoint"),
    Schema.description("A wireguard endpoint"),
    Schema.brand("Endpoint")
);

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type EndpointTo = Schema.Schema.To<typeof Endpoint>;

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type EndpointFrom = Schema.Schema.From<typeof Endpoint>;

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Datatypes
 * @internal
 */
export const SetupData = Function.pipe(
    Schema.tuple(Endpoint, Address),
    Schema.identifier("SetupData"),
    Schema.description("A wireguard setup data"),
    Schema.brand("SetupData")
);

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type SetupDataTo = Schema.Schema.To<typeof SetupData>;

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type SetupDataFrom = Schema.Schema.From<typeof SetupData>;

/**
 * A wireguard key, which is a 44 character base64 string.
 *
 * @since 1.0.0
 * @category Datatypes
 * @internal
 * @see https://lists.zx2c4.com/pipermail/wireguard/2020-December/006222.html
 */
export const WireguardKey = Function.pipe(
    Schema.string,
    Schema.pattern(/^[\d+/A-Za-z]{42}[048AEIMQUYcgkosw]=$/),
    Schema.identifier("WireguardKey"),
    Schema.description("A wireguard key"),
    Schema.brand("WireguardKey")
);

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type WireguardKey = Schema.Schema.To<typeof WireguardKey>;

/**
 * A wireguard Errno return message.
 *
 * @since 1.0.0
 * @category Datatypes
 * @internal
 */
export const Errno = Function.pipe(
    Schema.templateLiteral(Schema.literal("errno="), Schema.literal(0)),
    Schema.identifier("Errno"),
    Schema.description("An errno"),
    Schema.brand("Errno")
);

/**
 * @since 1.0.0
 * @category Brands
 * @internal
 */
export type Errno = Schema.Schema.To<typeof Errno>;

/**
 * @since 1.0.0
 * @category Errors
 * @internal
 */
export class WireguardError extends Data.TaggedError("WireguardError")<{ message: string }> {}

/**
 * A wireguard interface name.
 *
 * @since 1.0.0
 * @category Datatypes
 * @alpha
 */
export class WireguardInterface extends Schema.Class<WireguardInterface>()({
    Name: Schema.transformOrFail(
        Schema.string,
        Schema.string,
        (s, _options, ast): Effect.Effect<string, ParseResult.Forbidden, never> =>
            Function.pipe(
                WireguardInterface.InterfaceRegExpForPlatform,
                Effect.mapError((error) => ParseResult.forbidden(ast, s, error.message)),
                Effect.flatMap((x) =>
                    x.test(s)
                        ? Effect.succeed(s)
                        : Effect.fail(ParseResult.forbidden(ast, s, `Expected interface name to match ${x}`))
                )
            ),
        (s) => Effect.succeed(s)
    ),
}) {
    private static readonly SupportedArchitectures = ["x64", "arm64"] as const;
    private static readonly SupportedPlatforms = ["linux", "win32", "darwin", "openbsd", "freebsd"] as const;

    protected static readonly LinuxInterfaceNameRegExp: RegExp = /^wg\d+$/;
    protected static readonly DarwinInterfaceNameRegExp: RegExp = /^utun\d+$/;
    protected static readonly OpenBSDInterfaceNameRegExp: RegExp = /^tun\d+$/;
    protected static readonly WindowsInterfaceNameRegExp: RegExp = /^eth\d+$/;
    protected static readonly FreeBSDInterfaceNameRegExp: RegExp = /^eth\d+$/;

    protected static WireguardGoExecutablePath: Effect.Effect<
        string,
        Platform.Error.PlatformError,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    > = Effect.gen(function* (λ) {
        const path = yield* λ(Platform.Path.Path);
        const fs = yield* λ(Platform.FileSystem.FileSystem);
        const arch = process.arch === "x64" ? "amd64" : process.arch;
        const url = new URL(`../build/${process.platform}-${arch}-wireguard-go`, import.meta.url);
        const pathString = yield* λ(path.fromFileUrl(url));
        yield* λ(fs.access(pathString, { ok: true }));
        return pathString;
    });

    protected static InterfaceRegExpForPlatform: Effect.Effect<RegExp, WireguardError, never> = Function.pipe(
        Match.value(`${process.arch}:${process.platform}`),
        Match.not(
            Predicate.some(
                ReadonlyArray.map(WireguardInterface.SupportedArchitectures, (arch) => String.startsWith(`${arch}:`))
            ),
            (bad) => Effect.fail(new WireguardError({ message: `Unsupported architecture ${bad}` }))
        ),
        Match.when(String.endsWith(":linux"), () => Effect.succeed(WireguardInterface.LinuxInterfaceNameRegExp)),
        Match.when(String.endsWith(":win32"), () => Effect.succeed(WireguardInterface.WindowsInterfaceNameRegExp)),
        Match.when(String.endsWith(":darwin"), () => Effect.succeed(WireguardInterface.DarwinInterfaceNameRegExp)),
        Match.when(String.endsWith(":openbsd"), () => Effect.succeed(WireguardInterface.OpenBSDInterfaceNameRegExp)),
        Match.when(String.endsWith(":freebsd"), () => Effect.succeed(WireguardInterface.FreeBSDInterfaceNameRegExp)),
        Match.orElse((bad) => Effect.fail(new WireguardError({ message: `Unsupported platform ${bad}` })))
    );

    /**
     * @since 1.0.0
     * @category Constructors
     */
    public static getNextAvailableInterface = (): Effect.Effect<WireguardInterface, WireguardError, never> =>
        Effect.gen(function* (λ) {
            // Determine all the used interface indexes
            const regex = yield* λ(WireguardInterface.InterfaceRegExpForPlatform);
            const usedInterfaceIndexes = Function.pipe(
                os.networkInterfaces(),
                ReadonlyRecord.keys,
                ReadonlyArray.filter((name) => regex.test(name)),
                ReadonlyArray.map(String.replaceAll(/a-z/, "")),
                ReadonlyArray.map(Number.parse),
                ReadonlyArray.filterMap(Function.identity)
            );

            // Find the next available interface index
            const nextAvailableInterfaceIndex = yield* λ(
                Function.pipe(
                    Stream.iterate(0, (x) => x + 1),
                    Stream.find((x) => !ReadonlyArray.contains(usedInterfaceIndexes, x)),
                    Stream.take(1),
                    Stream.runCollect,
                    Effect.map(Chunk.head),
                    Effect.map(Option.getOrThrow)
                )
            );

            // We know this will be a supported platform now because otherwise
            // the WireguardInterface.InterfaceRegExpForPlatform would have failed
            const platform: (typeof WireguardInterface.SupportedPlatforms)[number] = Function.unsafeCoerce(
                process.platform
            );

            // Construct the next available interface name
            const fromString = Schema.decodeSync(WireguardInterface);
            switch (platform) {
                case "win32":
                case "freebsd":
                    return fromString({ Name: `eth${nextAvailableInterfaceIndex}` });
                case "linux":
                    return fromString({ Name: `wg${nextAvailableInterfaceIndex}` });
                case "openbsd":
                    return fromString({ Name: `tun${nextAvailableInterfaceIndex}` });
                case "darwin":
                    return fromString({ Name: `utun${nextAvailableInterfaceIndex}` });
                default:
                    return Function.absurd<WireguardInterface>(platform);
            }
        });

    /**
     * TODO: finish freebsd and openbsd implementations
     *
     * @since 1.0.0
     * @category Helpers
     * @internal
     */
    public socketLocation = (): string =>
        Function.pipe(
            Match.type<(typeof WireguardInterface.SupportedPlatforms)[number]>(),
            Match.when("win32", () => `\\\\.\\pipe\\wireguard\\${this.Name}`),
            Match.when("linux", () => `/var/run/wireguard/${this.Name}.sock`),
            Match.when("darwin", () => `/var/run/wireguard/${this.Name}.sock`),
            Match.when("freebsd", () => ""),
            Match.when("openbsd", () => ""),
            Match.orElseAbsurd
        )(Function.unsafeCoerce(process.platform));

    /**
     * @since 1.0.0
     * @category API
     * @see https://github.com/WireGuard/wgctrl-go/blob/925a1e7659e675c94c1a659d39daa9141e450c7d/internal/wguser/configure.go#L52-L101
     */
    public setConfig = (
        config: WireguardIniConfig,
        options?: { replacePeers: boolean; replaceAllowedIPs: boolean } | undefined
    ): Effect.Effect<void, WireguardError, never> =>
        Function.pipe(
            // TODO: Could this be extracted to a schema transformation?
            Stream.fromIterable([
                "set=1",
                `private_key=${Buffer.from(config.PrivateKey, "base64").toString("hex")}`,
                `listen_port=${config.ListenPort}`,
                `fwmark=${Predicate.isNotUndefined(config.FirewallMark) ? config.FirewallMark : 0}`,
                `replace_peers=${options?.replacePeers}`,
                ...config.Peers.flatMap((peer) => [
                    `public_key=${Buffer.from(peer.PublicKey, "base64").toString("hex")}`,
                    `endpoint=${peer.Endpoint.ip}:${peer.Endpoint.port}`,
                    `persistent_keepalive_interval=20`,
                    `replace_allowed_ips=${options?.replaceAllowedIPs}`,
                    ...peer.AllowedIPs.map((allowedIP) =>
                        "ipv4" in allowedIP
                            ? `allowed_ip=${allowedIP.ipv4}/${allowedIP.mask}`
                            : `allowed_ip=${allowedIP.ipv6}/${allowedIP.mask}`
                    ),
                ]),
            ]),
            Stream.map(String.concat("\n")),
            Stream.encodeText,
            Stream.pipeThroughChannelOrFail(Socket.makeNetChannel({ path: this.socketLocation() })),
            Stream.decodeText(),
            Stream.run(Sink.last()),
            Effect.map(Option.getOrThrow),
            Effect.map(String.trimEnd),
            Effect.flatMap(Schema.decodeUnknown(Errno)),
            Effect.catchAll((error) => Effect.fail(new WireguardError({ message: error.message })))
        );

    /**
     * FIXME: What does this return?
     *
     * @since 1.0.0
     * @category API
     */
    public getConfig = (): Effect.Effect<void, WireguardError, never> =>
        Function.pipe(
            Stream.make("get=1\n\n"),
            Stream.encodeText,
            Stream.pipeThroughChannelOrFail(Socket.makeNetChannel({ path: this.socketLocation() })),
            Stream.decodeText(),
            Stream.flatMap(Function.compose(String.linesIterator, Stream.fromIterable)),
            Stream.map(String.trimEnd),
            Stream.filter(String.isNonEmpty),
            Stream.run(Sink.collectAll()),
            Effect.tap(Function.flow(Chunk.last, Option.getOrThrow, Schema.decodeUnknown(Errno))),
            Effect.map(Chunk.join("\n")),
            Effect.tap(Console.log),
            Effect.catchAll((error) => Effect.fail(new WireguardError({ message: error.message })))
        );

    /**
     * Starts a wireguard tunnel that will be gracefully shutdown once the scope
     * is closed.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public upScoped = (
        config: WireguardIniConfig,
        options?: { replacePeers: boolean; replaceAllowedIPs: boolean } | undefined
    ): Effect.Effect<
        WireguardInterface,
        WireguardError | Cause.TimeoutException,
        Scope.Scope | Platform.FileSystem.FileSystem | Platform.Path.Path
    > => Effect.acquireRelease(this.up(config, options), Function.flow(this.down, Effect.orDie));

    /**
     * Starts a wireguard tunnel that will continue to run and serve traffic
     * even after the nodejs process exits.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public up = (
        config: WireguardIniConfig,
        options?: { replacePeers: boolean; replaceAllowedIPs: boolean } | undefined
    ): Effect.Effect<
        WireguardInterface,
        WireguardError | Cause.TimeoutException,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    > => {
        const self = this;
        return Effect.gen(function* (λ) {
            const executablePath = yield* λ(WireguardInterface.WireguardGoExecutablePath.pipe(Effect.orDie));

            // TODO: Can we get rid of sudo here somehow?
            yield* λ(
                Effect.tryPromise({
                    try: () => {
                        const subprocess = execa.execaCommand(`sudo ${executablePath} ${self.Name}`, {
                            detached: true,
                            stdio: "ignore",
                            cleanup: false,
                        });
                        subprocess.unref();
                        return subprocess;
                    },
                    catch: (error) => new WireguardError({ message: `${error}` }),
                })
            );

            yield* λ(self.setConfig(config, options));
            return self;
        });
    };

    /**
     * Stops a previously started wireguard tunnel.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public down = (): Effect.Effect<void, Platform.Error.PlatformError, Platform.FileSystem.FileSystem> =>
        Effect.map(Platform.FileSystem.FileSystem, (fs) => fs.remove(this.socketLocation()));
}

/**
 * A wireguard peer configuration.
 *
 * @since 1.0.0
 * @category Datatypes
 * @alpha
 */
export class WireguardPeer extends Schema.Class<WireguardPeer>()({
    /** @see https://github.com/WireGuard/wgctrl-go/blob/925a1e7659e675c94c1a659d39daa9141e450c7d/wgtypes/types.go#L236-L276 */

    /** The persistent keepalive interval in seconds, 0 disables it. */
    PersistentKeepaliveInterval: Schema.optional(Schema.DurationFromSelf),

    /**
     * The value for this is IP/cidr, indicating a new added allowed IP entry
     * for the previously added peer entry. If an identical value already exists
     * as part of a prior peer, the allowed IP entry will be removed from that
     * peer and added to this peer.
     */
    AllowedIPs: Schema.optional(Schema.array(CidrBlock), { default: () => [] }),

    /**
     * The value for this key is either IP:port for IPv4 or [IP]:port for IPv6,
     * indicating the endpoint of the previously added peer entry.
     */
    Endpoint: Endpoint,

    /**
     * The value for this key should be a lowercase hex-encoded public key of a
     * new peer entry.
     */
    PublicKey: WireguardKey,

    PresharedKey: Schema.optional(Schema.string),
}) {
    /**
     * @since 1.0.0
     * @category Transformations
     */
    public encodeIni = (): Effect.Effect<string, ParseResult.ParseError, never> => {
        const self = this;
        return Effect.gen(function* (λ) {
            const iniConfig = yield* λ(Schema.encode(WireguardPeer)(self));
            const peerData = { ...iniConfig };
            delete peerData["AllowedIPs"];
            const allowedIps = yield* λ(
                Effect.all(ReadonlyArray.map(self.AllowedIPs, (ap) => Schema.encode(CidrBlock)(ap)))
            );
            return String.concat(
                ini.encode(peerData, { bracketedArray: false, section: "Peer", whitespace: true }),
                `AllowedIPs=${allowedIps.join(", ")}`
            );
        });
    };
}

/**
 * A wireguard interface configuration.
 *
 * @since 1.0.0
 * @category Datatypes
 * @alpha
 */
class WireguardIniConfig extends Schema.Class<WireguardIniConfig>()({
    /** @see https://github.com/WireGuard/wgctrl-go/blob/925a1e7659e675c94c1a659d39daa9141e450c7d/wgtypes/types.go#L207-L232 */

    Address: Schema.union(Address, CidrBlock, Schema.nonEmptyArray(Address)),

    /**
     * The value for this is a decimal-string integer corresponding to the
     * listening port of the interface.
     */
    ListenPort: Port,

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
    PrivateKey: WireguardKey,

    /** List of peers to add. */
    Peers: Schema.nonEmptyArray(WireguardPeer),
}) {
    /**
     * Loads a wireguard interface configuration from an INI file.
     *
     * @since 1.0.0
     * @category Transformations
     */
    public static fromConfigFile = (
        file: string
    ): Effect.Effect<
        WireguardIniConfig,
        WireguardError | ParseResult.ParseError | Platform.Error.PlatformError,
        Platform.FileSystem.FileSystem
    > =>
        Effect.gen(function* (λ) {
            const fs = yield* λ(Platform.FileSystem.FileSystem);
            const config = yield* λ(fs.readFileString(file));
            const sections = config.split("[Peer]");

            const peers = yield* λ(
                Function.pipe(
                    sections,
                    ReadonlyArray.filter((text) => text.startsWith("[Peer]")),
                    ReadonlyArray.map(ini.parse),
                    ReadonlyArray.map((peer) => Schema.decodeUnknown(Schema.parseJson(WireguardPeer))(peer)),
                    Effect.allWith({ concurrency: "unbounded", batching: "inherit" })
                )
            );

            const makeConfig = Function.pipe(
                sections,
                ReadonlyArray.findFirst((text) => text.startsWith("[Interface]")),
                Option.getOrThrowWith(() => new WireguardError({ message: "No [Interface] section found" })),
                ini.parse,
                (jsonConfig) => ({ ...jsonConfig["Interface"], peers }),
                Schema.decodeUnknown(Schema.parseJson(WireguardIniConfig))
            );

            return yield* λ(makeConfig);
        });

    /**
     * Writes a wireguard interface configuration to an INI file.
     *
     * @since 1.0.0
     * @category Transformations
     */
    public writeToFile = (
        file: string
    ): Effect.Effect<
        void,
        ParseResult.ParseError | Platform.Error.PlatformError,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    > => {
        const self = this;
        return Effect.gen(function* (λ) {
            const path = yield* λ(Platform.Path.Path);
            const fs = yield* λ(Platform.FileSystem.FileSystem);
            const data = yield* λ(Schema.encode(WireguardIniConfig)(self));

            type Writable<T> = { -readonly [P in keyof T]: T[P] };
            const interfaceData = { ...data } as Writable<Partial<Schema.Schema.From<typeof WireguardIniConfig>>>;
            delete interfaceData["Peers"];

            const interfaceConfig = Function.pipe(
                ini.stringify(interfaceData, { section: "Interface", whitespace: true }),
                String.replaceAll('"', "")
            );

            const peersConfig = yield* λ(
                Function.pipe(
                    self.Peers,
                    ReadonlyArray.map((peer) => peer.encodeIni()),
                    Effect.allWith({ concurrency: "unbounded", batching: "inherit" }),
                    Effect.map(ReadonlyArray.join("\n\n")),
                    Effect.map(String.replaceAll('"', ""))
                )
            );

            yield* λ(fs.makeDirectory(path.dirname(file), { recursive: true }));
            return yield* λ(fs.writeFileString(file, `${interfaceConfig}\n${peersConfig}`));
        });
    };

    /**
     * Generates two wireguard configurations, each with the other as a single
     * peer and shares their keys appropriately.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static generateP2PConfigs: {
        // Overload for when cidrBlock is not provided
        (
            aliceData: SetupDataFrom,
            bobData: SetupDataFrom
        ): Effect.Effect<
            [aliceConfig: WireguardIniConfig, bobConfig: WireguardIniConfig],
            ParseResult.ParseError,
            never
        >;
        // Overload for when cidrBlock is provided
        (
            aliceEndpoint: EndpointFrom,
            bobEndpoint: EndpointFrom,
            cidrBlock: CidrBlockFrom
        ): Effect.Effect<
            [aliceConfig: WireguardIniConfig, bobConfig: WireguardIniConfig],
            ParseResult.ParseError,
            never
        >;
    } = <T extends SetupDataFrom | EndpointFrom>(
        aliceData: T,
        bobData: T,
        cidrBlock?: CidrBlockFrom | undefined
    ): Effect.Effect<[aliceConfig: WireguardIniConfig, bobConfig: WireguardIniConfig], ParseResult.ParseError, never> =>
        Effect.gen(function* (λ) {
            const hubEndpoint = aliceData;
            const spokeEndpoints = ReadonlyArray.make(bobData);
            const [aliceConfig, [bobConfig]] = Predicate.isUndefined(cidrBlock)
                ? yield* λ(
                      WireguardIniConfig.generateHubSpokeConfigs(
                          hubEndpoint as SetupDataFrom,
                          spokeEndpoints as ReadonlyArray.NonEmptyReadonlyArray<SetupDataFrom>
                      )
                  )
                : yield* λ(
                      WireguardIniConfig.generateHubSpokeConfigs(
                          hubEndpoint as EndpointFrom,
                          spokeEndpoints as ReadonlyArray.NonEmptyReadonlyArray<EndpointFrom>,
                          cidrBlock
                      )
                  );
            return Tuple.make(aliceConfig, bobConfig);
        });

    /**
     * Generates a collection of wireguard configurations for a star network
     * with a single central hub node and many peers all connected to it.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static generateHubSpokeConfigs: {
        // Overload for when cidrBlock is not provided
        (
            hubData: SetupDataFrom,
            spokeData: ReadonlyArray.NonEmptyReadonlyArray<SetupDataFrom>
        ): Effect.Effect<
            [hubConfig: WireguardIniConfig, spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardIniConfig>],
            ParseResult.ParseError,
            never
        >;
        // Overload for when cidrBlock is provided
        (
            hubData: EndpointFrom,
            spokeData: ReadonlyArray.NonEmptyReadonlyArray<EndpointFrom>,
            cidrBlock: CidrBlockFrom
        ): Effect.Effect<
            [hubConfig: WireguardIniConfig, spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardIniConfig>],
            ParseResult.ParseError,
            never
        >;
    } = <T extends SetupDataFrom | EndpointFrom>(
        hubData: T,
        spokeData: ReadonlyArray.NonEmptyReadonlyArray<T>,
        cidrBlock?: CidrBlockFrom | undefined
    ): Effect.Effect<
        [hubConfig: WireguardIniConfig, spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardIniConfig>],
        ParseResult.ParseError,
        never
    > =>
        Effect.gen(function* (λ) {
            // Convert the setup data to the correct format if needed
            const isSetupData = Predicate.isUndefined(cidrBlock);
            const hubSetupData = isSetupData ? (hubData as SetupDataFrom) : Tuple.make(hubData as EndpointFrom, "");
            const spokeSetupData = isSetupData
                ? (spokeData as ReadonlyArray.NonEmptyReadonlyArray<SetupDataFrom>)
                : ReadonlyArray.map(spokeData, (spoke) => Tuple.make(spoke as EndpointFrom, ""));

            // Generate the keys and parse the setup data
            const hubKeys = WireguardIniConfig.generateKeyPair();
            const hubsData = yield* λ(Schema.decode(SetupData)(hubSetupData));
            const spokesData = yield* λ(
                Effect.all(ReadonlyArray.map(spokeSetupData, (spoke) => Schema.decode(SetupData)(spoke)))
            );

            // This hub peer config will be added to all the spoke interface configs
            const hubPeerConfig = new WireguardPeer({
                PublicKey: hubKeys.publicKey,
                Endpoint: Tuple.getFirst(hubsData),
                AllowedIPs: [CidrBlock({ ipv4: IPv4(Tuple.getSecond(hubsData)), mask: IPv4CidrMask(32) })],
            });

            // All these spoke peer configs will be added to the hub interface config
            const spokePeerConfigs = ReadonlyArray.map(spokesData, (spoke) => {
                const keys = WireguardIniConfig.generateKeyPair();
                const peerConfig = new WireguardPeer({
                    Endpoint: Tuple.getFirst(spoke),
                    PublicKey: keys.publicKey,
                    AllowedIPs: [CidrBlock({ ipv4: IPv4(Tuple.getSecond(spoke)), mask: IPv4CidrMask(32) })],
                });
                return Tuple.make(Tuple.make(keys.privateKey, spoke), peerConfig);
            });

            // The hub interface config will have all the spoke peer configs
            const hubConfig = new WireguardIniConfig({
                PrivateKey: hubKeys.privateKey,
                Address: Tuple.getSecond(hubsData),
                ListenPort: Tuple.getFirst(hubsData).port,
                Peers: ReadonlyArray.map(spokePeerConfigs, Tuple.getSecond),
            });

            // Each spoke interface config will have the hub peer config
            const spokeConfigs = ReadonlyArray.map(spokePeerConfigs, ([[privateKey, spoke]]) => {
                return new WireguardIniConfig({
                    PrivateKey: privateKey,
                    Peers: [hubPeerConfig],
                    Address: Tuple.getSecond(spoke),
                    ListenPort: Tuple.getFirst(spoke).port,
                });
            });

            return Tuple.make(hubConfig, spokeConfigs);
        });

    /**
     * Generates a wireguard public private key pair.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static generateKeyPair = (): { privateKey: WireguardKey; publicKey: WireguardKey } => {
        const keys = crypto.generateKeyPairSync("x25519", {
            publicKeyEncoding: { format: "der", type: "spki" },
            privateKeyEncoding: { format: "der", type: "pkcs8" },
        });
        return {
            publicKey: WireguardKey(keys.publicKey.subarray(12).toString("base64")),
            privateKey: WireguardKey(keys.privateKey.subarray(16).toString("base64")),
        };
    };

    /**
     * Starts a wireguard tunnel that will be gracefully shutdown once the scope
     * is closed.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public upScoped = (
        interfaceName: Option.Option<WireguardInterface> = Option.none()
    ): Effect.Effect<
        void,
        WireguardError | Cause.TimeoutException,
        Scope.Scope | Platform.FileSystem.FileSystem | Platform.Path.Path
    > => Effect.acquireRelease(this.up(interfaceName), (io) => Function.flow(io.down, Effect.orDie)());

    /**
     * Starts a wireguard tunnel that will continue to run and serve traffic
     * even after the nodejs process exits.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public up = (
        interfaceObject: Option.Option<WireguardInterface> | undefined = Option.none()
    ): Effect.Effect<
        WireguardInterface,
        WireguardError | Cause.TimeoutException,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    > =>
        Function.pipe(
            interfaceObject,
            Option.map(Effect.succeed),
            Option.getOrElse(WireguardInterface.getNextAvailableInterface),
            Effect.flatMap((io) => io.up(this))
        );
}

export { WireguardIniConfig as WireguardConfig };
