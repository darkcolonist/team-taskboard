"use client"

import type { Task } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Pause } from "lucide-react"

interface TaskCardProps {
  task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <Card className="cursor-move hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm leading-tight mb-2 text-balance">{task.title}</h4>
            <div className="flex items-center gap-2">
              <Badge variant={task.status === "in-progress" ? "default" : "secondary"} className="text-xs">
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
