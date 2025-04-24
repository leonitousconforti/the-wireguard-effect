FROM ubuntu:latest@sha256:1e622c5f073b4f6bfad6632f2616c7f59ef256e96fe78bf6a595d1dc4376ac02

RUN apt-get update && apt-get install -y iproute2 iptables tcpdump wireguard-tools wireguard iputils-ping
RUN touch /usr/local/bin/client-tests.sh && touch /etc/wireguard/wg0.conf
CMD ["/usr/local/bin/client-tests.sh"]
