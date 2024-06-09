FROM ubuntu:latest

ADD A-alice-wireguard.conf /etc/wireguard/wg0.conf
ADD A-alice-client-tests.sh /usr/local/bin/client-tests.sh
RUN apt-get update && apt-get install -y iproute2 iptables tcpdump wireguard-tools wireguard iputils-ping
CMD ["/usr/local/bin/client-tests.sh"]