---
name: POS and digital-menu order ownership
description: How shared Orders database documents avoid circular POS/digital-menu synchronization.
---

POS-created orders may be mirrored into the shared `Orders.orders` collection so the digital menu can display ongoing table orders.

**Why:** the digital menu needs shared visibility, but an unmarked mirror would be imported back into POS and create duplicate orders.

**How to apply:** mark POS mirrors with a POS ownership marker and completed POS-sync fields; preserve documents that originated in the digital menu rather than rewriting their ownership.