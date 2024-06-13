FROM ubuntu:latest

RUN apt-get update && apt-get install -y iproute2 iptables tcpdump
CMD ["/usr/local/bin/router-firewall.sh"]
