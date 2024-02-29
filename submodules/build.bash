#!/usr/bin/env bash

# amd64 prebuilds
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=linux GOARCH=amd64 make && mv wireguard-go ../../build/linux-amd64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=darwin GOARCH=amd64 make && mv wireguard-go ../../build/darwin-amd64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=windows GOARCH=amd64 make && mv wireguard-go ../../build/windows-amd64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=freebsd GOARCH=amd64 make && mv wireguard-go ../../build/freebsd-amd64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=openbsd GOARCH=amd64 make && mv wireguard-go ../../build/openbsd-amd64-wireguard-go)

# arm64 prebuilds
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=linux GOARCH=arm64 make && mv wireguard-go ../../build/linux-arm64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=darwin GOARCH=arm64 make && mv wireguard-go ../../build/darwin-arm64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=windows GOARCH=arm64 make && mv wireguard-go ../../build/windows-arm64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=freebsd GOARCH=arm64 make && mv wireguard-go ../../build/freebsd-arm64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=openbsd GOARCH=arm64 make && mv wireguard-go ../../build/openbsd-arm64-wireguard-go)
