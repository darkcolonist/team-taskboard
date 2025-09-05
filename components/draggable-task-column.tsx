"use client"

import { useState } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, User } from "lucide-react"
import type { TaskColumn, Task, User as UserType } from "@/types"
import DraggableTaskCard from "@/components/draggable-task-card"
import TaskModal from "@/components/task-modal"

interface DraggableTaskColumnProps {
  column: TaskColumn
  onTaskReorder: (userId: string, reorderedTasks: Task[]) => void
  currentUser: UserType | null
}

export default function DraggableTaskColumn({ column, onTaskReorder, currentUser }: DraggableTaskColumnProps) {
  const [showAllTasks, setShowAllTasks] = useState(false)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = column.tasks.findIndex((task) => task.id === active.id)
      const newIndex = column.tasks.findIndex((task) => task.id === over?.id)

      const reorderedTasks = arrayMove(column.tasks, oldIndex, newIndex)
      onTaskReorder(column.userId, reorderedTasks)
    }
  }

  const visibleTasks = showAllTasks ? column.tasks : column.tasks.slice(0, 3)
  const canEdit = currentUser?.id === column.userId || currentUser?.role === "lead"
  const activeTasks = column.tasks.filter((task) => task.status === "in-progress").length

  return (
    <Card className="h-fit shadow-sm hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 hover:bg-card/80 group">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-accent/20 to-accent/10 rounded-xl flex-shrink-0 ring-1 ring-accent/20 group-hover:ring-accent/30 transition-all duration-200">
              <User className="h-5 w-5 text-accent" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg font-bold text-foreground truncate group-hover:text-accent transition-colors duration-200">
                {column.userName}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs font-medium px-2 py-1 bg-muted/80 hover:bg-muted transition-colors duration-200">
                  {column.tasks.length} tasks
                </Badge>
                {activeTasks > 0 && (
                  <Badge variant="default" className="text-xs font-medium px-2 py-1 bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm">
                    {activeTasks} active
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {canEdit && (
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-accent/10 hover:text-accent transition-all duration-200">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {column.tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-muted/50 to-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4 ring-1 ring-muted/30">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">No tasks assigned</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Tasks will appear here when assigned</p>
          </div>
        ) : (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={visibleTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {visibleTasks.map((task, index) => (
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      index={index}
                      isTopPriority={index === 0}
                      canDrag={canEdit}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {column.tasks.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-4 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 font-medium"
                onClick={() => setShowAllTasks(!showAllTasks)}
              >
                {showAllTasks ? "Show less..." : `Show ${column.tasks.length - 3} more...`}
              </Button>
            )}
          </>
        )}
      </CardContent>

      {/* Task Modal for expanded view */}
      {showAllTasks && (
        <TaskModal
          tasks={column.tasks}
          userName={column.userName}
          onClose={() => setShowAllTasks(false)}
          onTaskReorder={onTaskReorder}
          userId={column.userId}
          canEdit={canEdit}
        />
      )}
    </Card>
  )
}
