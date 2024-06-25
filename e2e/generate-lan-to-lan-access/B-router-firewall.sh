#!/usr/bin/env bash

set -euo pipefail

iptables -A FORWARD -m conntrack --ctstate NEW -j ACCEPT
iptables -A FORWARD -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -t nat -A PREROUTING -p udp --dport 51820 -j DNAT --to-destination 10.0.2.3:41820
iptables -t nat -A POSTROUTING -p udp -d 10.0.2.3 --dport 41820 -j MASQUERADE
iptables -t nat -A POSTROUTING -j MASQUERADE
sleep 30s
