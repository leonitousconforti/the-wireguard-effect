import { expect, it } from "@effect/vitest";

import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeHttp from "@effect/platform-node/NodeHttpClient";
import * as HttpClient from "@effect/platform/HttpClient";
import * as HttpClientError from "@effect/platform/HttpClientError";
import * as HttpClientResponse from "@effect/platform/HttpClientResponse";
import * as Socket from "@effect/platform/Socket";
import * as Array from "effect/Array";
import * as Cause from "effect/Cause";
import * as Config from "effect/Config";
import * as Console from "effect/Console";
import * as Effect from "effect/Effect";
import * as Function from "effect/Function";
import * as Layer from "effect/Layer";
import * as ParseResult from "effect/ParseResult";
import * as Stream from "effect/Stream";

import * as WireguardControl from "the-wireguard-effect/WireguardControl";
import * as WireguardInterface from "the-wireguard-effect/WireguardInterface";
import * as WireguardServer from "the-wireguard-effect/WireguardServer";

const portConfig = Config.number("WIREGUARD_DEMO_PORT").pipe(Config.withDefault(42912));
const hostConfig = Config.string("WIREGUARD_DEMO_HOST").pipe(Config.withDefault("demo.wireguard.com"));
const hiddenPageUrlConfig = Config.string("HIDDEN_PAGE").pipe(Config.withDefault("http://192.168.4.1:80"));

const WireguardControlLive = Layer.sync(WireguardControl.WireguardControl, () =>
    WireguardControl.makeBundledWgQuickLayer({ sudo: process.platform !== "linux" })
);

const testLayer = Layer.mergeAll(NodeHttp.layer, NodeContext.layer, WireguardControlLive);

/**
 * Waits for all peers on the interface to have a successful handshake as well
 * some bidirectional traffic.
 */
const waitForHandshakes = (
    wireguardInterface: WireguardInterface.WireguardInterface
): Effect.Effect<void, Cause.TimeoutException | Socket.SocketError | ParseResult.ParseError, never> =>
    Function.pipe(
        wireguardInterface.streamStats(),
        Stream.takeUntil(Array.every((peer) => peer.lastHandshakeTimeSeconds > 0)),
        Stream.timeout("10 seconds"),
        Stream.runDrain
    );

/**
 * Attempts to connect to url to ensure that dns is still working and we can
 * connect to the internet when the wireguard tunnel is up.
 */
export const httpRequest = (
    url: string
): Effect.Effect<string, HttpClientError.HttpClientError | Cause.TimeoutException, HttpClient.HttpClient> =>
    Function.pipe(
        HttpClient.get(url),
        Effect.flatMap(HttpClientResponse.filterStatusOk),
        Effect.flatMap(({ text }) => text),
        Effect.timeout("10 seconds"),
        Effect.scoped
    );

it.layer(testLayer, { timeout: "1 minute" })((it) =>
    it.scoped("wireguard e2e test using demo.wireguard.com", () =>
        Effect.gen(function* () {
            const host = yield* hostConfig;
            const port = yield* portConfig;
            const hiddenPageUrl = yield* hiddenPageUrlConfig;

            const config = yield* WireguardServer.requestWireguardDemoConfig({ host, port });
            yield* Console.log("Got config from remote demo server");

            const networkInterface = yield* config.upScoped();
            yield* Console.log("Interface is up");

            yield* waitForHandshakes(networkInterface);
            yield* Console.log("Have handshake and traffic in both directions");

            yield* httpRequest("https://www.google.com");
            yield* Console.log("Connected to https://google.com (still have internet access)");

            const hiddenPage = yield* httpRequest(hiddenPageUrl);
            yield* Console.log("Connected to hidden page");
            expect(hiddenPage).toMatchSnapshot();
        })
    )
);
