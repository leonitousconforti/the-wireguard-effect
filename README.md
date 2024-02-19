# the-wireguard-effect

Cross platform userspace wireguard api client for nodejs built on wireguard-go with effect-ts.

## Motivation/ideation :bulb:

The motivation for this project came from wanting to communicate between two Github Actions runners on the same workflow. I needed to send network requests

## Goals :white_check_mark:

- [x] - don't need to have wireguard installed
- [x] - cross platform (supports linux amd64, linux arm64, mac amd64, mac arm64, windows amd64, and windows arm64)
- [x] - extensible, more platforms can be included by just compiling wireguard-go to target them. Only downside is it increases the distribution size
- [x] - userspace (at least my code, the node.js part, operates entirely in userspace)
- [x] - Github actions to allow two runners in the same workflow to communicate

## Non-Goals :wastebasket:

- Performance. I know I should be using the wireguard module when on a linux host, but for simplicity this uses wireguard-go on all platforms

- Direct interface control. This only implements the userspace cross platform wireguard api and does not implement any of the ioctl methods of controlling a wireguard interface on any platforms. This means it can not control a tunnel brought up using wg / wg-quick.

- CommonJS: I understand this might be a deal breaker to some, but this is a ESM only package

## Compatibility :closed_lock_with_key:

As of writing, there is only one version of the wireguard api. If this changes in the future, I will update the package to add compatibility for the newer version.

## Contributing and getting help :speech_balloon: :beers:

Contributions, suggestions, and questions are welcome! I'll review prs and respond to issues/discussion here on GitHub but if you want more synchronous communication you can find me in the [effect discord](https://discord.gg/effect-ts) as @leonitous

## Wireguard XPlatform docs

https://www.wireguard.com/xplatform/
