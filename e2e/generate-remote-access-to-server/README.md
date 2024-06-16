# Server to Server

Alice is a public server with wireguard exposed on their chosen port and Bob is a wireguard client behind NAT with no port forwarding.

## Running this example

```sh
tsx generate-configs.ts
docker compose build
docker compose up --abort-on-container-failure
```
