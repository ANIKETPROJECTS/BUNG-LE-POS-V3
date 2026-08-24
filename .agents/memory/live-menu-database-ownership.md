---
name: Live menu database ownership
description: The POS menu is owned by the digital menu MongoDB source rather than a copied POS collection.
---

The live menu source is the `bungle` database, where menu items are stored in category-named collections. POS menu reads and writes must use those collections directly; do not reintroduce a copied `POS.menuItems` synchronization layer.

**Why:** The POS copy became stale and diverged from the digital menu, so changes made in the live menu were not reliably reflected in ordering.

**How to apply:** Preserve the POS-facing MenuItem shape through an adapter, but keep the live document ID, category collection, availability, price, image, and description connected to the digital-menu source.