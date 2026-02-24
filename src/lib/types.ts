export interface Todo {
  id: string
  text: string
  completed: boolean
  list_id: string
  user_id: string
  position: number
  created_at: string
  updated_at: string
}

export interface TodoList {
  id: string
  name: string
  owner_id: string
  share_token: string | null
  share_mode: 'none' | 'readonly' | 'collaborative'
  created_at: string
}

export interface Profile {
  id: string
  email: string
}

export type AuthState = {
  user: Profile | null
  loading: boolean
}

export interface OfflineAction {
  id: string
  type: 'create' | 'update' | 'delete'
  table: 'todos' | 'todo_lists'
  payload: Record<string, unknown>
  timestamp: number
}
