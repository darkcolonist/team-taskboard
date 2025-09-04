"use client"

import type { Task } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Clock, Pause, Hash } from "lucide-react"
import { formatTimeAgo, formatFullDate } from "@/lib/time-utils"

interface TaskCardProps {
  task: Task
}

export default function TaskCard({ task }: TaskCardProps) {
  const shortId = task.id.slice(-4)

  return (
    <TooltipProvider>
      <Card className="cursor-move hover:shadow-md transition-shadow">
        <CardContent className="p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  <span className="font-mono">{shortId}</span>
                </div>
                <Badge variant="outline" className="text-xs px-1 py-0">
                  P{task.priority}
                </Badge>
              </div>
              <h4 className="font-medium text-sm leading-tight mb-2 text-balance truncate" title={task.title}>
                {task.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
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

            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-xs text-muted-foreground cursor-help">{formatTimeAgo(task.createdAt)}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Started: {formatFullDate(task.createdAt)}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
