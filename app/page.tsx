import TodoList from "@/components/todo-list"
import TodoDetail from "@/components/todo-detail"
import { getTodos } from "@/lib/actions"

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string; todoId?: string }
}) {
  const currentPage = Number(searchParams.page) || 1
  const selectedTodoId = searchParams.todoId || ""

  const { todos, totalPages } = await getTodos(currentPage)

  return (
    <main className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Todo App</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TodoList todos={todos} currentPage={currentPage} totalPages={totalPages} selectedTodoId={selectedTodoId} />
        <TodoDetail selectedTodoId={selectedTodoId} />
      </div>
    </main>
  )
}

