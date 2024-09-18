#!/bin/bash -i

set -eo pipefail
echo "🚀 Setting up the-wireguard-effect devcontainer..."

# https://github.com/devcontainers/features/pull/770
SHELL="$(which bash)" pnpm setup
source /home/vscode/.bashrc
pnpm config set store-dir $PNPM_HOME/store

echo "Initializing submodules"
sudo rm -rf submodules/osxcross/build
sudo rm -rf submodules/osxcross/target
git submodule update --init --recursive --depth 1

echo "📦 Installing repo dependencies..."
corepack install
corepack enable
pnpm install

echo "🔧 Setting up groups and permissions for \"sudo-less\" testing"
sudo groupadd wireguard-control
sudo usermod -a -G wireguard-control vscode
sudo usermod -a -G wireguard-control root
sudo mkdir -p /var/run/wireguard/
sudo chown -R root:wireguard-control /var/run/wireguard/

# echo "🏗️ Building..."
# pnpm build

# echo "🧪 Testing..."
# pnpm test

echo "✅ Devcontainer setup complete!"
echo "🙏 Thank you for contributing to the-wireguard-effect!"
echo "📝 P.S Don't forget to configure your git credentials with 'git config --global user.name you' and 'git config --global user.email you@z.com'"
