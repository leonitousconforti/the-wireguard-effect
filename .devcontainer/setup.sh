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
npm install -g @devcontainers/cli npm-check-updates

echo "📦 Installing repo dependencies..."
pnpm install

echo "✅ Devcontainer setup complete! You should run \"pnpm build\" and \"pnpm test\" now"
echo "🙏 Thank you for contributing to the-wireguard-effect!"
echo "📝 P.S Don't forget to configure your git credentials with 'git config --global user.name you' and 'git config --global user.email you@z.com'"
