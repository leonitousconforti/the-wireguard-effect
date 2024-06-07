FROM alpine:latest
RUN apk add bash iproute2 iptables tcpdump --no-cache
CMD ["sh", "-c", "sleep infinity"]
