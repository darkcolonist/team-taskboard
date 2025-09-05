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
import { ThemeToggle } from "@/components/theme-toggle"

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

      // Update priority for each task without changing status
      reorderedTasks.forEach((task, index) => {
        const taskRef = doc(db, "tasks", task.id)

        batch.update(taskRef, {
          priority: index,
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
    <div className="min-h-screen bg-gradient-to-br from-muted/20 via-background to-muted/10">
      <header className="bg-background/80 backdrop-blur-sm border-b border-border/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground text-balance bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  Team Task Dashboard
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mt-2 sm:mt-3">
                  <p className="text-muted-foreground text-base sm:text-lg">
                    Welcome back, <span className="font-semibold text-foreground">{user?.name}</span>
                  </p>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Badge variant="secondary" className="gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium bg-accent/10 hover:bg-accent/20 text-accent border-accent/20">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                      {activeTasks} active
                    </Badge>
                    <Badge variant="outline" className="gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium border-border/50 hover:bg-muted/50">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                      {activeUsers} working
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <Button
                  onClick={() => setShowAddTask(true)}
                  size="sm"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-200 font-medium text-xs sm:text-sm"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Add Task</span>
                  <span className="sm:hidden">Add</span>
                </Button>
                <Button onClick={logout} variant="outline" size="sm" className="hover:bg-muted/50 transition-all duration-200 text-xs sm:text-sm">
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Sign Out</span>
                  <span className="sm:hidden">Out</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {taskColumns.length === 0 ? (
          <div className="text-center py-16 sm:py-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-muted/50 to-muted/30 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 ring-1 ring-muted/30">
              <Users className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3">No team members yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed text-sm sm:text-base px-4">
              Team members will appear here once they sign in and create tasks. 
              Invite your team to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            {taskColumns.map((column, index) => (
              <div 
                key={column.userId}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <DraggableTaskColumn
                  column={column}
                  onTaskReorder={handleTaskPriorityChange}
                  currentUser={user}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Task Modal */}
      {showAddTask && <AddTaskForm onClose={() => setShowAddTask(false)} currentUser={user!} />}
    </div>
  )
}
