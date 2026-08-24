---
name: POS session persistence
description: The dedicated POS workstation should retain login state across daily browser restarts.
---

The POS uses a persistent rolling session so normal daily use does not require repeated login. Logout remains the explicit way to revoke access.

**Why:** The restaurant revisits the POS daily and a lost browser-session cookie caused the shell to load without usable database data until logout and login refreshed the session.

**How to apply:** Preserve the rolling session policy when changing authentication; if stronger security is needed, add an explicit workstation lock rather than reverting to a browser-session cookie.