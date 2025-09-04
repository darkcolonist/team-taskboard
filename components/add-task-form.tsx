"use client"

import type React from "react"

import { useState } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus } from "lucide-react"

interface AddTaskFormProps {
  onClose: () => void
  currentUser: User
}

export default function AddTaskForm({ onClose, currentUser }: AddTaskFormProps) {
  const [title, setTitle] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await addDoc(collection(db, "tasks"), {
        title: title.trim(),
        assignedTo: currentUser.id,
        assignedToName: currentUser.name,
        status: "in-progress",
        priority: Date.now(), // Use timestamp for priority ordering
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      setTitle("")
      onClose()
    } catch (error) {
      console.error("Error adding task:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <Card className="w-full max-w-md shadow-xl animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-accent/10 rounded-full">
              <Plus className="h-4 w-4 text-accent" />
            </div>
            <CardTitle className="text-lg font-semibold">Add New Task</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Task Description
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                autoFocus
                className="focus:ring-accent focus:border-accent"
              />
              <p className="text-xs text-muted-foreground">
                This task will be assigned to you and set as your top priority.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={!title.trim() || loading}
                className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? "Adding..." : "Add Task"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
