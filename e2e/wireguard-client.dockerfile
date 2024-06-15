FROM ubuntu:latest

RUN apt-get update && apt-get install -y iproute2 iptables tcpdump wireguard-tools wireguard iputils-ping
RUN touch /usr/local/bin/client-tests.sh && touch /etc/wireguard/wg0.conf
CMD ["/usr/local/bin/client-tests.sh"]
