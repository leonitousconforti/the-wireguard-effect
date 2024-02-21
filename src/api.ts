import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Predicate from "effect/Predicate";
import * as net from "node:net";
import * as WireguardSchemas from "./schema.js";

const socketFromInterfaceName = (
    interfaceName: string
): Effect.Effect<net.Socket, WireguardSchemas.WireguardError | Cause.TimeoutException, never> => {
    const tryOpenSocket = (
        path: string
    ): Effect.Effect<net.Socket, WireguardSchemas.WireguardError | Cause.TimeoutException, never> =>
        Effect.tryPromise({
            try: () =>
                new Promise<net.Socket>((resolve, reject) => {
                    const socket: net.Socket = net.createConnection({ path });
                    socket.on("connect", () => resolve(socket));
                    socket.on("error", (error) => reject(error));
                }),
            catch: (error) => new WireguardSchemas.WireguardError({ message: String(error) }),
        })
            .pipe(Effect.timeout("5 seconds"))
            .pipe(Effect.retry({ times: 3 }));

    switch (process.platform) {
        case "linux": {
            return tryOpenSocket(`/var/run/wireguard/${interfaceName}.sock`);
        }
        case "darwin": {
            return tryOpenSocket(`/var/run/wireguard/${interfaceName}.sock`);
        }
        case "win32": {
            return tryOpenSocket(`\\\\.\\pipe\\wireguard\\${interfaceName}`);
        }
        default: {
            return Effect.fail(
                new WireguardSchemas.WireguardError({ message: `Unsupported platform ${process.platform}` })
            );
        }
    }
};

/** @see https://github.com/WireGuard/wgctrl-go/blob/925a1e7659e675c94c1a659d39daa9141e450c7d/internal/wguser/configure.go#L52-L101 */
export const applyConfig = (
    interfaceName: string,
    config: WireguardSchemas.WireguardInterface
): Effect.Effect<void, WireguardSchemas.WireguardError | Cause.TimeoutException, never> =>
    Effect.gen(function* (λ: Effect.Adapter) {
        const socket: net.Socket = yield* λ(socketFromInterfaceName(interfaceName));
        socket.write(`private-key=${config.PrivateKey}\n`);
        socket.write(`listen-port=${config.ListenPort}\n`);
        socket.write(`replace-peers=${config.ReplacePeers}\n`);

        if (Predicate.isNotUndefined(config.FirewallMark)) {
            socket.write(`fwmark=${config.FirewallMark}\n`);
        }

        for (const peer of config.Peers) {
            socket.write(`public-key=${peer.PublicKey}\n`);
            socket.write(`endpoint=${peer.Endpoint}\n`);
            socket.write("replace_allowed_ips=true\n");

            if (Predicate.isNotUndefined(peer.PresharedKey)) {
                socket.write(`preshared_key=${peer.PresharedKey}\n`);
            }

            if (peer.PersistentKeepaliveInterval) {
                socket.write(`persistent_keepalive_interval=${peer.PersistentKeepaliveInterval}\n`);
            }

            for (const allowedIP of peer.AllowedIPs) {
                socket.write(`allowed-ips=${allowedIP}\n`);
            }
        }
    });
