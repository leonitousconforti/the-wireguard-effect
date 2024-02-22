import * as Wireguard from "../src/index.js";

const aliceEndpoint = "10.0.1.1:51820";
const bobEndpoint = "10.0.2.1:51820";

// Distribute these configs somehow
const [aliceConfig, bobConfig] = Wireguard.WireguardInterfaceConfig.generateP2PConfigs(aliceEndpoint, bobEndpoint);

console.log(aliceConfig);
console.log(bobConfig);
