#!/usr/bin/env bash

set -euxo pipefail
mkdir -p ../dist/prebuilds

# Symlink prebuilds
(cd ../src && ln -s ../dist/prebuilds/* .)
(cd ../dist/dist/cjs && ln -s ../../prebuilds/* .)
(cd ../dist/dist/esm && ln -s ../../prebuilds/* .)

# Copy licenses
(cd ./wintun && cp ./LICENSE.txt ../../dist/prebuilds/LICENSE-wintun)
(cd ./wireguard-go && cp ./LICENSE ../../dist/prebuilds/LICENSE-wireguard-go)
(cd ./wireguard-tools && cp ./COPYING ../../dist/prebuilds/LICENSE-wireguard-tools)
