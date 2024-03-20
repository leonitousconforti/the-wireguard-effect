---
title: WireguardErrors.ts
nav_order: 4
parent: Modules
---

## WireguardErrors overview

Added in v1.0.0

---

<h2 class="text-delta">Table of contents</h2>

- [Errors](#errors)
  - [SuccessErrno](#successerrno)
  - [WireguardError (class)](#wireguarderror-class)
- [utils](#utils)
  - [SuccessErrno (type alias)](#successerrno-type-alias)

---

# Errors

## SuccessErrno

A wireguard userspace api Errno return message.

**Signature**

```ts
export declare const SuccessErrno: Schema.brand<Schema.Schema<"errno=0", "errno=0", never>, "SuccessErrno">
```

Added in v1.0.0

## WireguardError (class)

**Signature**

```ts
export declare class WireguardError
```

Added in v1.0.0

# utils

## SuccessErrno (type alias)

**Signature**

```ts
export type SuccessErrno = Schema.Schema.Type<typeof SuccessErrno>
```

Added in v1.0.0