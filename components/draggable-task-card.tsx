"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import type { Task } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Pause, GripVertical, Star } from "lucide-react"

interface DraggableTaskCardProps {
  task: Task
  index: number
  isTopPriority: boolean
  canDrag: boolean
}

export default function DraggableTaskCard({ task, index, isTopPriority, canDrag }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled: !canDrag,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`
        ${isDragging ? "opacity-50 rotate-2 scale-105" : ""}
        ${isTopPriority ? "ring-2 ring-accent shadow-md bg-accent/5" : ""}
        ${canDrag ? "cursor-move hover:shadow-md" : ""}
        transition-all duration-200 group
      `}
      {...attributes}
      {...listeners}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {canDrag && (
            <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-medium text-sm leading-tight text-balance text-foreground">{task.title}</h4>
              {isTopPriority && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="h-3 w-3 text-accent fill-accent" />
                  <Badge variant="default" className="text-xs bg-accent hover:bg-accent">
                    Priority #1
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Badge
                variant={task.status === "in-progress" ? "default" : "secondary"}
                className={`text-xs ${task.status === "in-progress" ? "bg-accent hover:bg-accent" : ""}`}
              >
                {task.status === "in-progress" ? (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    In Progress
                  </>
                ) : (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Paused
                  </>
                )}
              </Badge>
              {index > 0 && <span className="text-xs text-muted-foreground">#{index + 1}</span>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
