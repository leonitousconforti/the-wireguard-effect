# the-wireguard-effect

Cross platform wireguard api client for nodejs built on wireguard-go with effect-ts.

## Motivation/ideation :bulb:

The motivation for this project came from wanting to create wireguard configurations and ultimately control a wireguard interface from JS for a different project of mine.

## Goals :white_check_mark:

- [x] - fully typed wireguard configurations (thanks to @effect/schema)
- [x] - doesn't require wireguard to be installed (ships with most prebuilds)
- [x] - cross platform (supports linux amd64, linux arm64, mac amd64, mac arm64, windows amd64, and windows arm64, freebsd amd64, freebsd arm64, openbsd amd64, and openbsd arm64)
- [x] - userspace api implementation (the [Wireguard cross platform docs](https://www.wireguard.com/xplatform/) have details about it.)
- [x] - strong control over how the interface is managed across all platforms.

## Todo/Future :construction:

- Switch from execa to @effect/platform Command and Executor

## Non-Goals :wastebasket:

- Utilities for installing or checking if wireguard is installed on the system.
- Utilities to configure userspace network interfaces or generation of any iptables or nftables rules when bringing a config up using the userspace api

## Security :closed_lock_with_key:

the-wireguard-effect is not an official WireGuard project, and WireGuard is a registered trademark of Jason A. Donenfeld. The is a hobby project of mine, it has not received an independent security audit and never will.

## Contributing and getting help :speech_balloon: :beers:

Contributions, suggestions, and questions are welcome! If you are interested in developing, my recommendation is going to be to use the Devcontainer (even if you don't like them) as it has everything setup already to run the tests or to just let Github actions run the tests. I'll review prs and respond to issues/discussion here on GitHub but if you want more synchronous communication you can find me in the [effect discord](https://discord.gg/effect-ts) as @leonitous
