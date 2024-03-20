# the-wireguard-effect

Cross platform userspace wireguard api client for nodejs built on wireguard-go with effect-ts. The [Wireguard cross platform docs](https://www.wireguard.com/xplatform/) are a good place to look if you don't know what I am talking about.

## Motivation/ideation :bulb:

The motivation for this project came from wanting to communicate between two Github Actions runners on the same workflow. I needed to send network requests

## Goals :white_check_mark:

- [x] - don't need to have wireguard installed
- [x] - cross platform (supports linux amd64, linux arm64, mac amd64, mac arm64, windows amd64, and windows arm64, freebsd amd64, freebsd arm64, openbsd amd64, and openbsd arm64)
- [x] - userspace (at least my code, the node.js part, operates entirely in userspace. When wireguard-go needs admin permissions you will be prompted)
- [x] - Github actions to allow two runners in the same workflow to communicate

## Non-Goals :wastebasket:

- Performance. I know I should be using the wireguard kernel module when on a linux host, but for simplicity this uses wireguard-go on all platforms.

## Compatibility :closed_lock_with_key:

As of writing, there is only one version of the wireguard api. If this changes in the future, I will update the package to add compatibility for the newer version.

## Contributing and getting help :speech_balloon: :beers:

Contributions, suggestions, and questions are welcome! I'll review prs and respond to issues/discussion here on GitHub but if you want more synchronous communication you can find me in the [effect discord](https://discord.gg/effect-ts) as @leonitous
