---
name: POS performance
description: Keep order-list endpoints and browser print workers lightweight.
---

Do not call a full order/item scan once per order from list endpoints. Batch shared order, invoice, and item reads before resolving derived KOT data. When sending a billing cart to KOT, persist its new line items as one batch rather than one request per item. Browser print workers should use a long backoff when QZ configuration or QZ Tray is unavailable, and reconnect cleanup must use a timestamp boundary so fresh burst jobs survive recovery.

**Why:** Repeated Mongo reads, serial item requests, and aggressive QZ polling make the POS feel slow even when individual requests appear successful.

**How to apply:** Prefer batch helpers for KOT-board responses and cart item writes; calculate the order total once after the batch. Avoid retrying unavailable local printing every few seconds across multiple open tabs. Serialize QZ access locally when multiple tabs share a printer.