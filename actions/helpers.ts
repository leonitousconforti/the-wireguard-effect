import * as artifacts from "@actions/artifact";
import * as Platform from "@effect/platform";
import * as Schema from "@effect/schema/Schema";
import * as Cause from "effect/Cause";
import * as Config from "effect/Config";
import * as ConfigError from "effect/ConfigError";
import * as Effect from "effect/Effect";
import * as Either from "effect/Either";
import * as Predicate from "effect/Predicate";
import * as ip from "ip";
import * as ipAddress from "ip-address";
import * as Wireguard from "../src/index.js";

/**
 * Retrieves the service identifier from the environment variable and validates
 * that it is a valid UUID.
 */
export const SERVICE_IDENTIFIER: Config.Config<number> = Config.integer("SERVICE_IDENTIFIER");

/**
 * Retrieves the service CIDR from the environment variable and validates that
 * it is a valid CIDR block.
 */
export const SERVICE_CIDR: Config.Config<Wireguard.InternetSchemas.CidrBlock> = Config.string("SERVICE_CIDR").pipe(
    Config.mapOrFail((cidr) =>
        Schema.decodeEither(Wireguard.InternetSchemas.CidrBlock)(cidr as `${string}/${number}`).pipe(
            Either.mapLeft((error) => ConfigError.InvalidData(["/"], error.message)),
        ),
    ),
);

/** Predicate to check if an artifact is a stop artifact for the service. */
export const stopArtifact = (
    serviceIdentifier: number,
): [stopArtifactName: string, isStopArtifact: Predicate.Predicate<artifacts.Artifact>] => [
    `${serviceIdentifier}_stop`,
    (artifact: artifacts.Artifact) => artifact.name === `${serviceIdentifier}_stop`,
];

/** Predicate to check if an artifact is a connection request for the service. */
export const connectionRequestArtifact = (
    serviceIdentifier: number,
): [connectionRequestName: string, isConnectionRequest: Predicate.Predicate<artifacts.Artifact>] => [
    `${serviceIdentifier}_connection-request`,
    (artifact: artifacts.Artifact) => artifact.name.startsWith(`${serviceIdentifier}_connection-request`),
];

/** Predicate to check if an artifact is a connection response for the service. */
export const connectionResponseArtifact = (
    serviceIdentifier: number,
    clientIdentifier: string,
): [connectionResponseName: string, isConnectionResponse: Predicate.Predicate<artifacts.Artifact>] => [
    `${serviceIdentifier}_connection-response_${clientIdentifier}`,
    (artifact: artifacts.Artifact) => artifact.name === `${serviceIdentifier}_connection-response_${clientIdentifier}`,
];

/** Global artifact client. */
const artifactClient = new artifacts.DefaultArtifactClient();

/** List all artifacts in the current workflow. */
export const listArtifacts: Effect.Effect<
    ReadonlyArray<artifacts.Artifact>,
    Cause.UnknownException,
    never
> = Effect.tryPromise(() => artifactClient.listArtifacts()).pipe(Effect.map(({ artifacts }) => artifacts));

/** Delete an artifact by name. */
export const deleteArtifact = (
    artifactName: string,
): Effect.Effect<artifacts.DeleteArtifactResponse, Cause.UnknownException, never> =>
    Effect.tryPromise(() => artifactClient.deleteArtifact(artifactName));

/** Download a single file artifact by ID and extracts the desired file. */
export const downloadSingleFileArtifact = (
    artifactId: number,
    artifactFile: string,
): Effect.Effect<
    string,
    Cause.UnknownException | Error | Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
> =>
    Effect.gen(function* (λ) {
        const path = yield* λ(Platform.Path.Path);
        const fs = yield* λ(Platform.FileSystem.FileSystem);
        const { downloadPath } = yield* λ(Effect.tryPromise(() => artifactClient.downloadArtifact(artifactId)));
        if (!downloadPath) {
            return yield* λ(Effect.fail(new Error("Failed to download connection request artifact")));
        }
        return yield* λ(fs.readFileString(path.join(downloadPath, artifactFile)));
    });

/** Upload a single file artifact. */
export const uploadSingleFileArtifact = (
    artifactName: string,
    data: string,
): Effect.Effect<
    void,
    Cause.UnknownException | Platform.Error.PlatformError,
    Platform.FileSystem.FileSystem | Platform.Path.Path
> =>
    Effect.gen(function* (λ) {
        const path = yield* λ(Platform.Path.Path);
        const fs = yield* λ(Platform.FileSystem.FileSystem);
        const temporaryDirectory = yield* λ(fs.makeTempDirectoryScoped());
        const artifactFile = path.join(temporaryDirectory, artifactName);
        yield* λ(fs.writeFileString(artifactFile, data));
        yield* λ(
            Effect.tryPromise(() =>
                artifactClient.uploadArtifact(artifactName, [artifactFile], temporaryDirectory, { retentionDays: 1 }),
            ),
        );
    }).pipe(Effect.scoped);

export const getRangeV4 = (cidr: ipAddress.Address4): string[] => {
    const ips = [];

    let firstAddressLong = ip.toLong(cidr.startAddress().correctForm());
    const lastAddressLong = ip.toLong(cidr.endAddress().correctForm());

    for (firstAddressLong; firstAddressLong <= lastAddressLong; firstAddressLong++)
        ips.push(ip.fromLong(firstAddressLong));

    return ips;
};

export const getRangeV6 = (cidr: ipAddress.Address6): string[] => {
    const ips = [];

    const firstAddress = new ipAddress.Address6(cidr.startAddress().correctForm());
    const lastAddress = new ipAddress.Address6(cidr.endAddress().correctForm());

    for (let index = firstAddress.bigInteger(); index <= lastAddress.bigInteger(); index++) {
        ips.push(ipAddress.Address6.fromBigInteger(index).correctForm());
    }

    return ips;
};
