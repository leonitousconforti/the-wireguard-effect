---
"the-wireguard-effect": patch
---

Keep the bundled `wireguard-go` daemon alive on unix after `upScoped`.

`@effect/platform-node-shared` 4.0.1 started signalling a spawned process group
on scope release even when the leader had already exited zero. `wireguard-go`
daemonizes by opening the UAPI socket, forking, and exiting zero in the parent,
so the surviving daemon was killed the moment the spawn scope closed and the
socket was gone before `setConfig` could reach it. The spawn is now unreferenced,
which skips that cleanup.
