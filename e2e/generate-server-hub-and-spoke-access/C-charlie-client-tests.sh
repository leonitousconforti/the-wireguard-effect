#!/usr/bin/env bash

set -euo pipefail

ip route add 10.0.0.0/24 via 10.0.2.2
wg-quick up wg0
ping 192.168.10.1 -c 5
ping 192.168.10.2 -c 5
ping 192.168.10.3 -c 5
ping 192.168.10.100 -c 5
sleep 5s
