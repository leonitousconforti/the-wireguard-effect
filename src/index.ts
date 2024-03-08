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
 * @alpha
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
 * @alpha
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
 * @alpha
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
 * @alpha
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
 * @alpha
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
 * @alpha
 */
export type IPv6 = Schema.Schema.To<typeof IPv6>;

/**
 * An IP address, which is either an IPv4 or IPv6 address.
 *
 * @since 1.0.0
 * @category Datatypes
 * @alpha
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
 * @alpha
 */
export type Address = Schema.Schema.To<typeof Address>;

/**
 * An ipv4 cidr mask, which is a number between 0 and 32.
 *
 * @since 1.0.0
 * @category Datatypes
 * @alpha
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
 * @alpha
 */
export type IPv4CidrMask = Schema.Schema.To<typeof IPv4CidrMask>;

/**
 * An ipv6 cidr mask, which is a number between 0 and 128.
 *
 * @since 1.0.0
 * @category Datatypes
 * @alpha
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
 * @alpha
 */
export type IPv6CidrMask = Schema.Schema.To<typeof IPv6CidrMask>;

/**
 * A cidr block, which is an IP address followed by a slash and a number between
 * 0 and 32.
 *
 * @since 1.0.0
 * @category Datatypes
 * @alpha
 */
export const CidrBlock = Function.pipe(
    Schema.transformOrFail(
        Schema.union(
            Schema.struct({ ip: IPv4, mask: IPv4CidrMask }),
            Schema.struct({ ip: IPv6, mask: IPv6CidrMask }),
            Schema.templateLiteral(Schema.string, Schema.literal("/"), Schema.number)
        ),
        Schema.union(Schema.struct({ ip: IPv4, mask: IPv4CidrMask }), Schema.struct({ ip: IPv6, mask: IPv6CidrMask })),
        (data, _options, ast) =>
            Effect.gen(function* (λ) {
                if (typeof data === "object") return data;
                const [ip, mask] = data.split("/") as Split<typeof data, "/">;
                const ipParsed = yield* λ(Schema.decode(Schema.union(IPv4, IPv6))(ip));
                const maskParsed = String.includes(".")(ipParsed)
                    ? yield* λ(Schema.decode(Schema.compose(Schema.NumberFromString, IPv4CidrMask))(mask))
                    : yield* λ(Schema.decode(Schema.compose(Schema.NumberFromString, IPv6CidrMask))(mask));
                return { ip: ipParsed, mask: maskParsed };
            }).pipe(Effect.mapError((error) => ParseResult.forbidden(ast, data, error.message))),
        ({ ip, mask }) => Effect.succeed(`${ip}/${mask}` as const)
    ),
    Schema.identifier("CidrBlock"),
    Schema.description("A cidr block"),
    Schema.brand("CidrBlock")
);

/**
 * @since 1.0.0
 * @category Brands
 * @alpha
 */
export type CidrBlockTo = Schema.Schema.To<typeof CidrBlock>;

/**
 * @since 1.0.0
 * @category Brands
 * @alpha
 */
export type CidrBlockFrom = Schema.Schema.From<typeof CidrBlock>;

/**
 * An IPv4 wireguard endpoint, which consists of an IPv4 address followed by a
 * port.
 *
 * @since 1.0.0
 * @category Datatypes
 * @alpha
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
 * @alpha
 */
export type IPv4EndpointTo = Schema.Schema.To<typeof IPv4Endpoint>;

/**
 * @since 1.0.0
 * @category Brands
 * @alpha
 */
export type IPv4EndpointFrom = Schema.Schema.From<typeof IPv4Endpoint>;

/**
 * An IPv6 wireguard endpoint, which consists of an IPv6 address in square
 * brackets followed by a port.
 *
 * @since 1.0.0
 * @category Datatypes
 * @alpha
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
 * @alpha
 */
export type IPv6EndpointTo = Schema.Schema.To<typeof IPv6Endpoint>;

/**
 * @since 1.0.0
 * @category Brands
 * @alpha
 */
export type IPv6EndpointFrom = Schema.Schema.From<typeof IPv6Endpoint>;

/**
 * A wireguard endpoint, which is either an IPv4 or IPv6 endpoint.
 *
 * @since 1.0.0
 * @category Datatypes
 * @alpha
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
 * @alpha
 */
export type EndpointTo = Schema.Schema.To<typeof Endpoint>;

/**
 * @since 1.0.0
 * @category Brands
 * @alpha
 */
export type EndpointFrom = Schema.Schema.From<typeof Endpoint>;

/**
 * A wireguard setup data, which consists of an endpoint followed by an address.
 *
 * @since 1.0.0
 * @category Datatypes
 * @alpha
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
 * @alpha
 */
export type SetupDataTo = Schema.Schema.To<typeof SetupData>;

/**
 * @since 1.0.0
 * @category Brands
 * @alpha
 */
export type SetupDataFrom = Schema.Schema.From<typeof SetupData>;

/**
 * A wireguard Errno return message.
 *
 * @since 1.0.0
 * @category Datatypes
 * @alpha
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
 * @alpha
 */
export type Errno = Schema.Schema.To<typeof Errno>;

/**
 * A wireguard key, which is a 44 character base64 string.
 *
 * @since 1.0.0
 * @category Datatypes
 * @alpha
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
 * @alpha
 */
export type WireguardKey = Schema.Schema.To<typeof WireguardKey>;

/**
 * @since 1.0.0
 * @category Errors
 * @alpha
 */
export class WireguardError extends Data.TaggedError("WireguardError")<{ message: string }> {}

/**
 * @since 1.0.0
 * @category Constructors
 */
const wireguardGoExecutablePath = (): Effect.Effect<
    string,
    Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
> =>
    Effect.gen(function* (λ) {
        const path = yield* λ(Platform.Path.Path);
        const fs = yield* λ(Platform.FileSystem.FileSystem);
        const arch = process.arch === "x64" ? "amd64" : process.arch;
        const url = new URL(`../build/${process.platform}-${arch}-wireguard-go`, import.meta.url);
        const pathString = yield* λ(path.fromFileUrl(url));
        yield* λ(fs.access(pathString, { ok: true }));
        return pathString;
    });

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

    /**
     * @since 1.0.0
     * @category Constructors
     */
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
     * @since 1.0.0
     * @category Constructors
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
    public applyConfig = (config: WireguardConfig): Effect.Effect<void, WireguardError, never> =>
        Function.pipe(
            Stream.fromIterable([
                "set=1",
                `private_key=${Buffer.from(config.PrivateKey, "base64").toString("hex")}`,
                `listen_port=${config.ListenPort}`,
                `fwmark=${Predicate.isNotUndefined(config.FirewallMark) ? config.FirewallMark : 0}`,
                `replace_peers=${config.ReplacePeers}`,
            ]),
            Stream.map(String.concat("\n")),
            Stream.encodeText,
            Stream.pipeThroughChannelOrFail(Socket.makeNetChannel({ path: this.socketLocation() })),
            Stream.decodeText(),
            Stream.run(Sink.last()),
            Effect.tap(Console.log(Buffer.from(config.PrivateKey, "base64").toString("hex"))),
            Effect.map(Option.getOrThrow),
            Effect.map(String.trimEnd),
            Effect.flatMap(Schema.decodeUnknown(Errno)),
            Effect.catchAll((error) => Effect.fail(new WireguardError({ message: error.message })))
        );

    /**
     * Starts a wireguard tunnel in the foreground (child mode). This tunnel
     * will be gracefully shutdown once the scope is closed.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public upScoped = (
        config: WireguardConfig
    ): Effect.Effect<
        WireguardInterface,
        WireguardError | Cause.TimeoutException | Socket.SocketError,
        Scope.Scope | Platform.FileSystem.FileSystem | Platform.Path.Path
    > => Effect.acquireRelease(this.up(config), Function.flow(this.down, Effect.orDie));

    /**
     * Starts a wireguard tunnel in the background (daemon mode). This tunnel
     * will continue to run and serve traffic even after the nodejs process
     * exits.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public up = (
        config: WireguardConfig
    ): Effect.Effect<
        WireguardInterface,
        WireguardError | Cause.TimeoutException,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    > => {
        const self = this;
        return Effect.gen(function* (λ) {
            // TODO: this should be a recoverable error
            const executablePath = yield* λ(wireguardGoExecutablePath().pipe(Effect.orDie));

            // FIXME: fix this command
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

            yield* λ(self.applyConfig(config));
            return self;
        });
    };

    /**
     * Stops a wireguard tunnel that was started in the background (daemon
     * mode). This can stop tunnels that are started in the foreground (child
     * mode), but that is not the intended use case. Instead you should use
     * `upScoped`.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public down = (): Effect.Effect<
        void,
        Platform.Error.PlatformError | WireguardError,
        Platform.FileSystem.FileSystem
    > => {
        const self = this;
        return Effect.gen(function* (λ) {
            const fs = yield* λ(Platform.FileSystem.FileSystem);
            const path = self.socketLocation();
            yield* λ(fs.remove(path));
        });
    };
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
    ReplaceAllowedIPs: Schema.optional(Schema.boolean, { default: () => true }),
}) {}

/**
 * A wireguard interface configuration.
 *
 * @since 1.0.0
 * @category Datatypes
 * @alpha
 */
export class WireguardConfig extends Schema.Class<WireguardConfig>()({
    /** @see https://github.com/WireGuard/wgctrl-go/blob/925a1e7659e675c94c1a659d39daa9141e450c7d/wgtypes/types.go#L207-L232 */

    Address: Address,

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

    /**
     * Indicates that the subsequent peers (perhaps an empty list) should
     * replace any existing peers, rather than append to the existing peer
     * list.
     */
    ReplacePeers: Schema.optional(Schema.boolean, { default: () => true }),

    /** List of peers to add. */
    Peers: Schema.nonEmptyArray(WireguardPeer),
}) {
    /**
     * Loads a wireguard interface configuration from a JSON file.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static fromJsonConfigFile = (
        file: string
    ): Effect.Effect<
        WireguardConfig,
        ParseResult.ParseError | Platform.Error.PlatformError,
        Platform.FileSystem.FileSystem
    > =>
        Effect.gen(function* (λ) {
            const fs = yield* λ(Platform.FileSystem.FileSystem);
            const config = yield* λ(fs.readFileString(file));
            return yield* λ(Schema.decode(Schema.parseJson(WireguardConfig))(config));
        });

    /**
     * Loads a wireguard interface configuration from an INI file.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static fromIniConfigFile = (
        file: string
    ): Effect.Effect<
        WireguardConfig,
        ParseResult.ParseError | Platform.Error.PlatformError,
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
                Schema.decodeUnknown(Schema.parseJson(WireguardConfig))
            );

            return yield* λ(makeConfig);
        });

    /**
     * Generates a two wireguard configurations, each with the other as a single
     * peer, and shares their keys appropriately.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static generateP2PConfigs: {
        (
            aliceData: SetupDataFrom,
            bobEndpoint: SetupDataFrom
        ): Effect.Effect<[aliceConfig: WireguardConfig, bobConfig: WireguardConfig], ParseResult.ParseError, never>;
        (
            aliceData: SetupDataFrom
        ): (
            bobData: SetupDataFrom
        ) => Effect.Effect<[aliceConfig: WireguardConfig, bobConfig: WireguardConfig], ParseResult.ParseError, never>;
    } = Function.dual(2, (aliceData: SetupDataFrom, bobData: SetupDataFrom) =>
        Effect.gen(function* (λ) {
            const hubEndpoint = aliceData;
            const spokeEndpoints = ReadonlyArray.make(bobData);
            const [aliceConfig, [bobConfig]] = yield* λ(
                WireguardConfig.generateHubSpokeConfigs(hubEndpoint, spokeEndpoints)
            );
            return Tuple.make(aliceConfig, bobConfig);
        })
    );

    /**
     * Generates a collection of wireguard configurations for a star network
     * with a single central node and many peers all connected it.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public static generateHubSpokeConfigs = (
        hubData: SetupDataFrom,
        spokeData: ReadonlyArray.NonEmptyReadonlyArray<SetupDataFrom>
    ): Effect.Effect<
        [hubConfig: WireguardConfig, spokeConfigs: ReadonlyArray.NonEmptyReadonlyArray<WireguardConfig>],
        ParseResult.ParseError,
        never
    > =>
        Effect.gen(function* (λ) {
            const hubKeys = WireguardConfig.generateKeyPair();
            const hubsData = yield* λ(Schema.decode(SetupData)(hubData));
            const spokesData = yield* λ(
                Effect.all(ReadonlyArray.map(spokeData, (spoke) => Schema.decode(SetupData)(spoke)))
            );

            // This hub peer config will be added to all the spoke interface configs
            const hubPeerConfig = new WireguardPeer({
                ReplaceAllowedIPs: true,
                PublicKey: hubKeys.publicKey,
                Endpoint: Tuple.getFirst(hubsData),
                AllowedIPs: [CidrBlock({ ip: IPv4(Tuple.getSecond(hubsData)), mask: IPv4CidrMask(32) })],
            });

            // All these spoke peer configs will be added to the hub interface config
            const spokePeerConfigs = ReadonlyArray.map(spokesData, (spoke) => {
                const keys = WireguardConfig.generateKeyPair();
                const peerConfig = new WireguardPeer({
                    Endpoint: Tuple.getFirst(spoke),
                    ReplaceAllowedIPs: true,
                    PublicKey: keys.publicKey,
                    AllowedIPs: [CidrBlock({ ip: IPv4(Tuple.getSecond(spoke)), mask: IPv4CidrMask(32) })],
                });
                return Tuple.make(Tuple.make(keys.privateKey, spoke), peerConfig);
            });

            // The hub interface config will have all the spoke peer configs
            const hubConfig = new WireguardConfig({
                ReplacePeers: true,
                PrivateKey: hubKeys.privateKey,
                Address: Tuple.getSecond(hubsData),
                ListenPort: Tuple.getFirst(hubsData).port,
                Peers: ReadonlyArray.map(spokePeerConfigs, Tuple.getSecond),
            });

            // Each spoke interface config will have the hub peer config
            const spokeConfigs = ReadonlyArray.map(spokePeerConfigs, ([[privateKey, spoke]]) => {
                return new WireguardConfig({
                    ReplacePeers: true,
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
     * Writes a wireguard interface configuration to an INI file.
     *
     * @since 1.0.0
     * @category Constructors
     */
    public writeToFile = (
        file: string
    ): Effect.Effect<void, ParseResult.ParseError | Platform.Error.PlatformError, Platform.FileSystem.FileSystem> => {
        const self = this;
        return Effect.gen(function* (λ) {
            const fs = yield* λ(Platform.FileSystem.FileSystem);
            const data = yield* λ(Schema.encode(WireguardConfig)(self));

            type Writable<T> = { -readonly [P in keyof T]: T[P] };
            const interfaceData = { ...data } as Writable<Partial<Schema.Schema.From<WireguardConfig>>>;
            delete interfaceData["Peers"];

            const interfaceConfig = ini.encode(interfaceData, { section: "Interface" });
            const peersConfig = yield* λ(
                Effect.all(
                    ReadonlyArray.map(self.Peers, (peer) =>
                        Effect.gen(function* (λ) {
                            const data2 = yield* λ(Schema.encode(WireguardPeer)(peer));
                            const peerData = { ...data2 } as Writable<Partial<Schema.Schema.From<WireguardConfig>>>;
                            delete peerData["AllowedIPs"];
                            const allowedIps = yield* λ(
                                Effect.all(ReadonlyArray.map(peer.AllowedIPs, (x) => Schema.encode(CidrBlock)(x)))
                            );
                            return (
                                ini.encode(peerData, { bracketedArray: false, section: "Peer" }) +
                                `AllowedIPs=${allowedIps.join(", ")}`
                            );
                        })
                    )
                ).pipe(Effect.map(ReadonlyArray.join("\n\n")))
            );
            return yield* λ(fs.writeFileString(file, interfaceConfig + "\n" + peersConfig));
        });
    };

    /**
     * Starts a wireguard tunnel in the foreground (child mode). This tunnel
     * will be gracefully shutdown once the scope is closed.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public upScoped = (
        interfaceName: Option.Option<WireguardInterface> = Option.none()
    ): Effect.Effect<
        WireguardInterface,
        WireguardError | Cause.TimeoutException,
        Scope.Scope | Platform.FileSystem.FileSystem | Platform.Path.Path
    > => Effect.acquireRelease(this.up(interfaceName), (io) => Function.flow(io.down, Effect.orDie)());

    /**
     * Starts a wireguard tunnel in the background (daemon mode). This tunnel
     * will continue to run and serve traffic even after the nodejs process
     * exits.
     *
     * @since 1.0.0
     * @category Wireguard
     */
    public up = (
        interfaceName: Option.Option<WireguardInterface> | undefined = Option.none()
    ): Effect.Effect<
        WireguardInterface,
        WireguardError | Cause.TimeoutException,
        Platform.FileSystem.FileSystem | Platform.Path.Path
    > => {
        const self = this;
        return Effect.gen(function* (λ) {
            const interfaceObject = Option.isNone(interfaceName)
                ? yield* λ(WireguardInterface.getNextAvailableInterface())
                : interfaceName.value;

            yield* λ(interfaceObject.up(self));
            return interfaceObject;
        });
    };
}
