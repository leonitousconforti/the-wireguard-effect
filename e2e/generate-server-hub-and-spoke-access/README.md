# Server hub and spoke access

Alice is a public server with wireguard exposed on their chosen port and Bob, Charlie, and Dave are wireguard clients behind NAT with no port forwarding.

## Running this example

```sh
tsx generate-configs.ts
docker compose build
docker compose up --abort-on-container-failure
```
