---
title: WireguardErrors.ts
nav_order: 5
parent: Modules
---

## WireguardErrors.ts overview

Wireguard errors

Since v1.0.0

---

## Exports Grouped by Category

- [Errors](#errors)
  - [SuccessErrno](#successerrno)
  - [SuccessErrno (type alias)](#successerrno-type-alias)
  - [WireguardError (class)](#wireguarderror-class)

---

# Errors

## SuccessErrno

A wireguard userspace api Errno return message.

**Signature**

```ts
declare const SuccessErrno: Schema.brand<Schema.SchemaClass<"errno=0", "errno=0", never>, "SuccessErrno">
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardErrors.ts#L17)

Since v1.0.0

## SuccessErrno (type alias)

**Signature**

```ts
type SuccessErrno = Schema.Schema.Type<typeof SuccessErrno>
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardErrors.ts#L27)

Since v1.0.0

## WireguardError (class)

**Signature**

```ts
declare class WireguardError
```

[Source](https://github.com/leonitousconforti/the-wireguard-effect/tree/main/src/WireguardErrors.ts#L33)

Since v1.0.0
