FROM ubuntu:latest

RUN apt-get update && apt-get install -y iproute2 iptables tcpdump
RUN touch /usr/local/bin/router-firewall.sh
CMD ["/usr/local/bin/router-firewall.sh"]
