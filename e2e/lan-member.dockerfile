FROM ubuntu:latest

RUN apt-get update && apt-get install -y iproute2 iptables tcpdump iputils-ping
RUN touch /usr/local/bin/lan-member.sh
CMD ["/usr/local/bin/lan-member.sh"]
