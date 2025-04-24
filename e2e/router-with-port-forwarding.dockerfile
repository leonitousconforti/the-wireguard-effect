FROM ubuntu:latest@sha256:1e622c5f073b4f6bfad6632f2616c7f59ef256e96fe78bf6a595d1dc4376ac02

RUN apt-get update && apt-get install -y iproute2 iptables tcpdump
RUN touch /usr/local/bin/router-firewall.sh
CMD ["/usr/local/bin/router-firewall.sh"]
