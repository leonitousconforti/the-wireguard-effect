#!/usr/bin/env bash

(cd ./wireguard-go && make clean)

# amd64 prebuilds
(cd ./wireguard-go && GOOS=linux GOARCH=amd64 make && mv wireguard-go ../../prebuild/linux-amd64-wireguard-go)
(cd ./wireguard-go && GOOS=darwin GOARCH=amd64 make && mv wireguard-go ../../prebuild/darwin-amd64-wireguard-go)
(cd ./wireguard-go && GOOS=windows GOARCH=amd64 make && mv wireguard-go ../../prebuild/windows-amd64-wireguard-go)

# arm64 prebuilds
(cd ./wireguard-go && GOOS=linux GOARCH=arm64 make && mv wireguard-go ../../prebuild/linux-arm64-wireguard-go)
(cd ./wireguard-go && GOOS=darwin GOARCH=arm64 make && mv wireguard-go ../../prebuild/darwin-arm64-wireguard-go)
(cd ./wireguard-go && GOOS=windows GOARCH=arm64 make && mv wireguard-go ../../prebuild/windows-arm64-wireguard-go)
