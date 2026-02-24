import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLists } from '../hooks/useLists'
import { useTodos } from '../hooks/useTodos'
import { useShare } from '../hooks/useShare'
import { TodoList } from '../components/Todo/TodoList'
import { TodoInput } from '../components/Todo/TodoInput'
import { ShareDialog } from '../components/Share/ShareDialog'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import type { TodoList as TodoListType } from '../lib/types'

interface Props {
  userId: string
}

export function Home({ userId }: Props) {
  const { lists, loading: listsLoading, createList, deleteList } = useLists(userId)
  const [activeList, setActiveList] = useState<TodoListType | null>(null)
  const [showShare, setShowShare] = useState(false)
  const [newListName, setNewListName] = useState('')

  const selectedList = activeList ?? lists[0] ?? null
  const { todos, loading: todosLoading, addTodo, toggleTodo, deleteTodo, updateText } = useTodos(selectedList?.id ?? null)
  const { shareUrl, loading: shareLoading, generateShareLink, revokeShare } = useShare(selectedList)

  const handleCreateList = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = newListName.trim()
    if (!trimmed) return
    const created = await createList(trimmed)
    if (created) setActiveList(created)
    setNewListName('')
  }

  if (listsLoading) {
    return <LoadingSkeleton count={3} />
  }

  return (
    <div className="space-y-6">
      {/* List selector + creator */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {lists.map((list) => (
            <button
              key={list.id}
              onClick={() => setActiveList(list)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                selectedList?.id === list.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 light:bg-slate-100 light:text-slate-600 light:hover:bg-slate-200'
              }`}
            >
              {list.name}
            </button>
          ))}

          <form onSubmit={handleCreateList} className="flex shrink-0 gap-1.5">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="New list…"
              aria-label="New list name"
              className="w-28 rounded-lg border border-slate-700 bg-slate-800/50 px-2.5 py-1.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition focus:border-indigo-500 light:border-slate-300 light:bg-white light:text-slate-900"
            />
            <button
              type="submit"
              disabled={!newListName.trim()}
              className="rounded-lg bg-slate-700 px-2.5 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-600 disabled:opacity-40 light:bg-slate-200 light:text-slate-700"
            >
              +
            </button>
          </form>
        </div>

        {selectedList && (
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{selectedList.name}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowShare(true)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-indigo-400"
                aria-label="Share list"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0-12.814a2.25 2.25 0 1 0 0-2.186 2.25 2.25 0 0 0 0 2.186Zm0 12.814a2.25 2.25 0 1 0 0 2.186 2.25 2.25 0 0 0 0-2.186Z" />
                </svg>
              </button>
              <button
                onClick={() => { deleteList(selectedList.id); setActiveList(null) }}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                aria-label="Delete list"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Todos */}
      {selectedList ? (
        <section className="space-y-4">
          <TodoInput onAdd={(text) => addTodo(text, userId)} />
          <TodoList
            todos={todos}
            loading={todosLoading}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onUpdateText={updateText}
          />
        </section>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <p className="text-lg text-slate-500">Create your first list to get started</p>
        </div>
      )}

      {/* Share dialog */}
      {showShare && selectedList && (
        <ShareDialog
          list={selectedList}
          shareUrl={shareUrl}
          loading={shareLoading}
          onGenerate={generateShareLink}
          onRevoke={revokeShare}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
