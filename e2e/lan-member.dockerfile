FROM ubuntu:latest@sha256:6015f66923d7afbc53558d7ccffd325d43b4e249f41a6e93eef074c9505d2233

RUN apt-get update && apt-get install -y iproute2 iptables tcpdump iputils-ping
RUN touch /usr/local/bin/lan-member.sh
CMD ["/usr/local/bin/lan-member.sh"]
