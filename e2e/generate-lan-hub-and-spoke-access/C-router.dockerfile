FROM alpine:latest
RUN apk add bash iproute2 iptables tcpdump --no-cache
CMD ["sh", "-c", "ip route add 10.0.4.0/24 via 10.0.5.4"]
