---
name: POS performance
description: Keep order-list endpoints and browser print workers lightweight.
---

Do not call a full order/item scan once per order from list endpoints. Batch shared order, invoice, and item reads before resolving derived KOT data. Browser print workers should use a long backoff when QZ configuration or QZ Tray is unavailable.

**Why:** Repeated Mongo reads and aggressive QZ polling make the POS feel slow even when individual requests appear successful.

**How to apply:** Prefer batch helpers for KOT-board responses and avoid retrying unavailable local printing every few seconds across multiple open tabs.