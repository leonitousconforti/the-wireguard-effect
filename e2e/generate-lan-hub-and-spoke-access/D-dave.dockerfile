FROM ubuntu:latest

RUN apt-get update && apt-get install -y iproute2 iptables tcpdump wireguard-tools wireguard
CMD ["sh", "-c", "sleep 10"]
