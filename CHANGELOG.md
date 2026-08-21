# the-wireguard-effect

## 0.0.73

### Patch Changes

- 7f820d3: Update Effect-TS packages
- 7f820d3: Update Effect-TS packages

## 0.0.72

### Patch Changes

- 51bec9c: Update wireguard submodules (wireguard-go, wireguard-tools, wireguard-windows, osxcross) and fix the wireguard-windows prebuild: define LANG_PERSIAN and LANG_SINHALESE for windres, which are missing from mingw-w64 resource headers, and build with the go toolchain vendored by the wireguard-windows Makefile since its go.mod now requires go >= 1.25.
- 1190ba5: Fix the remaining type-aware Effect lint diagnostics: use `Schema.Finite` and `Schema.FiniteFromString` for port, byte counter, and firewall mark schemas, and drop an unnecessary `Effect.sync` wrapper in WireguardGenerate. No intended behavior changes.

## 0.0.71

### Patch Changes

- 99ba8a4: Code cleanups in WireguardGenerate, WireguardPeer, and internal modules from enabling the type-aware Effect lints. No intended behavior changes.

## 0.0.70

### Patch Changes

- 7e84ff4: Update Effect-TS packages to v4.0.0-beta.104

## 0.0.69

### Patch Changes

- 6f83861: Update Effect-TS packages to v4.0.0-beta.103

## 0.0.68

### Patch Changes

- f5ffd19: Bump deps

## 0.0.67

### Patch Changes

- c8ca79b: Update Effect-TS packages to v4.0.0-beta.100

## 0.0.66

### Patch Changes

- 1386899: Update Effect-TS packages

## 0.0.65

### Patch Changes

- d9ef1bc: Update Effect-TS packages

## 0.0.64

### Patch Changes

- ae13a2b: Test changeset
