export interface TodoItem {
  id: string
  text: string
  done: boolean
}

export interface Note {
  id: string
  title: string
  todos: TodoItem[]
  createdAt: number
  updatedAt: number
}

export function createEmptyNote(): Note {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title: '',
    todos: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function createTodo(text = ''): TodoItem {
  return {
    id: crypto.randomUUID(),
    text,
    done: false,
  }
}

export function cloneNote(note: Note): Note {
  return {
    ...note,
    todos: note.todos.map(todo => ({ ...todo })),
  }
}
