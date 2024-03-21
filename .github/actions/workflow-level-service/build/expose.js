import { __toESM, require_core, require_ip_address, require_src, gen, SERVICE_IDENTIFIER, listArtifacts, stopArtifact, connectionRequestArtifact, some, deleteArtifact, filter, pipe, map, forkDaemon, all, repeat, spaced, suspend, provide, NodeContext_exports, NodeRuntime_exports, SERVICE_CIDR, validate_default, fail, downloadSingleFileArtifact, promise, loop, sync, andThen, sleep, getRangeV4, getRangeV6, make, WireguardConfig_exports, encode, parseJson, uploadSingleFileArtifact, catchAll, log, catchAllDefect } from './chunk-FF5O2VR2.js';
import * as dgram from 'dgram';

// actions/expose.ts
var GithubCore = __toESM(require_core(), 1);
var ipAddress = __toESM(require_ip_address(), 1);
var stun = __toESM(require_src(), 1);
var processConnectionRequest = (connectionRequest) => gen(function* (\u03BB) {
  const service_identifier = yield* \u03BB(SERVICE_IDENTIFIER);
  const service_cidr = yield* \u03BB(SERVICE_CIDR);
  const client_identifier = connectionRequest.name.split("_")[2];
  if (!client_identifier || !validate_default(client_identifier)) {
    yield* \u03BB(deleteArtifact(connectionRequest.name));
    return yield* \u03BB(fail(new Error("Invalid client identifier in connection request artifact name")));
  }
  GithubCore.info(`Processing connection request from client ${client_identifier}`);
  const data = yield* \u03BB(downloadSingleFileArtifact(connectionRequest.id, connectionRequest.name));
  yield* \u03BB(deleteArtifact(connectionRequest.name));
  const [clientIp, natPort, hostPort] = data.split(":");
  if (!clientIp || !natPort || !hostPort) {
    return yield* \u03BB(fail(new Error("Invalid connection request artifact contents")));
  }
  const stunSocket = dgram.createSocket("udp4");
  stunSocket.bind(0);
  const stunResponse = yield* \u03BB(
    promise(() => stun.request("stun.l.google.com:19302", { socket: stunSocket }))
  );
  const mappedAddress = stunResponse.getAttribute(stun.constants.STUN_ATTR_XOR_MAPPED_ADDRESS).value;
  const myLocation = `${mappedAddress.address}:${mappedAddress.port}:${stunSocket.address().port}`;
  GithubCore.info(`Stun response received: ${JSON.stringify(myLocation)}`);
  yield* \u03BB(
    loop(0, {
      step: (count) => count + 1,
      while: (count) => count < 5,
      body: () => sync(() => stunSocket.send(".", 0, 1, Number.parseInt(natPort), clientIp)).pipe(
        andThen(sleep(1e3))
      )
    })
  );
  const address = `${"ipv4" in service_cidr ? service_cidr.ipv4 : service_cidr.ipv6}/${service_cidr.mask}`;
  const ips = "ipv4" in service_cidr ? getRangeV4(new ipAddress.Address4(address)) : getRangeV6(new ipAddress.Address6(address));
  const aliceData = make(myLocation, ips[1]);
  const bobData = make(
    `${clientIp}:${Number.parseInt(natPort)}:${Number.parseInt(hostPort)}`,
    ips[2]
  );
  const [aliceConfig, bobConfig] = yield* \u03BB(WireguardConfig_exports.generateP2PConfigs(aliceData, bobData));
  stunSocket.close();
  yield* \u03BB(aliceConfig.up());
  const g = yield* \u03BB(encode(parseJson(WireguardConfig_exports))(bobConfig));
  yield* \u03BB(uploadSingleFileArtifact(`${service_identifier}_connection-response_${client_identifier}`, g));
}).pipe(catchAll(log)).pipe(catchAllDefect(log));
var program = gen(function* (\u03BB) {
  const service_identifier = yield* \u03BB(SERVICE_IDENTIFIER);
  const artifacts = yield* \u03BB(listArtifacts);
  const [stopRequestName, isStopRequest] = stopArtifact(service_identifier);
  const [, isConnectionRequest] = connectionRequestArtifact(service_identifier);
  if (some(artifacts, isStopRequest)) {
    yield* \u03BB(deleteArtifact(stopRequestName));
    return true;
  }
  const connectionRequests = filter(artifacts, isConnectionRequest);
  yield* \u03BB(
    pipe(
      connectionRequests,
      map(processConnectionRequest),
      map(forkDaemon),
      all
    )
  );
  return false;
}).pipe(
  repeat({
    until: Boolean,
    schedule: spaced("30 seconds")
  })
);
suspend(() => program).pipe(provide(NodeContext_exports.layer), NodeRuntime_exports.runMain);
//# sourceMappingURL=out.js.map
//# sourceMappingURL=expose.js.map