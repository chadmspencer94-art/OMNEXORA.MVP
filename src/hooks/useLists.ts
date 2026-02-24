import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { cacheLists, getCachedLists } from '../lib/offline'
import type { TodoList } from '../lib/types'

export function useLists(userId: string | null) {
  const [lists, setLists] = useState<TodoList[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLists = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('todo_lists')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      const cached = await getCachedLists(userId)
      setLists(cached)
    } else {
      setLists(data ?? [])
      await cacheLists(userId, data ?? [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- data fetch on mount
    fetchLists()
  }, [fetchLists])

  const createList = useCallback(
    async (name: string) => {
      if (!userId) return null
      const { data, error } = await supabase
        .from('todo_lists')
        .insert({ name, owner_id: userId })
        .select()
        .single()

      if (error) throw error
      setLists((prev) => [data, ...prev])
      return data as TodoList
    },
    [userId],
  )

  const deleteList = useCallback(async (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id))
    await supabase.from('todo_lists').delete().eq('id', id)
  }, [])

  return { lists, loading, createList, deleteList, refetch: fetchLists }
}
