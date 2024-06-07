FROM ubuntu:latest

ADD D-router-firewall.sh /usr/local/bin/D-router-firewall.sh
RUN apt-get update && apt-get install -y iproute2 iptables tcpdump
CMD [ "/usr/local/bin/D-router-firewall.sh" ]
