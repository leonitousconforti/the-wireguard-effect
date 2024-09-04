#!/usr/bin/env bash

set -euo pipefail

ip route add 10.0.0.0/24 via 10.0.3.2
wg-quick up wg0
sleep 3s
ping 192.168.10.1 -c 3
ping 192.168.10.2 -c 3
ping 192.168.10.3 -c 3
ping 192.168.10.100 -c 3
ping 10.0.1.4 -c 3
ping 10.0.1.5 -c 3
sleep 8s
