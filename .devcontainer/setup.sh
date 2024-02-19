#!/bin/bash -i

set -eo pipefail
echo "🚀 Setting up the-wireguard-effect devcontainer..."

# https://github.com/devcontainers/features/pull/770
SHELL="$(which bash)" pnpm setup
source /home/vscode/.bashrc
pnpm config set store-dir $PNPM_HOME/store

echo "📦 Installing global dependencies..."
npm install -g @devcontainers/cli tsx

echo "📦 Installing repo dependencies..."
pnpm install

echo "🏗️ Building + testing..."
pnpm build

echo "✅ Devcontainer setup complete!"
echo "🙏 Thank you for contributing to the-wireguard-effect!"
echo "📝 P.S Don't forget to configure your git credentials with 'git config --global user.name you' and 'git config --global user.email you@z.com'"
