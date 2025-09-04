export interface User {
  id: string
  name: string
  email: string
  role: "developer" | "lead"
}

export interface Task {
  id: string
  title: string
  assignedTo: string
  assignedToName: string
  status: "in-progress" | "paused"
  priority: number
  createdAt: Date
  updatedAt: Date
}

export interface TaskColumn {
  userId: string
  userName: string
  tasks: Task[]
}
