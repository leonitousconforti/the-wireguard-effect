# Server to Server

Alice and Bob are both public servers with wireguard exposed on their chosen ports.

## Running this example

```sh
tsx generate-configs.ts
docker compose build
docker compose up --abort-on-container-failure
```
