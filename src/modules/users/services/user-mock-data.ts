import usersData from "./data/users.json"

import type { User } from "./types/user-types"

/**
 * Mock data shaped like the joined `User` view (Auth record + profile).
 * Useful as a fallback when Firestore profiles cannot be read.
 */
export const userMockData = usersData as User[]
