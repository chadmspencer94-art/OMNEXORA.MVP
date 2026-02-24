import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { cacheTodos, getCachedTodos, enqueueAction, drainQueue, removeAction } from '../lib/offline'
import type { Todo } from '../lib/types'

export function useTodos(listId: string | null) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchTodos = useCallback(async () => {
    if (!listId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('list_id', listId)
      .order('position', { ascending: true })

    if (error) {
      const cached = await getCachedTodos(listId)
      setTodos(cached)
    } else {
      setTodos(data ?? [])
      await cacheTodos(listId, data ?? [])
    }
    setLoading(false)
  }, [listId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    fetchTodos()
  }, [fetchTodos])

  useEffect(() => {
    if (!listId) return
    const channel = supabase
      .channel(`todos:${listId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'todos', filter: `list_id=eq.${listId}` },
        () => {
          fetchTodos()
        },
      )
      .subscribe()

    channelRef.current = channel
    return () => {
      channel.unsubscribe()
    }
  }, [listId, fetchTodos])

  const addTodo = useCallback(
    async (text: string, userId: string) => {
      if (!listId) return
      const now = new Date().toISOString()
      const optimistic: Todo = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        list_id: listId,
        user_id: userId,
        position: todos.length,
        created_at: now,
        updated_at: now,
      }
      setTodos((prev) => [...prev, optimistic])

      const { error } = await supabase.from('todos').insert({
        id: optimistic.id,
        text,
        completed: false,
        list_id: listId,
        user_id: userId,
        position: optimistic.position,
      })

      if (error) {
        await enqueueAction({
          type: 'create',
          table: 'todos',
          payload: { ...optimistic },
        })
      }
    },
    [listId, todos.length],
  )

  const toggleTodo = useCallback(async (id: string, completed: boolean) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)))
    const { error } = await supabase
      .from('todos')
      .update({ completed, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      await enqueueAction({ type: 'update', table: 'todos', payload: { id, completed } })
    }
  }, [])

  const deleteTodo = useCallback(async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
    const { error } = await supabase.from('todos').delete().eq('id', id)
    if (error) {
      await enqueueAction({ type: 'delete', table: 'todos', payload: { id } })
    }
  }, [])

  const updateText = useCallback(async (id: string, text: string) => {
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)))
    const { error } = await supabase
      .from('todos')
      .update({ text, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      await enqueueAction({ type: 'update', table: 'todos', payload: { id, text } })
    }
  }, [])

  const syncOffline = useCallback(async () => {
    const queue = await drainQueue()
    for (const action of queue) {
      if (action.table !== 'todos') continue
      let error = null
      if (action.type === 'create') {
        ;({ error } = await supabase.from('todos').upsert(action.payload as unknown as Todo))
      } else if (action.type === 'update') {
        const { id, ...rest } = action.payload as { id: string } & Record<string, unknown>
        ;({ error } = await supabase.from('todos').update(rest).eq('id', id))
      } else if (action.type === 'delete') {
        ;({ error } = await supabase.from('todos').delete().eq('id', action.payload.id as string))
      }
      if (!error) await removeAction(action.id)
    }
    await fetchTodos()
  }, [fetchTodos])

  useEffect(() => {
    const handleOnline = () => { syncOffline() }
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [syncOffline])

  return { todos, loading, addTodo, toggleTodo, deleteTodo, updateText }
}
