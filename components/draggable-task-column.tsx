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
    <Card className="h-fit shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-8 h-8 bg-accent/10 rounded-full flex-shrink-0">
              <User className="h-4 w-4 text-accent" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-base font-semibold text-foreground truncate">{column.userName}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {column.tasks.length} tasks
                </Badge>
                {activeTasks > 0 && (
                  <Badge variant="default" className="text-xs bg-accent">
                    {activeTasks} active
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {canEdit && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {column.tasks.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No tasks assigned</p>
          </div>
        ) : (
          <>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={visibleTasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
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
                className="w-full mt-3 text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
