FROM alpine:latest
RUN apk add bash iproute2 iptables tcpdump --no-cache
CMD ["sh", "-c", "iptables -A FORWARD -j ACCEPT && iptables -t nat -A POSTROUTING -j MASQUERADE && sleep infinity"]
