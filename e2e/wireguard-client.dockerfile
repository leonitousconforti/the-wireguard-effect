FROM ubuntu:latest

RUN apt-get update && apt-get install -y iproute2 iptables tcpdump wireguard-tools wireguard iputils-ping
CMD ["/usr/local/bin/client-tests.sh"]
