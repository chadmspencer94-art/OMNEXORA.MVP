import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { Todo } from '../../lib/types'

interface Props {
  todo: Todo
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
  onUpdateText: (id: string, text: string) => void
  readonly?: boolean
}

export function TodoItem({ todo, onToggle, onDelete, onUpdateText, readonly }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)
  const inputRef = useRef<HTMLInputElement>(null)

  const commitEdit = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== todo.text) {
      onUpdateText(todo.id, trimmed)
    } else {
      setDraft(todo.text)
    }
    setEditing(false)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') { setDraft(todo.text); setEditing(false) }
  }

  return (
    <div
      className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
        todo.completed
          ? 'border-slate-800 bg-slate-900/30 light:border-slate-200 light:bg-slate-50'
          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 light:border-slate-200 light:bg-white light:hover:border-slate-300'
      }`}
    >
      <button
        onClick={() => !readonly && onToggle(todo.id, !todo.completed)}
        disabled={readonly}
        aria-label={todo.completed ? 'Mark as incomplete' : 'Mark as complete'}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
          todo.completed
            ? 'border-indigo-500 bg-indigo-500 text-white'
            : 'border-slate-600 hover:border-indigo-400 light:border-slate-400'
        }`}
      >
        {todo.completed && (
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {editing && !readonly ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          autoFocus
          className="flex-1 bg-transparent text-sm outline-none"
        />
      ) : (
        <span
          onDoubleClick={() => { if (!readonly) { setEditing(true); setDraft(todo.text) } }}
          className={`flex-1 cursor-default text-sm ${
            todo.completed ? 'text-slate-500 line-through' : ''
          }`}
        >
          {todo.text}
        </span>
      )}

      {!readonly && (
        <button
          onClick={() => onDelete(todo.id)}
          aria-label="Delete todo"
          className="shrink-0 rounded-lg p-1 text-slate-600 opacity-0 transition hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
          </svg>
        </button>
      )}
    </div>
  )
}
