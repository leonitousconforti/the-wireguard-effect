---
"the-wireguard-effect": patch
---

Fix two regressions from the effect 4.0.1 upgrade that broke every platform test.

`@effect/platform-node-shared` 4.0.1 signals a spawned process group on scope
release even when the leader has already exited zero. `wireguard-go` daemonizes
by opening the UAPI socket, forking, and exiting zero in the parent, so the
surviving daemon was killed the moment the spawn scope closed. The unix spawn is
now unreferenced, which skips that cleanup.

`NodeSocket` 4.0.1 also changed an `end` event from completing successfully to
failing with a `SocketCloseError` of code 1000. The wireguard userspace api
answers a request and then hangs up, so that clean close is the normal
termination of a complete response. `userspaceContact` now treats it as the end
of the stream and still relies on the trailing errno line to detect a request
that was not understood.
