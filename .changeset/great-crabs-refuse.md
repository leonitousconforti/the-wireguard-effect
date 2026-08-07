---
"the-wireguard-effect": patch
---

Update wireguard submodules (wireguard-go, wireguard-tools, wireguard-windows, osxcross) and fix the wireguard-windows prebuild: define LANG_PERSIAN and LANG_SINHALESE for windres, which are missing from mingw-w64 resource headers, and build with the go toolchain vendored by the wireguard-windows Makefile since its go.mod now requires go >= 1.25.
