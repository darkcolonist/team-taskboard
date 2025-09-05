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
        ${isTopPriority 
          ? "border-accent bg-gradient-to-br from-accent/10 to-accent/5 shadow-lg ring-1 ring-accent/20 animate-pulse-glow" 
          : "border-border/50 bg-card/50 hover:bg-card/80"
        }
        ${canDrag ? "hover:shadow-lg hover:scale-[1.02]" : "hover:shadow-md"}
        transition-all duration-300 group relative overflow-hidden
      `}
      {...attributes}
    >
      {/* Subtle gradient overlay for top priority tasks */}
      {isTopPriority && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent pointer-events-none" />
      )}
      
      <CardContent className="px-2 py-0.5 relative">
        <div className="flex items-center gap-2">
          {canDrag && (
            <GripVertical 
              className="h-3 w-3 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity duration-200 cursor-move" 
              {...listeners}
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 
              className="font-semibold text-sm leading-tight text-foreground group-hover:text-accent transition-colors duration-200 truncate whitespace-nowrap overflow-hidden"
              title={task.title}
            >
              {task.title}
            </h4>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
