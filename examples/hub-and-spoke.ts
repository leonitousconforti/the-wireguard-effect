import * as Wireguard from "../src/index.js";

// Alice will be the hub
const aliceEndpoint = "10.0.1.1:51820";

// Bob, Charlie, Dave, and Eve will be spokes
const bobEndpoint = "10.0.2.1:51820";
const charlieEndpoint = "10.0.3.1:51820";
const daveEndpoint = "10.0.4.1:51820";
const eveEndpoint = "10.0.5.1:51820";

// Distribute these configs somehow
const [hubConfig, spokeConfigs] = Wireguard.WireguardInterfaceConfig.generateHubSpokeConfigs(aliceEndpoint, [
    bobEndpoint,
    charlieEndpoint,
    daveEndpoint,
    eveEndpoint,
]);

console.log(hubConfig);
console.log(spokeConfigs);
