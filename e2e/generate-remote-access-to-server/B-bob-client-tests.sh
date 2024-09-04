#!/usr/bin/env bash

set -euo pipefail

ip route add 10.0.0.0/24 via 10.0.1.2
wg-quick up wg0
sleep 2s
ping 192.168.10.1 -c 5
sleep 1s
