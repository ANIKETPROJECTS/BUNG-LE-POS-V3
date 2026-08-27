---
name: Discount validation rule
description: POS discounts support percentage and fixed-rupee modes with a hard bill-total ceiling.
---

Discounts are applied after tax and service charge to the calculated bill total. Percentage discounts are limited to 100%, fixed discounts are limited to the bill total, and the server must enforce the same limits as the cart UI.

**Why:** Cashiers need both discount formats, but an oversized discount must never create a negative or inconsistent invoice total.

**How to apply:** Keep the shared calculation authoritative for cart, checkout, split payments, invoices, PDFs, and thermal receipts; reject invalid requests server-side.