import { get, set, del, keys } from 'idb-keyval'
import type { OfflineAction, Todo, TodoList } from './types'

const QUEUE_PREFIX = 'offline_action_'
const TODOS_CACHE = 'cached_todos'
const LISTS_CACHE = 'cached_lists'

export async function enqueueAction(action: Omit<OfflineAction, 'id' | 'timestamp'>) {
  const full: OfflineAction = {
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
  await set(`${QUEUE_PREFIX}${full.id}`, full)
  return full
}

export async function drainQueue(): Promise<OfflineAction[]> {
  const allKeys = await keys()
  const actionKeys = allKeys.filter((k) => String(k).startsWith(QUEUE_PREFIX))
  const actions: OfflineAction[] = []
  for (const k of actionKeys) {
    const val = await get<OfflineAction>(k)
    if (val) actions.push(val)
  }
  actions.sort((a, b) => a.timestamp - b.timestamp)
  return actions
}

export async function removeAction(id: string) {
  await del(`${QUEUE_PREFIX}${id}`)
}

export async function cacheTodos(listId: string, todos: Todo[]) {
  await set(`${TODOS_CACHE}_${listId}`, todos)
}

export async function getCachedTodos(listId: string): Promise<Todo[]> {
  return (await get<Todo[]>(`${TODOS_CACHE}_${listId}`)) ?? []
}

export async function cacheLists(userId: string, lists: TodoList[]) {
  await set(`${LISTS_CACHE}_${userId}`, lists)
}

export async function getCachedLists(userId: string): Promise<TodoList[]> {
  return (await get<TodoList[]>(`${LISTS_CACHE}_${userId}`)) ?? []
}
