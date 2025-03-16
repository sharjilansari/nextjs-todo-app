"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createTodo } from "@/lib/actions"
import { formatDate } from "@/lib/utils"
import { PlusCircle, ChevronLeft, ChevronRight } from "lucide-react"

interface Todo {
  _id: string
  title: string
  description: string
  createdAt: string
}

interface TodoListProps {
  todos: Todo[]
  currentPage: number
  totalPages: number
  selectedTodoId: string
}

export default function TodoList({ todos, currentPage, totalPages, selectedTodoId }: TodoListProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newTodo, setNewTodo] = useState({ title: "", description: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTodo.title.trim()) return

    try {
      setIsSubmitting(true)
      await createTodo(newTodo)
      setNewTodo({ title: "", description: "" })
      setIsCreating(false)
      router.refresh()
    } catch (error) {
      console.error("Failed to create todo:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTodoClick = (todoId: string) => {
    router.push(`?todoId=${todoId}${currentPage > 1 ? `&page=${currentPage}` : ""}`)
  }

  const handlePageChange = (page: number) => {
    const query = new URLSearchParams()
    if (page > 1) query.set("page", page.toString())
    if (selectedTodoId) query.set("todoId", selectedTodoId)

    router.push(`?${query.toString()}`)
  }

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>My Todos</CardTitle>
        <Button
          onClick={() => setIsCreating(!isCreating)}
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
        >
          <PlusCircle className="h-4 w-4" />
          New Todo
        </Button>
      </CardHeader>
      <CardContent>
        {isCreating && (
          <form onSubmit={handleCreateTodo} className="mb-6 space-y-4 border rounded-md p-4">
            <div className="space-y-2">
              <Input
                placeholder="Todo title"
                value={newTodo.title}
                onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                required
              />
              <Textarea
                placeholder="Description (optional)"
                value={newTodo.description}
                onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Todo"}
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {todos.length > 0 ? (
            todos.map((todo) => (
              <div
                key={todo._id}
                onClick={() => handleTodoClick(todo._id)}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedTodoId === todo._id ? "bg-muted border-primary" : "hover:bg-muted/50"
                }`}
              >
                <h3 className="font-medium truncate">{todo.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{formatDate(todo.createdAt)}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">No todos yet. Create your first one!</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

