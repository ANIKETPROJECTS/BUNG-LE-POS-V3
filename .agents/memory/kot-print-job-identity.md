---
name: KOT print job identity
description: Prevent duplicate suppression and reprints when an ongoing table receives multiple KOT batches.
---

Every KOT batch for an ongoing order must have a distinct print-job identity. An invoice number identifies the customer bill and remains stable across an ongoing table session; it is not sufficient to identify each KOT. Include the order and KOT batch in deduplication, and cancel pending or leased jobs when that batch is deleted. Delete batches sequentially and update the external source before local deletion when a shared poller can observe the same order.

**Why:** Reusing the invoice number caused later KOTs to be treated as already printed, while local deletion before external sync let the poller observe a larger stale item list and resurrect items; jobs left pending could also print after removal.

**How to apply:** Any future KOT queue, retry, or delete flow must preserve the batch distinction and must not silently reuse an earlier batch's dedupe key.