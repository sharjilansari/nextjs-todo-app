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
import { PlusCircle, ChevronLeft, ChevronRight, Trash2, Search, X } from "lucide-react"
import { DeleteConfirmation } from "./delete-confirmation"
import { deleteTodo } from "@/lib/actions"

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
  searchQuery?: string
}

export default function TodoList({ todos, currentPage, totalPages, selectedTodoId, searchQuery = "" }: TodoListProps) {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [newTodo, setNewTodo] = useState({ title: "", description: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [search, setSearch] = useState(searchQuery)
  const [todoToDelete, setTodoToDelete] = useState<{ id: string; title: string } | null>(null)

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = new URLSearchParams()
    if (currentPage > 1) query.set("page", "1") // Reset to first page on new search
    if (selectedTodoId) query.set("todoId", selectedTodoId)
    if (search) query.set("search", search)

    router.push(`?${query.toString()}`)
  }

  const handleDelete = async () => {
    if (!todoToDelete) return

    try {
      await deleteTodo(todoToDelete.id)
      setTodoToDelete(null)

      // If the deleted todo was selected, clear the selection
      if (selectedTodoId === todoToDelete.id) {
        const query = new URLSearchParams()
        if (currentPage > 1) query.set("page", currentPage.toString())
        if (search) query.set("search", search)
        router.push(`?${query.toString()}`)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to delete todo:", error)
    }
  }

  const handleTodoClick = (todoId: string) => {
    const query = new URLSearchParams()
    if (currentPage > 1) query.set("page", currentPage.toString())
    if (search) query.set("search", search)
    query.set("todoId", todoId)

    router.push(`?${query.toString()}`)
  }

  const handlePageChange = (page: number) => {
    const query = new URLSearchParams()
    if (page > 1) query.set("page", page.toString())
    if (selectedTodoId) query.set("todoId", selectedTodoId)
    if (search) query.set("search", search)

    router.push(`?${query.toString()}`)
  }

  const clearSearch = () => {
    setSearch("")
    const query = new URLSearchParams()
    if (currentPage > 1) query.set("page", currentPage.toString())
    if (selectedTodoId) query.set("todoId", selectedTodoId)

    router.push(`?${query.toString()}`)
  }

  const handleDeleteClick = (e: React.MouseEvent, todo: Todo) => {
    e.stopPropagation()
    setTodoToDelete({ id: todo._id, title: todo.title })
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
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search todos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

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
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium truncate">{todo.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{formatDate(todo.createdAt)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={(e) => handleDeleteClick(e, todo)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              {search ? "No todos match your search" : "No todos yet. Create your first one!"}
            </div>
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

        {todoToDelete && (
          <DeleteConfirmation
            isOpen={!!todoToDelete}
            onClose={() => setTodoToDelete(null)}
            onConfirm={handleDelete}
            title={todoToDelete.title}
          />
        )}
      </CardContent>
    </Card>
  )
}

