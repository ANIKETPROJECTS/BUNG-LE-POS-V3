# BUNGLE POS / Digital Menu Numbering Specification

This document defines the numbering contract that the Digital Menu must follow.
The Admin POS and Digital Menu must create orders in the same POS order
collection and use the same numbering functions. The Digital Menu must never
generate `KOT-<id>`, random numbers, or a separate `INV-####` sequence.

## 1. Number types

There are two different numbers:

### Billing/invoice number

Format:

```text
BGYYMMDD##
```

Example for 12 August 2026:

```text
BG26081201
BG26081202
```

Rules:

1. `BG` is the fixed BUNGLE prefix.
2. `YYMMDD` is the order's calendar date in the `Asia/Kolkata` timezone.
3. `##` is a two-digit daily order sequence, starting at `01`.
4. The sequence is shared by Admin POS, Digital Menu, and external orders.
5. The same order keeps the same billing number throughout its lifecycle.
6. Checkout must not generate a new number for an existing order; it must
   calculate the number belonging to that order.

### KOT chef sequence

The KOT sequence is separate from the billing number:

```text
SEQ 01
SEQ 02
SEQ 03
```

Rules:

1. The first KOT sent for the day is `SEQ 01`.
2. Every newly sent KOT gets the next sequence, including add-on KOTs.
3. An add-on KOT must contain only items added since the previous KOT.
4. The original order's billing number does not change when an add-on KOT is
   sent.
5. Checked-out orders remain part of the day's sequence. Never restart from
   the number of currently open tables.

## 2. Canonical calculation

Use the POS database as the source of truth. Do not calculate these numbers
from the Digital Menu database, browser state, table number, customer phone,
or random IDs.

```ts
function dayOf(order: Order): string {
  return new Date(order.createdAt).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}

async function getDailyBillingNumber(
  storage: IStorage,
  order: Order,
): Promise<string> {
  const sameDayOrders = (await storage.getOrders())
    .filter((candidate) => dayOf(candidate) === dayOf(order))
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    );

  const sequence = Math.max(
    1,
    sameDayOrders.findIndex((candidate) => candidate.id === order.id) + 1,
  );

  const yymmdd = dayOf(order).replace(/-/g, "").slice(2);
  return `BG${yymmdd}${String(sequence).padStart(2, "0")}`;
}

async function getDailyKotSequence(
  storage: IStorage,
  order: Order,
): Promise<number> {
  const sameDayOrders = (await storage.getOrders())
    .filter((candidate) => dayOf(candidate) === dayOf(order))
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime(),
    );

  return sameDayOrders
    .filter(
      (candidate) =>
        new Date(candidate.createdAt).getTime() <
        new Date(order.createdAt).getTime(),
    )
    .reduce((total, candidate) => total + (candidate.kotCount ?? 0), 0)
    + (order.kotCount ?? 1);
}
```

The production implementation is in:

```text
server/utils/billing-sequence.ts
```

The Digital Menu should call these shared server functions after the POS order
has been created. It should not copy a second implementation into frontend
code.

## 3. Digital Menu order lifecycle

### Create/sync the POS order

When a customer submits an order:

1. Atomically claim the Digital Menu order so polling/restarts cannot create a
   duplicate POS order.
2. Create exactly one POS `Order`.
3. Copy the Digital Menu items into POS `OrderItem` records.
4. Set every newly created item to `status: "new"`.
5. Link the selected table to the POS order and mark the table occupied.
6. Increment the POS order's `kotCount` once for the initial KOT.
7. Call `getDailyBillingNumber(storage, posOrder)`.
8. Call `getDailyKotSequence(storage, updatedOrder)`.
9. Print the KOT using:

```ts
{
  kotNumber: billingNumber,             // BGYYMMDD##
  sequence: String(kotSequence).padStart(2, "0"),
  items: allNewOrderItems,
}
```

The KOT header should display the billing number and `SEQ ##`. The POS order
ID remains the internal identifier and should not replace either printed
number.

### Add-on KOT

When more items are added to an existing order:

1. Create only the new `OrderItem` records with `status: "new"`.
2. Increment `kotCount` exactly once.
3. Calculate the same billing number from the original POS order.
4. Calculate the next daily KOT sequence.
5. Print only items whose status is `"new"`.
6. After the print job is queued, mark those items
   `"sent_to_kitchen"`.

Do not assign a new invoice/billing number to an add-on.

### Checkout

When the Digital Menu order is paid:

1. Checkout the existing POS order.
2. Free the linked table and clear `currentOrderId`.
3. Recalculate the billing number for that same POS order.
4. Create one invoice using that billing number.
5. Mark the Digital Menu order completed/paid.

```ts
const invoiceNumber = await getDailyBillingNumber(storage, checkedOutOrder);
```

Do not use the Digital Menu order ID, timestamp milliseconds, random values,
or a new counter at checkout.

## 4. Daily sequence examples

If there are no orders for the day:

| Source | POS order | Billing number | KOT |
|---|---|---|---|
| Admin | order A | `BG26081201` | `SEQ 01` |
| Digital Menu | order B | `BG26081202` | `SEQ 02` |
| Digital add-on for B | same order B | `BG26081202` | `SEQ 03` |
| Admin | order C | `BG26081203` | `SEQ 04` |

When order B is checked out, its invoice remains `BG26081202`.
Checkout does not consume another daily order number.

## 5. Required safeguards

- Use `createdAt` from the POS order, not the Digital Menu submission date.
- Always use `Asia/Kolkata` when determining the business day.
- Include open and checked-out orders when calculating sequences.
- Keep `kotCount` on the POS order and increment it atomically.
- Claim Digital Menu orders before creating POS records.
- Treat a claimed order without `posOrderId` as retryable only after the
  configured stale-claim timeout.
- Never expose `SESSION_SECRET` or any server secret to the Digital Menu
  browser.
- Number generation and invoice creation must happen server-side.
- If concurrent order creation is expected, protect number allocation with a
  MongoDB transaction/atomic daily counter or a unique index/retry strategy.
  A read-sort-write calculation alone can collide under simultaneous requests.

## 6. Acceptance tests

After clearing test data, run these tests on the same day:

1. Create one Admin order: expect billing `...01`, KOT `SEQ 01`.
2. Create one Digital Menu order: expect billing `...02`, KOT `SEQ 02`.
3. Add an item to the Digital order: expect the same billing `...02`,
   KOT `SEQ 03`, and only the added item.
4. Check out the Digital order: expect invoice `...02`.
5. Create another Admin order: expect billing `...03`.
6. Check out an order, then create another Digital order: expect the next
   number, not `01`.
7. Restart the server during sync and verify one Digital Menu order creates
   only one POS order and one initial KOT.
