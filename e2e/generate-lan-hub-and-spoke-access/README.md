# LAN Hub and Spoke access

In this example Alice, Bob, and Charlie will be wireguard peers (clients) - each on separate networks behind separate routers performing NAT. Dave will be the wireguard server behind network D along with two other lan clients Eve and Faye. Network D also performs nat so Dave will have "port forwarding" set up such that their wireguard server is accessible using router D's public ip address. Router A, router B, router C, and router D will be able to communicate with each other (this is where the internet would be).

We expect that Alice, Bob, and Charlie will all be able to communicate with Dave as well with Eve and Faye since they are on the same network as Dave. We also expect that Alice, Bob, and Charlie will all be able to communicate with each other, however, it should be noted that communication between between any three of them still flows through Dave.

## Running this example

```sh
tsx generate-configs.ts
docker compose build
docker compose up --abort-on-container-failure
```
