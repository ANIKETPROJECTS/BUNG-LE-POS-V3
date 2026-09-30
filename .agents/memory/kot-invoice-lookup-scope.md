---
name: KOT invoice lookup scope
description: Preserve invoice-number behavior while avoiding full-history reads for KOT numbering.
---

When allocating a KOT invoice number, read orders from the order's Asia/Kolkata calendar day and invoices created that day, plus all invoices linked to those day's orders regardless of invoice date.

**Why:** Number allocation depends on day-local order grouping and existing invoice assignments. Filtering only invoices by creation date can miss an invoice attached to an older active order and change a stable number.

**How to apply:** Any targeted KOT sequence lookup must preserve the whole-collection calculation's day grouping and invoice-by-order lookup. Do not replace it with a cached counter or an invoice-date-only filter.