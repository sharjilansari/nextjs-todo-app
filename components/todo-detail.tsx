"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { getTodoById, updateTodo } from "@/lib/actions"
import { formatDate } from "@/lib/utils"
import { Save } from "lucide-react"

interface TodoDetailProps {
  selectedTodoId: string
}

export default function TodoDetail({ selectedTodoId }: TodoDetailProps) {
  const router = useRouter()
  const [todo, setTodo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedTodo, setEditedTodo] = useState({ title: "", description: "" })
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    async function loadTodo() {
      if (!selectedTodoId) {
        setTodo(null)
        return
      }

      setIsLoading(true)
      try {
        const todoData = await getTodoById(selectedTodoId)
        setTodo(todoData)
        setEditedTodo({
          title: todoData.title,
          description: todoData.description,
        })
        setHasChanges(false)
      } catch (error) {
        console.error("Failed to load todo:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTodo()
  }, [selectedTodoId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditedTodo((prev) => ({ ...prev, [name]: value }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!selectedTodoId || !hasChanges) return

    setIsSaving(true)
    try {
      await updateTodo(selectedTodoId, editedTodo)
      setTodo({ ...todo, ...editedTodo })
      setHasChanges(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to update todo:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!selectedTodoId) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Todo Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Select a todo to view details
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Todo Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Todo Details</CardTitle>
        <Button onClick={handleSave} disabled={!hasChanges || isSaving} size="sm" className="flex items-center gap-1">
          <Save className="h-4 w-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent>
        {todo ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input name="title" value={editedTodo.title} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea name="description" value={editedTodo.description} onChange={handleInputChange} rows={5} />
            </div>
            <div className="text-sm text-muted-foreground">Created: {formatDate(todo.createdAt)}</div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">Todo not found</div>
        )}
      </CardContent>
    </Card>
  )
}

