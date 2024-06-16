#!/usr/bin/env bash

set -euo pipefail

ip route add 10.0.0.0/24 via 10.0.1.2
ip route add 192.168.10.0/24 via 10.0.1.3
sleep 30s
