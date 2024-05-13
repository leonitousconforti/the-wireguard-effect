# the-wireguard-effect

Cross platform wireguard api client for nodejs built on wireguard-go with effect-ts.

## Motivation/ideation :bulb:

The motivation for this project came from wanting to create wireguard configurations and ultimately control a wireguard interface from JS for a different project of mine.

## Goals :white_check_mark:

- [x] - fully typed wireguard configurations (thanks to @effect/schema)
- [x] - doesn't require wireguard to be installed (ships with most prebuilds)
- [x] - cross platform (supports linux amd64, linux arm64, mac amd64, mac arm64, and windows amd64)
- [x] - userspace api implementation (the [Wireguard cross platform docs](https://www.wireguard.com/xplatform/) have details about it.)
- [x] - strong control over how the interface is managed across all platforms.

## Docs

Here is some content I am stealing from the [Unraid forums](https://forums.unraid.net/topic/84226-wireguard-quickstart/)

 - Remote access to server: Use your phone or computer to remotely access just the wireguard server.
 - Remote access to LAN: Builds on "Remote access to server", allowing you to access your entire LAN as well.
 - Server to server access: Allows two servers to connect to each other.
 - LAN to LAN access: Builds on "Server to server access", allowing two entire networks to communicate.
 - Server hub & spoke access: Builds on "Remote access to server", except that all of the VPN clients can connect to each other as well. Note that all traffic passes through the server.
 - LAN hub & spoke access: Builds on "Server hub & spoke access", allowing you to access your entire LAN as well.
 - VPN tunneled access: Route specific traffic through a commercial WireGuard VPN provider
 - Remote tunneled access: Securely access the Internet from untrusted networks by routing all of your traffic through the VPN and out the server's internet connection

![Image](./wireguard-help.png)

You can find examples for how to generate configs for each type of configuration displayed above in the [examples](./examples/) directory.

## Todo/Future :construction:

- Implement wg cli
- Wireguard windows arm64 prebuilds
- Obtain wintun drivers from public source and check hash during build, rather than just uploading them

## Non-Goals :wastebasket:

- Utilities for installing or checking if wireguard is installed on the system.
- Utilities to configure userspace network interfaces or generation of any iptables or nftables rules when bringing a config up using the userspace api

## Security :closed_lock_with_key:

the-wireguard-effect is not an official WireGuard project, and WireGuard is a registered trademark of Jason A. Donenfeld. The is a hobby project of mine, it has not received an independent security audit and never will.

## Contributing and getting help :speech_balloon: :beers:

Contributions, suggestions, and questions are welcome! If you are interested in developing, my recommendation is going to be to use the Devcontainer (even if you don't like them) as it has everything setup already to run the tests or to just let Github actions run the tests. I'll review prs and respond to issues/discussion here on GitHub but if you want more synchronous communication you can find me in the [effect discord](https://discord.gg/effect-ts) as @leonitous
