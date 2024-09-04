#!/usr/bin/env bash

set -euo pipefail

wg-quick up wg0
sleep 2s
ping 192.168.10.1 -c 5
sleep 1s
