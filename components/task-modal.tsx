"use client"

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
import type { Task } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import DraggableTaskCard from "@/components/draggable-task-card"

interface TaskModalProps {
  tasks: Task[]
  userName: string
  onClose: () => void
  onTaskReorder: (userId: string, reorderedTasks: Task[]) => void
  userId: string
  canEdit: boolean
}

export default function TaskModal({ tasks, userName, onClose, onTaskReorder, userId, canEdit }: TaskModalProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id)
      const newIndex = tasks.findIndex((task) => task.id === over?.id)

      const reorderedTasks = arrayMove(tasks, oldIndex, newIndex)
      onTaskReorder(userId, reorderedTasks)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg">{userName}'s Tasks</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {tasks.map((task, index) => (
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
        </CardContent>
      </Card>
    </div>
  )
}
