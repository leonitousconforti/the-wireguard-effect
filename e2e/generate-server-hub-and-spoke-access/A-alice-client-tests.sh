#!/usr/bin/env bash

set -euo pipefail

wg-quick up wg0
sleep 1s
ping 192.168.10.1 -c 5
ping 192.168.10.2 -c 5
ping 192.168.10.3 -c 5
ping 192.168.10.100 -c 5
sleep 10s
