# Remote access to LAN

Alice is a public server with wireguard exposed on their chosen port and Bob is a wireguard client behind NAT with no port forwarding. Charlie is a lan member on Alice's LAN.

## Running this example

```sh
tsx generate-configs.ts
docker compose build
docker compose up --abort-on-container-failure
```
