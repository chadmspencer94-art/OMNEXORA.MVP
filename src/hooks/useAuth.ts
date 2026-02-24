import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { AuthState } from '../lib/types'

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({ user: null, loading: true })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth({
        user: session?.user
          ? { id: session.user.id, email: session.user.email ?? '' }
          : null,
        loading: false,
      })
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth({
        user: session?.user
          ? { id: session.user.id, email: session.user.email ?? '' }
          : null,
        loading: false,
      })
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  return { ...auth, signUp, signIn, signOut }
}
