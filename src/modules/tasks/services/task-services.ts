import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore"

import { auth, db } from "@/lib/firebase/client"
import { taskMockData } from "./task-mock-data"
import type { Task } from "./types/task-types"

const TASKS_COLLECTION = "tasks"

async function requireFirebaseUser() {
  await auth.authStateReady()

  if (!auth.currentUser) {
    throw new Error("Bạn cần đăng nhập để quản lý công việc.")
  }

  return auth.currentUser
}

export async function getCurrentTaskUserId(): Promise<string> {
  return (await requireFirebaseUser()).uid
}

export async function getTasks(): Promise<Task[]> {
  const user = await requireFirebaseUser()
  const snapshot = await getDocs(
    query(
      collection(db, TASKS_COLLECTION),
      where("reporter", "==", user.uid)
    )
  )

  const result = snapshot.docs.map((document) => {
    const data = document.data() as Task

    return {
      ...data,
      id: data.id ?? document.id,
    }
  })

  return JSON.parse(JSON.stringify(result))
}

export async function seedTasksWithClient(): Promise<Task[]> {
  const user = await requireFirebaseUser()
  const batch = writeBatch(db)

  taskMockData.forEach((task) => {
    batch.set(
      doc(db, TASKS_COLLECTION, task.id),
      { ...task, createdBy: user.uid, reporter: user.uid },
      { merge: true }
    )
  })

  await batch.commit()
  return getTasks()
}

export async function createTask(task: Task): Promise<Task> {
  const user = await requireFirebaseUser()
  const ownedTask = {
    ...task,
    createdBy: user.uid,
    reporter: user.uid,
  }

  await setDoc(doc(db, TASKS_COLLECTION, task.id), ownedTask)

  return ownedTask
}

export async function updateTask(task: Task): Promise<Task> {
  const user = await requireFirebaseUser()

  if (task.createdBy !== user.uid) {
    throw new Error("Bạn chỉ có thể sửa công việc do mình tạo.")
  }

  const ownedTask = { ...task, createdBy: user.uid }
  await updateDoc(doc(db, TASKS_COLLECTION, task.id), ownedTask)

  return ownedTask
}

export async function deleteTask(taskId: string): Promise<void> {
  await requireFirebaseUser()
  await deleteDoc(doc(db, TASKS_COLLECTION, taskId))
}

export function getTaskStats(tasks: Task[]) {
  const total = tasks.length

  return {
    total,
    completed: tasks.filter((task) => task.status === "completed").length,
    inProgress: tasks.filter((task) => task.status === "in progress").length,
    pending: tasks.filter((task) => task.status === "pending").length,
  }
}
