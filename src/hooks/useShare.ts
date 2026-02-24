import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { TodoList } from '../lib/types'

export function useShare(list: TodoList | null) {
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const generateShareLink = useCallback(
    async (mode: 'readonly' | 'collaborative') => {
      if (!list) return
      setLoading(true)
      const token = list.share_token ?? crypto.randomUUID()

      const { error } = await supabase
        .from('todo_lists')
        .update({ share_token: token, share_mode: mode })
        .eq('id', list.id)

      if (!error) {
        const url = `${window.location.origin}/shared/${token}`
        setShareUrl(url)
      }
      setLoading(false)
    },
    [list],
  )

  const revokeShare = useCallback(async () => {
    if (!list) return
    await supabase
      .from('todo_lists')
      .update({ share_token: null, share_mode: 'none' })
      .eq('id', list.id)
    setShareUrl(null)
  }, [list])

  return { shareUrl, loading, generateShareLink, revokeShare }
}
