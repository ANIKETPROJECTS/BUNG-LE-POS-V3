---
name: Vite dev preview cache and HMR
description: Replit’s development preview can retain injected HMR clients and stale optimized dependency bundles.
---

In Express Vite middleware mode, setting `server.hmr` to `false` and removing the standard `<script src="/@vite/client">` tag may not stop browser requests to Vite’s HMR socket. Replit’s runtime-error overlay can add a separate inline module that imports `createHotContext` from `/@vite/client` and uses the `"/__dummy__runtime-error-plugin"` marker. Remove that specific inline script after `transformIndexHtml`, along with the standard client tag, when HMR must remain disabled.

**Why:** The overlay’s inline script bypasses a filter that only removes the standard client tag and can keep probing a socket the preview cannot reach.

**How to apply:** Verify the live transformed HTML, not only `client/index.html` or the Vite `hmr` option. Confirm neither `/@vite/client` nor the runtime-error marker remains in the response.

Vite optimized dependencies may be cached by browsers under an immutable `?v=<browserHash>` URL. If the on-disk optimizer cache is regenerated with the same hash but different chunk names, a browser can keep an old entry bundle that imports chunk files no longer present. `optimizeDeps.force` alone may not change that browser hash. Deliberately change the optimize-deps config hash (for example, add an explicit include for the affected dependency) and send `Cache-Control: no-store` for dev modules and generated HTML. Put dev headers on the actual middleware-mode server options when they replace the config's `server` object.

**Why:** Clearing the server cache did not invalidate the browser-held optimized module URL; its missing chunk imports prevented React from starting and left a white preview.

**How to apply:** After a cache fix, verify the optimizer browser hash changed, every chunk referenced by the optimized bundle exists, dev responses are not cached, and a fresh preview has no failed resource logs. Keep HMR disabled if the preview cannot support its socket.