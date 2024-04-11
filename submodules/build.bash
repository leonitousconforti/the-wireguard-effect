#!/usr/bin/env bash

set -euxo pipefail
mkdir -p ../dist/prebuilds

# amd64 wireguard-go prebuilds
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=windows GOARCH=amd64 make && mv wireguard-go ../../dist/prebuilds/win32-amd64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=linux GOARCH=amd64 make && mv wireguard-go ../../dist/prebuilds/linux-amd64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=darwin GOARCH=amd64 make && mv wireguard-go ../../dist/prebuilds/darwin-amd64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=freebsd GOARCH=amd64 make && mv wireguard-go ../../dist/prebuilds/freebsd-amd64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=openbsd GOARCH=amd64 make && mv wireguard-go ../../dist/prebuilds/openbsd-amd64-wireguard-go)

# arm64 wireguard-go prebuilds
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=windows GOARCH=arm64 make && mv wireguard-go ../../dist/prebuilds/win32-arm64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=linux GOARCH=arm64 make && mv wireguard-go ../../dist/prebuilds/linux-arm64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=darwin GOARCH=arm64 make && mv wireguard-go ../../dist/prebuilds/darwin-arm64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=freebsd GOARCH=arm64 make && mv wireguard-go ../../dist/prebuilds/freebsd-arm64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=openbsd GOARCH=arm64 make && mv wireguard-go ../../dist/prebuilds/openbsd-arm64-wireguard-go)

# wintun prebuilds
(cd ./wintun && cp wintun-amd64.dll ../../dist/prebuilds/win32-amd64-wintun.dll)
(cd ./wintun && cp wintun-arm64.dll ../../dist/prebuilds/win32-arm64-wintun.dll)

# wireguard-tools prebuilds
(cd ./wireguard-tools && cp src/wg-quick/linux.bash ../../dist/prebuilds/linux-wg-quick && chmod +x ../../dist/prebuilds/linux-wg-quick)
(cd ./wireguard-tools && cp src/wg-quick/darwin.bash ../../dist/prebuilds/darwin-wg-quick && chmod +x ../../dist/prebuilds/darwin-wg-quick)
(cd ./wireguard-tools && cp src/wg-quick/freebsd.bash ../../dist/prebuilds/freebsd-wg-quick && chmod +x ../../dist/prebuilds/freebsd-wg-quick)
(cd ./wireguard-tools && cp src/wg-quick/openbsd.bash ../../dist/prebuilds/openbsd-wg-quick && chmod +x ../../dist/prebuilds/openbsd-wg-quick)

# Wireguard-windows prebuilds
(export GOROOT=.deps/go && cd ./wireguard-windows && make clean && make amd64/wireguard.exe)

# Windows WSL2 modified linux kernel (https://github.com/microsoft/WSL/issues/7547)
(cd ./WSL2-Linux-Kernel && git apply ../WSL2-modified.patch)
(cd ./WSL2-Linux-Kernel && make -j $(nproc) KCONFIG_CONFIG=Microsoft/config-wsl CC="ccache gcc")
(cd ./WSL2-Linux-Kernel && rm -f Microsoft/*.old)
(cd ./WSL2-Linux-Kernel && git reset --hard)

# Symlink prebuilds
(cd ../src/internal && ln -s ../../dist/prebuilds/* .)
(cd ../dist/dist/cjs/internal && ln -s ../../../prebuilds/* .)
(cd ../dist/dist/esm/internal && ln -s ../../../prebuilds/* .)

# Copy licenses
# (cd ./wintun && cp ./LICENSE.txt ../../dist/prebuilds/LICENSE-wintun)
(cd ./wireguard-go && cp ./LICENSE ../../dist/prebuilds/LICENSE-wireguard-go)
(cd ./wireguard-tools && cp ./COPYING ../../dist/prebuilds/LICENSE-wireguard-tools)
