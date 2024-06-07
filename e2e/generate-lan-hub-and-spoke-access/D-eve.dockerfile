FROM ubuntu:latest

RUN apt-get update && apt-get install -y iproute2 iptables tcpdump iputils-ping
CMD ["sh", "-c", "ip route add 10.0.5.0/24 via 10.0.4.2 && sleep infinity"]
