import "server-only"

import { cert, getApps, initializeApp } from "firebase-admin/app"
import { type Firestore, getFirestore } from "firebase-admin/firestore"

type FirebaseServiceAccount = {
  project_id: string
  client_email: string
  private_key: string
}

let cachedFirestore: Firestore | null | undefined

function parseServiceAccount(): FirebaseServiceAccount | null {
  const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim()
  if (!rawKey) return null

  const json = rawKey.startsWith("{")
    ? rawKey
    : Buffer.from(rawKey, "base64").toString("utf8")
  const serviceAccount = JSON.parse(json) as FirebaseServiceAccount

  if (
    !serviceAccount.project_id ||
    !serviceAccount.client_email ||
    !serviceAccount.private_key
  ) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY không đầy đủ thông tin")
  }

  return {
    ...serviceAccount,
    private_key: serviceAccount.private_key.replace(/\\n/g, "\n"),
  }
}

export function getAdminFirestore(): Firestore | null {
  if (cachedFirestore !== undefined) return cachedFirestore

  try {
    const serviceAccount = parseServiceAccount()
    if (!serviceAccount) {
      cachedFirestore = null
      return cachedFirestore
    }

    const appName = "dashboard-admin"
    const existingApp = getApps().find((app) => app.name === appName)
    const app =
      existingApp ??
      initializeApp(
        {
          credential: cert({
            projectId: serviceAccount.project_id,
            clientEmail: serviceAccount.client_email,
            privateKey: serviceAccount.private_key,
          }),
        },
        appName
      )

    cachedFirestore = getFirestore(app)
    return cachedFirestore
  } catch (error) {
    console.error("Không thể khởi tạo Firebase Admin SDK:", error)
    cachedFirestore = null
    return cachedFirestore
  }
}
