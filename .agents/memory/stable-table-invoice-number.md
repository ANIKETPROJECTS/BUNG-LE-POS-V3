---
name: Stable table invoice numbers
description: Invoice numbering must remain anchored to an ongoing order or active table group.
---

The invoice number for an ongoing table order is stable across every KOT, Save, Bill, and Checkout action. Resolve an existing invoice linked to the order or an active sibling order on the same table before generating a daily sequence number.

Do not cache invoice existence or daily sequence allocation across requests. Read current persisted order/invoice state when resolving a number; optimize by batching related reads, not by reusing a stale allocation.

**Why:** Recalculating from the daily order sequence can select another table's invoice, especially during combined checkout when orders are marked completed before the number is resolved. A stale cached sequence can also collide with a number allocated by a concurrent KOT or checkout.

**How to apply:** Capture the stable number before changing order statuses, and reuse the same lookup for KOT and billing flows. Cache read-only UI data separately; keep number resolution fresh and use batched/request-scoped reads for performance.