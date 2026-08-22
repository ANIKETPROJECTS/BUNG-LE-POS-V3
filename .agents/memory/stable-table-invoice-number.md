---
name: Stable table invoice numbers
description: Invoice numbering must remain anchored to an ongoing order or active table group.
---

The invoice number for an ongoing table order is stable across every KOT, Save, Bill, and Checkout action. Resolve an existing invoice linked to the order or an active sibling order on the same table before generating a daily sequence number.

**Why:** Recalculating from the daily order sequence can select another table's invoice, especially during combined checkout when orders are marked completed before the number is resolved.

**How to apply:** Capture the stable number before changing order statuses, and reuse the same lookup for KOT and billing flows.