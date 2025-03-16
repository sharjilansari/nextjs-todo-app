"use server"

import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { revalidatePath } from "next/cache"

const ITEMS_PER_PAGE = 5

export async function getTodos(page = 1, search = "") {
  const { db } = await connectToDatabase()

  const skip = (page - 1) * ITEMS_PER_PAGE

  // Create a query object that includes search if provided
  const query = search
    ? {
        $or: [{ title: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }],
      }
    : {}

  const todos = await db
    .collection("todos")
    .find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(ITEMS_PER_PAGE)
    .toArray()

  const totalCount = await db.collection("todos").countDocuments(query)
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return {
    todos: todos.map(({ _id, ...rest }) => ({
      _id: _id.toString(),
      ...rest,
    })),
    totalPages,
  }
}

export async function getTodoById(id: string) {
  try {
    const { db } = await connectToDatabase()

    const todo = await db.collection("todos").findOne({ _id: new ObjectId(id) })

    if (!todo) {
      throw new Error("Todo not found")
    }

    return {
      _id: todo._id.toString(),
      title: todo.title,
      description: todo.description,
      createdAt: todo.createdAt,
    }
  } catch (error) {
    console.error("Error fetching todo:", error)
    throw new Error("Failed to fetch todo")
  }
}

export async function createTodo(todoData: { title: string; description: string }) {
  try {
    const { db } = await connectToDatabase()

    const result = await db.collection("todos").insertOne({
      ...todoData,
      createdAt: new Date().toISOString(),
    })

    revalidatePath("/")
    return { id: result.insertedId.toString() }
  } catch (error) {
    console.error("Error creating todo:", error)
    throw new Error("Failed to create todo")
  }
}

export async function updateTodo(id: string, todoData: { title: string; description: string }) {
  try {
    const { db } = await connectToDatabase()

    await db.collection("todos").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...todoData,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error updating todo:", error)
    throw new Error("Failed to update todo")
  }
}

export async function deleteTodo(id: string) {
  try {
    const { db } = await connectToDatabase()

    await db.collection("todos").deleteOne({ _id: new ObjectId(id) })

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting todo:", error)
    throw new Error("Failed to delete todo")
  }
}

