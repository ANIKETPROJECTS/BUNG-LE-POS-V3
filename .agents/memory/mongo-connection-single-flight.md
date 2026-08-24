---
name: Mongo connection single-flight
description: Concurrent first requests must share one MongoDB connection attempt.
---

MongoDB connection initialization must be single-flight: while a connection is being established, all requests for that database await the same promise instead of opening parallel clients.

**Why:** The first authenticated render makes several API requests at once; parallel connection attempts multiply MongoDB server-selection latency and can make a device appear to hang.

**How to apply:** Keep an in-flight promise beside each cached client, clear it after success or failure, and retain the connected client for subsequent requests.