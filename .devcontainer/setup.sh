#!/bin/bash -i

set -eo pipefail
echo "🚀 Setting up the-wireguard-effect devcontainer..."

# https://github.com/devcontainers/features/pull/770
SHELL="$(which bash)" pnpm setup
source /home/vscode/.bashrc
pnpm config set store-dir $PNPM_HOME/store

echo "Initializing submodules"
git submodule update --init --recursive

echo "📦 Installing global dependencies..."
npm uninstall -g pnpm
npm install -g @devcontainers/cli npm-check-updates pnpm@8

echo "📦 Installing repo dependencies..."
pnpm install

echo "🔧 Setting up groups and permissions for \"sudo-less\" testing"
sudo groupadd wireguard-control
sudo usermod -a -G wireguard-control vscode
sudo usermod -a -G wireguard-control root
sudo mkdir -p /var/run/wireguard/
sudo chown -R root:wireguard-control /var/run/wireguard/

echo "✅ Devcontainer setup complete! You should run \"pnpm build\" and \"pnpm test\" now"
echo "🙏 Thank you for contributing to the-wireguard-effect!"
echo "📝 P.S Don't forget to configure your git credentials with 'git config --global user.name you' and 'git config --global user.email you@z.com'"
