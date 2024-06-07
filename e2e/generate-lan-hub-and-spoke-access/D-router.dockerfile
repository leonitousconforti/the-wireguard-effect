FROM ubuntu:latest

RUN apt-get update && apt-get install -y iproute2 iptables tcpdump
CMD ["sh", "-c", "iptables -A FORWARD -j ACCEPT && iptables -t nat -A POSTROUTING -j MASQUERADE && sleep infinity"]
