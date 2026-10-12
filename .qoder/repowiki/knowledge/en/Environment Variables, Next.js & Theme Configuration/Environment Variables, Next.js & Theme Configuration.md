---
kind: configuration_system
name: Environment Variables, Next.js & Theme Configuration
category: configuration_system
scope:
    - '**'
source_files:
    - .env.example
    - next.config.ts
    - components.json
    - src/auth.config.ts
    - src/config/theme-customizer-constants.ts
    - src/config/theme-data.ts
    - src/utils/shadcn-ui-theme-presets.ts
    - src/utils/tweakcn-theme-presets.ts
---

This repository uses a lightweight, file-based configuration approach centered on three layers:

1. Runtime secrets via Next.js environment variables — All external service credentials are declared in .env.example and consumed through NEXT_PUBLIC_* (client-side) or server-only variables. The app wires Firebase client SDK keys (NEXT_PUBLIC_FIREBASE_*), NextAuth secret (AUTH_SECRET), and Telegram bot tokens (TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID). There is no runtime config loader; values are read directly from process.env at build/start time.

2. Next.js application configuration — next.config.ts holds build-time settings: experimental package import optimization for lucide-react/@radix-ui/react-icons, Turbopack enablement, image remotePatterns for shadcn.com and Unsplash, security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy), and a /home to /dashboard redirect. No feature flags or dynamic toggles exist here.

3. Theme system as declarative data — The entire visual theme surface is configured through typed preset objects rather than a config parser:
   - src/utils/shadcn-ui-theme-presets.ts and src/utils/tweakcn-ui-theme-presets.ts export large Record<string, ThemePreset> maps of color/radius/font/shadow presets with light/dark variants.
   - src/config/theme-data.ts normalizes these into dropdown-ready ColorTheme[] arrays.
   - src/config/theme-customizer-constants.ts enumerates allowed sidebar variants, collapsible modes, side options, radius steps, and base CSS variable names that the customizer can mutate.
   - components.json drives shadcn/ui CLI behavior (style, aliases, Tailwind css path, icon library).

4. Auth configuration split — src/auth.config.ts defines NextAuth routing pages and the authorized callback policy (redirects logged-in users away from auth pages, allows landing page, requires login everywhere else); actual providers are registered in src/auth.ts.

Conventions developers should follow:
- Add new runtime secrets to .env.example and consume them via process.env.X; use NEXT_PUBLIC_ prefix only when the value must reach the browser.
- New UI themes belong in src/utils/*-theme-presets.ts as entries in the Record<string, ThemePreset> map with both light and dark style blocks; they will be auto-discovered by src/config/theme-data.ts.
- New sidebar/customizer options go in src/config/theme-customizer-constants.ts and must match the types in src/types/theme-customizer.ts.
- Keep Next.js-level redirects/headers in next.config.ts; do not bake per-environment branches there.
- Auth policy changes live in src/auth.config.ts; provider wiring stays in src/auth.ts.
