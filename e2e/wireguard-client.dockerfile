FROM ubuntu:latest@sha256:6015f66923d7afbc53558d7ccffd325d43b4e249f41a6e93eef074c9505d2233

RUN apt-get update && apt-get install -y iproute2 iptables tcpdump wireguard-tools wireguard iputils-ping
RUN touch /usr/local/bin/client-tests.sh && touch /etc/wireguard/wg0.conf
CMD ["/usr/local/bin/client-tests.sh"]
