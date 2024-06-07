FROM ubuntu:latest

ADD D-dave.conf /etc/wireguard/wg0.conf
RUN apt-get update && apt-get install -y iproute2 iptables tcpdump wireguard-tools wireguard iputils-ping
CMD ["sh", "-c", "ip route add 10.0.5.0/24 via 10.0.4.2 && wg-quick up wg0 && sleep infinity"]
