---
"the-wireguard-effect": patch
---

Fix the remaining type-aware Effect lint diagnostics: use `Schema.Finite` and `Schema.FiniteFromString` for port, byte counter, and firewall mark schemas, and drop an unnecessary `Effect.sync` wrapper in WireguardGenerate. No intended behavior changes.
