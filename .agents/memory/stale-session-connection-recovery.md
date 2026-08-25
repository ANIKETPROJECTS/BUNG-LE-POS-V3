---
name: Stale session connection recovery
description: Cached authenticated storage must detect when its underlying idle Mongo connection was removed.
---

Authenticated storage objects can outlive their database connection because idle connections are cleaned up independently. Every request path must verify the connection manager still has the connection and transparently reconnect when it has been removed.

**Why:** A cached session storage object previously kept a true connected flag after idle cleanup, causing every page query to wait or fail until logout and login created a new object.

**How to apply:** Treat the connection manager as the source of truth; never rely only on a storage instance’s local connected boolean.