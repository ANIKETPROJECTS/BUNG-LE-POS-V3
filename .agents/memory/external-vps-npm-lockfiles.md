---
name: External VPS npm installs
description: Make npm lockfiles portable when deploying this project outside Replit.
---

When deploying this project to an external VPS, confirm all `resolved` package tarball URLs in `package-lock.json` use a public registry. Lockfiles generated in Replit can contain `package-firewall.replit.local` or `.internal` URLs, which the VPS cannot resolve.

**Why:** A clean VPS install then fails to fetch packages, causing runtime dependencies such as Express middleware and Mongo session storage to be missing.

**How to apply:** Before a VPS install, inspect lockfile hosts. Normalize internal Replit tarball URLs to the matching `https://registry.npmjs.org/` paths, then use `npm ci` after removing any corrupted `node_modules` directory.