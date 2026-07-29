# Printing Setup Guide — KP307 + QZ Tray + Cloud POS

## Printer: Shreyans KP307

- 80mm thermal receipt printer (Indian brand)
- Connectivity: WiFi, Ethernet, USB, Bluetooth
- Protocol: **ESC/POS** (same standard as Epson, Star, etc.)
- Port: **9100** (TCP)

---

## Why You Can't Print Directly from the Browser

Your KP307 connects to WiFi and gets a local IP like `192.168.1.50`. It listens for print commands on TCP port 9100.

**The problem:** Browsers cannot make raw TCP connections for security reasons. So even though the browser and printer are on the same WiFi, the browser can't directly talk to port 9100. It's a browser security wall, not a network problem.

---

## The Solution: QZ Tray

This is exactly how **Petpooja, POSist, Lightspeed** and most Indian cloud POS systems solve printing.

```
[Cloud POS in browser]
        ↓  WebSocket (localhost:8181)
   [QZ Tray — runs silently in system tray]
        ↓  Raw ESC/POS over TCP port 9100
   [KP307 WiFi Printer at 192.168.1.50]
```

**What QZ Tray is:**
- Free, open-source small app (~15MB)
- Installs once on the billing counter PC
- Sits silently in the Windows system tray
- Acts as a bridge between the browser and any local printer
- Download from: [qz.io](https://qz.io)

### Why QZ Tray vs Other Options

| Approach | Install anything? | Auto-print (no dialog)? | Works with KP307 WiFi? |
|----------|------------------|------------------------|------------------------|
| `window.print()` (browser) | Nothing | ❌ Shows dialog every time | ✅ But ugly HTML output |
| **QZ Tray** | One small app | ✅ Yes, fully silent | ✅ Perfect |
| Custom print agent (build yourself) | Your own app | ✅ Yes | ✅ Yes — but months of work |

---

## Part 1 — What Gets Built in the POS (One Time, By You)

### Step 1 — Printer Settings Page
Add a "Printer Setup" screen in the Settings section where the restaurant enters:
- **Printer IP address** (e.g. `192.168.1.50`) — found by pressing test button on KP307
- **Printer port** — always `9100`, pre-filled
- **Paper width** — `80mm`, pre-filled for KP307

Saved in MongoDB against that restaurant's account.

### Step 2 — QZ Tray Connection Service (Frontend)
A small JavaScript module in the React app that:
- On page load, connects to QZ Tray on `localhost:8181` via WebSocket
- Checks if QZ Tray is running — shows "Printer not connected" warning if not
- Exposes a `printBill(orderData)` function the rest of the app calls

### Step 3 — ESC/POS Bill Formatter
Converts an order into raw ESC/POS commands:
- Restaurant name (centered, bold)
- Order items and quantities
- Totals, taxes, discounts
- Divider lines
- Auto paper cut at the end

### Step 4 — Connect Print Buttons
Wherever "Print Bill" or "Print KOT" buttons exist in the app, they call `printBill(orderData)`.  
Flow: Print button → Print Service → QZ Tray → KP307 → paper out. No dialog, fully automatic.

---

## Part 2 — Restaurant Setup (One Time Per Restaurant)

### Step 1 — Connect KP307 to WiFi
Done once using the Shreyans WiFi setup tool (included with the printer).

### Step 2 — Find the Printer's IP
Press the feed button on the KP307 → it prints a slip showing its IP address (e.g. `192.168.1.50`).

### Step 3 — Install QZ Tray
1. Go to [qz.io](https://qz.io)
2. Download the free Windows installer (~15MB)
3. Run it — QZ Tray installs and starts automatically
4. It appears as a small icon in the system tray, starts with Windows automatically

### Step 4 — Enter Printer IP in POS Settings
Log into the POS → Settings → Printer Setup → type `192.168.1.50` → Save. Done.

---

## Part 3 — Every Day After That

1. PC turns on → QZ Tray starts automatically in background
2. Cashier opens the POS in Chrome/Edge
3. POS connects to QZ Tray silently (user sees nothing)
4. Cashier takes order, clicks Print → bill comes out of KP307 instantly

**Zero extra steps daily. Fully automatic.**

---

## Multiple Printers (Billing + Kitchen)

Many restaurants have 2 printers:
- **Billing printer** (at counter) → bills go here
- **Kitchen printer** (KOT printer) → kitchen order tickets go here

Same setup — two IP addresses configured in POS settings. QZ Tray handles both from the same PC.

---

## Development Effort Estimate

| What | Time Estimate |
|------|--------------|
| Printer settings page in POS | Half a day |
| QZ Tray connection service | Half a day |
| ESC/POS bill formatter | 1 day |
| KOT formatter (kitchen slip) | Half a day |
| Testing end-to-end | Half a day |
| **Total** | **~3 days** |

Works for every restaurant you onboard — they just install QZ Tray and enter their printer IP.

---

## Scale: Do You Build This Per Restaurant?

**No. Build once, deploy everywhere.**

- Same QZ Tray download for every restaurant (free, from qz.io — you don't host it)
- Same POS code for every restaurant
- Each restaurant just enters their own printer IP in settings
- You issue them a login — printing works out of the box
