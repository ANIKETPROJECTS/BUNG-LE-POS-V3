---
name: Vite runtime overlay HMR
description: Replit’s development runtime-error overlay can inject an inline Vite HMR client even when middleware HMR is disabled.
---

In Express Vite middleware mode, setting `server.hmr` to `false` and removing the standard `<script src="/@vite/client">` tag may not stop browser requests to Vite’s HMR socket. Replit’s runtime-error overlay can add a separate inline module that imports `createHotContext` from `/@vite/client` and uses the `"/__dummy__runtime-error-plugin"` marker. Remove that specific inline script after `transformIndexHtml`, along with the standard client tag, when HMR must remain disabled.

**Why:** The overlay’s inline script bypasses a filter that only removes the standard client tag and can keep probing a socket the preview cannot reach.

**How to apply:** Verify the live transformed HTML, not only `client/index.html` or the Vite `hmr` option. Confirm neither `/@vite/client` nor the runtime-error marker remains in the response.