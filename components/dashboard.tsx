"use client"

import { useState, useEffect } from "react"
import { collection, query, onSnapshot, orderBy, doc, writeBatch } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import type { Task, TaskColumn, User } from "@/types"
import { Button } from "@/components/ui/button"
import { LogOut, Plus, Users, Clock } from "lucide-react"
import AddTaskForm from "@/components/add-task-form"
import DraggableTaskColumn from "@/components/draggable-task-column"
import { Badge } from "@/components/ui/badge"

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [taskColumns, setTaskColumns] = useState<TaskColumn[]>([])
  const [showAddTask, setShowAddTask] = useState(false)

  // Listen to tasks in real-time
  useEffect(() => {
    const tasksQuery = query(collection(db, "tasks"), orderBy("priority", "asc"))

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Task[]

      setTasks(tasksData)
    })

    return () => unsubscribe()
  }, [])

  // Listen to users in real-time
  useEffect(() => {
    const usersQuery = query(collection(db, "users"))

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[]

      setUsers(usersData)
    })

    return () => unsubscribe()
  }, [])

  // Organize tasks by user
  useEffect(() => {
    const columns: TaskColumn[] = users.map((u) => ({
      userId: u.id,
      userName: u.name,
      tasks: tasks.filter((task) => task.assignedTo === u.id),
    }))

    setTaskColumns(columns)
  }, [tasks, users])

  const handleTaskPriorityChange = async (userId: string, reorderedTasks: Task[]) => {
    try {
      const batch = writeBatch(db)

      // Update priority and status for each task
      reorderedTasks.forEach((task, index) => {
        const taskRef = doc(db, "tasks", task.id)
        const isTopPriority = index === 0

        batch.update(taskRef, {
          priority: index,
          status: isTopPriority ? "in-progress" : "paused",
          updatedAt: new Date(),
        })
      })

      await batch.commit()
    } catch (error) {
      console.error("Error updating task priorities:", error)
    }
  }

  const totalTasks = tasks.length
  const activeTasks = tasks.filter((task) => task.status === "in-progress").length
  const activeUsers = users.filter((user) => tasks.some((task) => task.assignedTo === user.id)).length

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-background border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground text-balance">Team Task Dashboard</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <p className="text-muted-foreground">
                  Welcome back, <span className="font-medium text-foreground">{user?.name}</span>
                </p>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {activeTasks} active
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Users className="h-3 w-3" />
                    {activeUsers} working
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowAddTask(true)}
                size="sm"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {taskColumns.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No team members yet</h3>
            <p className="text-muted-foreground">Team members will appear here once they sign in and create tasks.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
            {taskColumns.map((column) => (
              <DraggableTaskColumn
                key={column.userId}
                column={column}
                onTaskReorder={handleTaskPriorityChange}
                currentUser={user}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add Task Modal */}
      {showAddTask && <AddTaskForm onClose={() => setShowAddTask(false)} currentUser={user!} />}
    </div>
  )
}
