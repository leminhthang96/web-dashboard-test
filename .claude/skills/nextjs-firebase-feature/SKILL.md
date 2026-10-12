---
name: nextjs-firebase-feature
description: Build or update a Next.js App Router dashboard feature backed by the Firebase client SDK and Firestore Security Rules.
---

# Next.js Firebase Feature

Use this guide when adding or changing a Firestore-backed dashboard module.

## Project pattern

- Put routes under `src/app/(private)/<feature>/page.tsx`.
- Put feature code under `src/modules/<feature>/`.
- Use `@/lib/firebase/client` for Auth, Firestore, and Storage.
- Do not use server actions.
- Do not auto-seed when a page loads.
- Use zod schemas for stored and form data.
- Use TanStack Table for data tables and shadcn/ui for controls.
- Keep UI labels, validation, and error messages in Vietnamese.

## Security boundary

All Firestore access is performed by the signed-in Firebase client and must be
allowed by `firestore.rules`.

- Never embed a service-account key in source code or a public environment
  variable.
- Do not weaken Firestore Rules to make a feature appear to work.
- Client code cannot securely list, create, disable, or delete other Firebase
  Authentication accounts.
- Client code cannot bypass ownership filters. If a document must be visible to
  a user, model that access explicitly in its fields and Security Rules.
- Public lead capture may create only the narrow document shape permitted by
  `firestore.rules`.

## Module shape

```text
src/app/(private)/<feature>/page.tsx
src/modules/<feature>/
  services/
    types/<feature>-types.ts
    <feature>-mock-data.ts
    <feature>-services.ts
  components/
    data-table.tsx
    columns.tsx
    data-table-toolbar.tsx
    data-table-pagination.tsx
    data-table-view-options.tsx
    data-table-row-actions.tsx
    add-<feature>-modal.tsx
```

## Firestore service

Use modular imports from `firebase/firestore`. Reads and writes must wait for
Firebase Auth restoration when the collection is user-scoped.

```ts
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore"

import { auth, db } from "@/lib/firebase/client"

async function requireUser() {
  await auth.authStateReady()
  if (!auth.currentUser) throw new Error("Bạn cần đăng nhập để tiếp tục.")
  return auth.currentUser
}

export async function getItems() {
  const user = await requireUser()
  const snapshot = await getDocs(
    query(collection(db, "items"), where("userId", "==", user.uid))
  )

  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
}
```

Rules:

- Persist data before updating local UI state.
- Keep `userId` stable during updates.
- Use `{ merge: true }` for partial profile updates.
- Normalize Firestore Timestamp values before zod parsing.
- Surface read/write errors; do not silently return an empty array.
- Do not use `onSnapshot` unless realtime behavior is explicitly requested.

## UI conventions

- Keep toolbar search and filters on one row where space permits.
- Sorting headers use the three-state cycle: ascending, descending, cleared.
- Create and edit use Dialog; destructive delete uses Alert Dialog.
- Merge conditional Tailwind classes with `cn()`.
- Add `"use client"` only to interactive components.

## Verification

Run both commands after implementation:

```bash
npx tsc --noEmit
npm run build
```

There is no configured unit-test framework.
