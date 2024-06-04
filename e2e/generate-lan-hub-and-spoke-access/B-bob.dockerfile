FROM ubuntu:latest

RUN apt-get update && apt-get install -y iproute2 iptables tcpdump wireguard-tools wireguard
CMD ["sh", "-c", "ip route add 10.0.4.0/24 via 10.0.2.1"]
