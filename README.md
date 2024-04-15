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

the-wireguard-effect should be able to manage interfaces using any of the follow implementations:

 - system-wireguard+system-wg-quick: Simplest option, just need to have wireguard for your platform installed.
 - system-wireguard+bundled-wg-quick: This option will use wireguard installed on your system but the included wg-quick script
 - system-wireguard-go+system-wg-quick: This option will use wireguard-go installed on your system and the wg-quick script from your system
 - bundled-wireguard-go+system-wg-quick: This option will use the bundled wireguard-go prebuild and the wg-quick script from your system
 - system-wireguard-go+bundled-wg-quick: This option will use wireguard-go from your system and the bundled wg-quick script
 - bundled-wireguard-go+bundled-wg-quick: This option will use the bundled wireguard-go and the bundled wg-quick script
 - This option will use the bundled wireguard-go prebuild and the bundled wg-quick script, great for if you can't assume that wireguard will be installed but might leave some performance on the table.
 - bundled-wireguard-go+userspace-api: This option will use the bundled wireguard-go prebuild and the wireguard userspace api
 - system-wireguard-go+userspace-api: This option will use the system wireguard-go and the userspace api, can run 'sudo-less' but the userspace api does not configure any routes so you must do so manually with something like iptables or netsh or find a different package to do so.

For all interface control implementations, you set if to use run the commands with sudo/admin privileges or to prompt the user for sudo/admin privileges using `@vscode/sudo-prompt`

## Todo/Future :construction:

- Nothing at the moment

## Non-Goals :wastebasket:

- Utilities for installing or checking if wireguard is installed on the system.
- Utilities to configure userspace network interfaces or generation of any iptables or nftables rules when bringing a config up using the userspace api

## Security :closed_lock_with_key:

the-wireguard-effect is not an official WireGuard project, and WireGuard is a registered trademark of Jason A. Donenfeld. The is a hobby project of mine, it has not received an independent security audit and never will.

## Contributing and getting help :speech_balloon: :beers:

Contributions, suggestions, and questions are welcome! If you are interested in developing, my recommendation is going to be to use the Devcontainer (even if you don't like them) as it has everything setup already to run the tests or to just let Github actions run the tests. I'll review prs and respond to issues/discussion here on GitHub but if you want more synchronous communication you can find me in the [effect discord](https://discord.gg/effect-ts) as @leonitous
