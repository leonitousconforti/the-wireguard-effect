#!/usr/bin/env bash

set -euo pipefail

ip route add 10.0.5.0/24 via 10.0.2.2
wg-quick up wg0
ping -c 2 10.0.4.2
