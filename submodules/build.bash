#!/usr/bin/env bash

set -euxo pipefail
mkdir -p ../dist/prebuilds

# amd64 wireguard-go prebuilds
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=windows GOARCH=amd64 make && mv wireguard-go ../../dist/prebuilds/win32-amd64-wireguard-go.exe && chmod +x ../../dist/prebuilds/win32-amd64-wireguard-go.exe)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=linux GOARCH=amd64 make && mv wireguard-go ../../dist/prebuilds/linux-amd64-wireguard-go && chmod +x ../../dist/prebuilds/linux-amd64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=darwin GOARCH=amd64 make && mv wireguard-go ../../dist/prebuilds/darwin-amd64-wireguard-go && chmod +x ../../dist/prebuilds/darwin-amd64-wireguard-go)

# arm64 wireguard-go prebuilds
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=windows GOARCH=arm64 make && mv wireguard-go ../../dist/prebuilds/win32-arm64-wireguard-go.exe && chmod +x ../../dist/prebuilds/win32-arm64-wireguard-go.exe)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=linux GOARCH=arm64 make && mv wireguard-go ../../dist/prebuilds/linux-arm64-wireguard-go && chmod +x ../../dist/prebuilds/linux-arm64-wireguard-go)
(cd ./wireguard-go && make clean && GOFLAGS="-buildvcs=false" GOOS=darwin GOARCH=arm64 make && mv wireguard-go ../../dist/prebuilds/darwin-arm64-wireguard-go && chmod +x ../../dist/prebuilds/darwin-arm64-wireguard-go)

# wintun prebuilds (TODO: aquire these from a public source and check hashes)
# (cd ./wintun && cp wintun-amd64.dll ../../dist/prebuilds/win32-amd64-wintun.dll)
# (cd ./wintun && cp wintun-arm64.dll ../../dist/prebuilds/win32-arm64-wintun.dll)
(cd ./wintun && cp wintun-amd64.dll ../../dist/prebuilds/wintun.dll)

# nvlist prebuilds (for wg-quick freebsd)
(cd ./nvlist && git reset --hard && git apply ../../patches/nvlist.patch && cd pkg && make deb && make clean)
sudo apt-get install ./nvlist/libnv1_0.0.1_amd64.deb
sudo apt-get install ./nvlist/libnv-dev_0.0.1_amd64.deb
sudo ldconfig
(cd ./nvlist && git reset --hard && git clean --force -d)

# osxcross for cross compiling wg to darwin
(cd ./osxcross/tarballs && wget -nc https://s3.dockerproject.org/darwin/v2/MacOSX10.10.sdk.tar.xz)
(cd ./osxcross && sudo UNATTENDED=1 TARGET_DIR=/usr/local/osxcross ./build.sh)

# wg-quick prebuilds
(cd ./wireguard-tools/src && make clean && PLATFORM=linux make && cp ./wg ../../../dist/prebuilds/linux-wg && chmod +x ../../../dist/prebuilds/linux-wg)
(cd ./wireguard-tools/src && make clean && PATH=/usr/local/osxcross/bin/:$PATH PLATFORM=darwin V=1 CC=o64-clang make && cp ./wg ../../../dist/prebuilds/darwin-wg && chmod +x ../../../dist/prebuilds/darwin-wg)
(cd ./wireguard-tools && git apply ../../patches/wg-quick-linux.patch && cp src/wg-quick/linux.bash ../../dist/prebuilds/linux-wg-quick && chmod +x ../../dist/prebuilds/linux-wg-quick)
(cd ./wireguard-tools && git apply ../../patches/wg-quick-darwin.patch && cp src/wg-quick/darwin.bash ../../dist/prebuilds/darwin-wg-quick && chmod +x ../../dist/prebuilds/darwin-wg-quick)
(cd ./wireguard-tools && git reset --hard)

# Wireguard-windows prebuilds
(cd ./wireguard-windows && unset GOROOT && make clean && make amd64/wireguard.exe && cp amd64/wireguard.exe ../../dist/prebuilds/win32-amd64-wireguard.exe)

# Windows WSL2 modified linux kernel (https://github.com/microsoft/WSL/issues/7547)
(cd ./WSL2-Linux-Kernel && git apply ../../patches/WSL2-linux-kernel.patch)
(cd ./WSL2-Linux-Kernel && make -j $(nproc) KCONFIG_CONFIG=Microsoft/config-wsl CC="ccache gcc")
(cd ./WSL2-Linux-Kernel && cp arch/x86/boot/bzImage ../../dist/prebuilds/win32-amd64-wsl2-linux-kernel-bzImage)
(cd ./WSL2-Linux-Kernel && rm -f Microsoft/*.old)
(cd ./WSL2-Linux-Kernel && git reset --hard)

# Symlink prebuilds
(cd ../src && ln -s ../dist/prebuilds/* .)
(cd ../dist/dist/cjs && ln -s ../../prebuilds/* .)
(cd ../dist/dist/esm && ln -s ../../prebuilds/* .)

# Copy licenses
(cd ./wintun && cp ./LICENSE.txt ../../dist/prebuilds/LICENSE-wintun)
(cd ./wireguard-go && cp ./LICENSE ../../dist/prebuilds/LICENSE-wireguard-go)
(cd ./wireguard-tools && cp ./COPYING ../../dist/prebuilds/LICENSE-wireguard-tools)

# For testing locally in the devcontainer
sudo setcap "all=ep" ../dist/prebuilds/linux-amd64-wireguard-go
sudo setcap "all=ep" ../dist/prebuilds/linux-arm64-wireguard-go
