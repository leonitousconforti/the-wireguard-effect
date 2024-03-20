import { __toESM, require_core, require_ip_address, require_src, v4_default, gen, listArtifacts, SERVICE_IDENTIFIER, connectionResponseArtifact, filter, die, sleep, repeat, promise, uploadSingleFileArtifact, downloadSingleFileArtifact, deleteArtifact, decode, parseJson, WireguardConfig_exports, getRangeV4, getRangeV6, log, tapError, tapDefect, suspend, provide, NodeContext_exports, NodeRuntime_exports } from './chunk-JXZFWSLG.js';
import * as dgram from 'dgram';

// actions/connect.ts
var GithubCore = __toESM(require_core(), 1);
var ipAddress = __toESM(require_ip_address(), 1);
var stun = __toESM(require_src(), 1);
var client_identifier = v4_default();
var getConnectionResponse = gen(function* (\u03BB) {
  const artifacts = yield* \u03BB(listArtifacts);
  const service_identifier = yield* \u03BB(SERVICE_IDENTIFIER);
  const [, isConnectionResponse] = connectionResponseArtifact(service_identifier, client_identifier);
  const connectionResponses = filter(artifacts, isConnectionResponse);
  if (connectionResponses.length >= 2) {
    yield* \u03BB(
      die(
        new Error(
          `Received more than one connection response artifact for client: ${client_identifier} from service: ${service_identifier}`
        )
      )
    );
  }
  if (!connectionResponses[0])
    yield* \u03BB(sleep("20 seconds"));
  return connectionResponses[0];
}).pipe(repeat({ until: (artifact) => artifact !== void 0 }));
var program = gen(function* (\u03BB) {
  const service_identifier = yield* \u03BB(SERVICE_IDENTIFIER);
  const stunSocket = dgram.createSocket("udp4");
  stunSocket.bind(0);
  const stunResponse = yield* \u03BB(
    promise(() => stun.request("stun.l.google.com:19302", { socket: stunSocket }))
  );
  const mappedAddress = stunResponse.getAttribute(stun.constants.STUN_ATTR_XOR_MAPPED_ADDRESS).value;
  const myLocation = `${mappedAddress.address}:${mappedAddress.port}:${stunSocket.address().port}`;
  const timer = setInterval(() => stunSocket.send(" ", 0, 1, 80, "3.3.3.3"), 1e4);
  yield* \u03BB(
    uploadSingleFileArtifact(`${service_identifier}_connection-request_${client_identifier}`, myLocation)
  );
  const connectionResponse = yield* \u03BB(getConnectionResponse);
  const data = yield* \u03BB(downloadSingleFileArtifact(connectionResponse.id, connectionResponse.name));
  yield* \u03BB(deleteArtifact(connectionResponse.name));
  GithubCore.info(data);
  const config = yield* \u03BB(decode(parseJson(WireguardConfig_exports))(data));
  const address = `${"ipv4" in config.Address ? config.Address.ipv4 : config.Address.ipv6}/${config.Address.mask}`;
  const ips = "ipv4" in config.Address ? getRangeV4(new ipAddress.Address4(address)) : getRangeV6(new ipAddress.Address6(address));
  GithubCore.setOutput("service-address", ips[1]);
  clearInterval(timer);
  stunSocket.close();
  yield* \u03BB(config.up());
  yield* \u03BB(log("Connection established"));
}).pipe(tapError(log)).pipe(tapDefect(log));
suspend(() => program).pipe(provide(NodeContext_exports.layer), NodeRuntime_exports.runMain);
//# sourceMappingURL=out.js.map
//# sourceMappingURL=connect.js.map