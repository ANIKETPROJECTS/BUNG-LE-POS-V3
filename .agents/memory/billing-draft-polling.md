---
name: Billing draft polling
description: Protect unsaved POS billing edits from live order refreshes.
---

Live order polling must pause or otherwise defer applying server snapshots while the cashier is editing billing fields, including discounts, tax, service charge, and manual totals. Raw text input must remain separate from the committed numeric value so a temporarily empty field is not replaced by a calculated total.

**Why:** The POS refreshes active orders in the background, and applying an older snapshot during typing can make the first digit appear stuck or make a cleared total immediately reappear.

**How to apply:** Mark billing-field changes as local edits using the same guard as cart changes, and only clear that guard after the draft has been persisted successfully or the order has been completed.