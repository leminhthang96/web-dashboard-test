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
import { isAdminIdentifier } from "@/lib/auth/permissions"

import { normalizeCustomerDocument } from "./customer-normalizers"
import {
  customerFormSchema,
  customerSchema,
  type Customer,
  type CustomerFormData,
} from "./types/customer-types"

const CUSTOMERS_COLLECTION = "customers"

async function requireFirebaseUser() {
  await auth.authStateReady()

  if (!auth.currentUser) {
    throw new Error("Bạn cần đăng nhập để quản lý khách hàng.")
  }

  return auth.currentUser
}

async function canReadAllCustomers(): Promise<boolean> {
  const user = await requireFirebaseUser()
  const token = await user.getIdTokenResult()
  const roles = token.claims.roles

  return (
    isAdminIdentifier(user.email) ||
    token.claims.admin === true ||
    (Array.isArray(roles) &&
      (roles.includes("admin") || roles.includes("role-admin")))
  )
}

export async function getCustomers(): Promise<Customer[]> {
  const user = await requireFirebaseUser()
  const customersRef = collection(db, CUSTOMERS_COLLECTION)
  const customersQuery = (await canReadAllCustomers())
    ? customersRef
    : query(customersRef, where("userId", "==", user.uid))
  const snapshot = await getDocs(customersQuery)

  return customerSchema.array().parse(
    snapshot.docs.map((customerDoc) =>
      normalizeCustomerDocument(
        customerDoc.id,
        customerDoc.data() as Record<string, unknown>
      )
    )
  )
}

export async function createCustomer(
  formData: CustomerFormData
): Promise<Customer> {
  const user = await requireFirebaseUser()
  const payload = customerFormSchema.parse(formData)
  const customerRef = doc(collection(db, CUSTOMERS_COLLECTION))
  const now = new Date().toISOString()
  const customer = customerSchema.parse({
    ...payload,
    id: customerRef.id,
    userId: user.uid,
    createdAt: now,
    updatedAt: now,
  })

  await setDoc(customerRef, customer)
  return customer
}

export async function updateCustomer(customer: Customer): Promise<Customer> {
  const user = await requireFirebaseUser()
  const hasGlobalAccess = await canReadAllCustomers()
  const payload = customerFormSchema.parse(customer)
  const updatedCustomer = customerSchema.parse({
    ...customer,
    ...payload,
    userId: customer.userId || (hasGlobalAccess ? "" : user.uid),
    updatedAt: new Date().toISOString(),
  })

  await setDoc(
    doc(db, CUSTOMERS_COLLECTION, customer.id),
    updatedCustomer,
    { merge: true }
  )

  return updatedCustomer
}

export async function deleteCustomer(customerId: string): Promise<void> {
  await requireFirebaseUser()
  await deleteDoc(doc(db, CUSTOMERS_COLLECTION, customerId))
}
