---
kind: external_dependency
name: Firebase (Auth + Firestore)
slug: firebase
category: external_dependency
category_hints:
    - vendor_identity
    - auth_protocol
scope:
    - '**'
source_files:
    - src/lib/firebase/client.ts
    - src/auth.ts
    - firestore.rules
---

### Identity & Data Platform
- **Client SDK** (`@/lib/firebase/client.ts`): initializes `firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/storage` from `NEXT_PUBLIC_FIREBASE_*` env vars; used by all client-side services (e.g. `src/modules/customers/services/customer-services.ts`).
- **NextAuth integration** (`src/auth.ts`): custom CredentialsProvider that calls the Firebase Identity Toolkit endpoint (`identitytoolkit.googleapis.com/v1/accounts:lookup`) to validate a client ID token and build a NextAuth session carrying `uid`, `roles`, `isAdmin`.
- **Public lead-capture API** (`src/app/api/customers/route.ts`): unauthenticated POST that inserts into `customers` with empty `userId` (allowed by rules) and posts a Markdown notification via Telegram.

Durable usage model:
