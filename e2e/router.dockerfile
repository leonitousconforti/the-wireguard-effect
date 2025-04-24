FROM alpine:latest@sha256:a8560b36e8b8210634f77d9f7f9efd7ffa463e380b75e2e74aff4511df3ef88c
RUN apk add bash iproute2 iptables tcpdump --no-cache
CMD ["sh", "-c", "iptables -A FORWARD -j ACCEPT && iptables -t nat -A POSTROUTING -j MASQUERADE && sleep 30s"]
