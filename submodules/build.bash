#!/usr/bin/env bash

set -euxo pipefail
mkdir -p ../dist/dist/prebuilds

# amd64 wireguard-go prebuilds
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=linux GOARCH=amd64 make && mv wireguard-go ../../dist/dist/prebuilds/linux-amd64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=darwin GOARCH=amd64 make && mv wireguard-go ../../dist/dist/prebuilds/darwin-amd64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=windows GOARCH=amd64 make && mv wireguard-go ../../dist/dist/prebuilds/win32-amd64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=freebsd GOARCH=amd64 make && mv wireguard-go ../../dist/dist/prebuilds/freebsd-amd64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=openbsd GOARCH=amd64 make && mv wireguard-go ../../dist/dist/prebuilds/openbsd-amd64-wireguard-go)

# arm64 wireguard-go prebuilds
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=linux GOARCH=arm64 make && mv wireguard-go ../../dist/dist/prebuilds/linux-arm64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=darwin GOARCH=arm64 make && mv wireguard-go ../../dist/dist/prebuilds/darwin-arm64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=windows GOARCH=arm64 make && mv wireguard-go ../../dist/dist/prebuilds/win32-arm64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=freebsd GOARCH=arm64 make && mv wireguard-go ../../dist/dist/prebuilds/freebsd-arm64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=openbsd GOARCH=arm64 make && mv wireguard-go ../../dist/dist/prebuilds/openbsd-arm64-wireguard-go)

# wintun prebuilds
(cd ./wintun && cp wintun-amd64.dll ../../dist/dist/prebuilds/win32-amd64-wintun.dll)
(cd ./wintun && cp wintun-arm64.dll ../../dist/dist/prebuilds/win32-arm64-wintun.dll)

# wireguard-tools prebuilds
(cd ./wireguard-tools && cp src/wg-quick/darwin.bash ../../dist/dist/prebuilds/darwin-wg-quick)
(cd ./wireguard-tools && cp src/wg-quick/linux.bash ../../dist/dist/prebuilds/linux-wg-quick)
(cd ./wireguard-tools && cp src/wg-quick/freebsd.bash ../../dist/dist/prebuilds/freebsd-wg-quick)
(cd ./wireguard-tools && cp src/wg-quick/openbsd.bash ../../dist/dist/prebuilds/openbsd-wg-quick)

(cp -r ../dist/dist/prebuilds/. ../dist/dist/cjs/internal/)
(cp -r ../dist/dist/prebuilds/. ../dist/dist/esm/internal/)
