import { z } from "zod"

export const taskInputSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  category: z.string(),
  priority: z.string(),
})

export const taskSchema = taskInputSchema.extend({
  createdBy: z.string().min(1),
  reporter: z.string().optional(),
})

export type TaskInput = z.infer<typeof taskInputSchema>
export type Task = z.infer<typeof taskSchema>
