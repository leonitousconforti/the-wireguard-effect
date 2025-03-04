#!/bin/bash -i

set -eo pipefail
echo "🚀 Setting up the-wireguard-effect devcontainer..."
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

echo "Fixing git permissions"
git config --global --add safe.directory "/workspaces/the-wireguard-effect"
git config --global --add safe.directory "/workspaces/the-wireguard-effect/submodules/osxcross"
git config --global --add safe.directory "/workspaces/the-wireguard-effect/submodules/wireguard-go"
git config --global --add safe.directory "/workspaces/the-wireguard-effect/submodules/wireguard-tools"

echo "Initializing submodules"
sudo rm -rf submodules/osxcross/build
sudo rm -rf submodules/osxcross/target
git submodule update --init --recursive --depth 1

echo "📦 Installing repo dependencies..."
npm install -g corepack@latest
corepack install
corepack enable
pnpm install

echo "🔧 Setting up groups and permissions for \"sudo-less\" testing"
sudo groupadd wireguard-control
sudo usermod -a -G wireguard-control vscode
sudo usermod -a -G wireguard-control root
sudo mkdir -p /var/run/wireguard/
sudo chown -R root:wireguard-control /var/run/wireguard/

echo "🏗️ Building..."
pnpm check
pnpm lint
pnpm circular
pnpm build

echo "🧪 Testing..."
pnpm coverage --run

echo "✅ Devcontainer setup complete!"
echo "🙏 Thank you for contributing to the-wireguard-effect!"
