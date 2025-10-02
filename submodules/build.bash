#!/usr/bin/env bash

set -euxo pipefail
mkdir -p ./prebuilds

# amd64 wireguard-go prebuilds
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=windows GOARCH=amd64 make && mv wireguard-go ../prebuilds/win32-amd64-wireguard-go.exe && chmod +x ../prebuilds/win32-amd64-wireguard-go.exe)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=linux GOARCH=amd64 make && mv wireguard-go ../prebuilds/linux-amd64-wireguard-go && chmod +x ../prebuilds/linux-amd64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=darwin GOARCH=amd64 make && mv wireguard-go ../prebuilds/darwin-amd64-wireguard-go && chmod +x ../prebuilds/darwin-amd64-wireguard-go)

# arm64 wireguard-go prebuilds
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=windows GOARCH=arm64 make && mv wireguard-go ../prebuilds/win32-arm64-wireguard-go.exe && chmod +x ../prebuilds/win32-arm64-wireguard-go.exe)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=linux GOARCH=arm64 make && mv wireguard-go ../prebuilds/linux-arm64-wireguard-go && chmod +x ../prebuilds/linux-arm64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=darwin GOARCH=arm64 make && mv wireguard-go ../prebuilds/darwin-arm64-wireguard-go && chmod +x ../prebuilds/darwin-arm64-wireguard-go)

# wintun prebuilds (TODO: acquire these from a public source and check hashes)
# (cd ./wintun && cp wintun-amd64.dll ../prebuilds/win32-amd64-wintun.dll)
# (cd ./wintun && cp wintun-arm64.dll ../prebuilds/win32-arm64-wintun.dll)
(cd ./wintun && cp wintun-amd64.dll ../prebuilds/wintun.dll)

# wg-quick prebuilds
(cd ./wireguard-tools/src && make clean && PLATFORM=linux make && cp ./wg ../../prebuilds/linux-wg && chmod +x ../../prebuilds/linux-wg)
(cd ./wireguard-tools/src && make clean && docker run --rm -v "$(pwd)":/workdir -e PLATFORM=darwin -e CROSS_TRIPLE=x86_64-apple-darwin multiarch/crossbuild make && cp ./wg ../../prebuilds/darwin-wg && chmod +x ../../prebuilds/darwin-wg)

(cd ./wireguard-tools && git apply ../../patches/wg-quick-linux.patch && cp src/wg-quick/linux.bash ../prebuilds/linux-wg-quick && chmod +x ../prebuilds/linux-wg-quick && git apply -R ../../patches/wg-quick-linux.patch)
(cd ./wireguard-tools && git apply ../../patches/wg-quick-darwin.patch && cp src/wg-quick/darwin.bash ../prebuilds/darwin-wg-quick && chmod +x ../prebuilds/darwin-wg-quick && git apply -R ../../patches/wg-quick-darwin.patch)

# Wireguard-windows prebuilds
(cd ./wireguard-windows && git apply ../../patches/wireguard-windows-makefile.patch)
(cd ./wireguard-windows && unset GOROOT && make clean && make amd64/wireguard.exe && cp amd64/wireguard.exe ../prebuilds/win32-amd64-wireguard.exe)
(cd ./wireguard-windows && git apply -R ../../patches/wireguard-windows-makefile.patch)

# Symlink prebuilds
(cd ../src && ln -s ../submodules/prebuilds/* .)
(cd ../dist && ln -s ../submodules/prebuilds/* .)

# Copy licenses
(cd ./wintun && cp ./LICENSE.txt ../../dist/LICENSE-wintun)
(cd ./wireguard-go && cp ./LICENSE ../../dist/LICENSE-wireguard-go)
(cd ./wireguard-tools && cp ./COPYING ../../dist/LICENSE-wireguard-tools)

# For testing locally in the devcontainer
# sudo setcap "all=ep" ../dist/linux-amd64-wireguard-go
# sudo setcap "all=ep" ../dist/linux-arm64-wireguard-go
