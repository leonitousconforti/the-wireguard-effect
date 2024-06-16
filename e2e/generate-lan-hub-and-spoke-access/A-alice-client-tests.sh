#!/usr/bin/env bash

set -euo pipefail

wg-quick up wg0
ping 192.168.10.1 -c 3
ping 192.168.10.2 -c 3
ping 192.168.10.3 -c 3
ping 192.168.10.100 -c 3
ping 10.0.1.4 -c 3
ping 10.0.1.5 -c 3
sleep 5s
