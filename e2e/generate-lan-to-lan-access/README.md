# LAN to LAN access

Alice and Bob are public servers with wireguard exposed on their chosen ports. Charlie is a lan member on Alice's LAN and Dave is a lan member on Bob's LAN.

## Running this example

```sh
tsx generate-configs.ts
docker compose build
docker compose up --abort-on-container-failure
```
