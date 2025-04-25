#!/bin/bash -i

set -eo pipefail
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
echo "🚀 Setting up the-wireguard-effect devcontainer..."

echo "Initializing submodules"
git submodule update --init --recursive --depth 1

echo "📦 Installing repo dependencies..."
npm install --global corepack@latest
corepack install
corepack enable
pnpm install
pnpm clean

echo "🔧 Setting up groups and permissions for \"sudo-less\" testing"
sudo groupadd --force wireguard-control
sudo usermod -a -G wireguard-control vscode
sudo usermod -a -G wireguard-control root
sudo mkdir -p /var/run/wireguard/
sudo chown -R root:wireguard-control /var/run/wireguard/

echo "🏗️ Building..."
pnpm check
pnpm lint
pnpm circular
pnpm build
pnpm docgen

echo "🧪 Testing..."
pnpm coverage --run

echo "✅ Devcontainer setup complete!"
echo "🙏 Thank you for contributing to the-wireguard-effect!"
