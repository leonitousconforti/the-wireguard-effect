#!/usr/bin/env bash

set -euo pipefail

wg-quick up wg0
ping 192.168.10.2 -c 2
