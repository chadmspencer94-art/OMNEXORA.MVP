import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useTodos } from '../hooks/useTodos'
import { TodoList } from '../components/Todo/TodoList'
import { TodoInput } from '../components/Todo/TodoInput'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import type { TodoList as TodoListType } from '../lib/types'

export function SharedList() {
  const { token } = useParams<{ token: string }>()
  const [list, setList] = useState<TodoListType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    supabase
      .from('todo_lists')
      .select('*')
      .eq('share_token', token)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError('This shared list was not found or the link has been revoked.')
        } else {
          setList(data as TodoListType)
        }
        setLoading(false)
      })
  }, [token])

  const { todos, loading: todosLoading, addTodo, toggleTodo, deleteTodo, updateText } = useTodos(list?.id ?? null)
  const isReadonly = list?.share_mode === 'readonly'

  if (loading) return <LoadingSkeleton count={4} />

  if (error || !list) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <svg className="h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
        <p className="text-lg text-slate-400">{error}</p>
        <a href="/" className="text-sm text-indigo-400 hover:text-indigo-300">
          Go home
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{list.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Shared list &mdash; {isReadonly ? 'view only' : 'collaborative editing'}
        </p>
      </div>

      {!isReadonly && (
        <TodoInput onAdd={(text) => addTodo(text, list.owner_id)} />
      )}

      <TodoList
        todos={todos}
        loading={todosLoading}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onUpdateText={updateText}
        readonly={isReadonly}
      />
    </div>
  )
}
