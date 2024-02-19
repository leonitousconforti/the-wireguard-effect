#!/usr/bin/env bash

(cd ./wireguard-go && make clean)

# amd64 prebuilds
(cd ./wireguard-go && GOOS=linux GOARCH=amd64 make && mv wireguard-go ../../build/linux-amd64-wireguard-go)
(cd ./wireguard-go && GOOS=darwin GOARCH=amd64 make && mv wireguard-go ../../build/darwin-amd64-wireguard-go)
(cd ./wireguard-go && GOOS=windows GOARCH=amd64 make && mv wireguard-go ../../build/windows-amd64-wireguard-go)

# arm64 prebuilds
(cd ./wireguard-go && GOOS=linux GOARCH=arm64 make && mv wireguard-go ../../build/linux-arm64-wireguard-go)
(cd ./wireguard-go && GOOS=darwin GOARCH=arm64 make && mv wireguard-go ../../build/darwin-arm64-wireguard-go)
(cd ./wireguard-go && GOOS=windows GOARCH=arm64 make && mv wireguard-go ../../build/windows-arm64-wireguard-go)
