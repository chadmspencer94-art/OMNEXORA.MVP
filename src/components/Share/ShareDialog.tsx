import { useState } from 'react'
import type { TodoList } from '../../lib/types'

interface Props {
  list: TodoList
  shareUrl: string | null
  loading: boolean
  onGenerate: (mode: 'readonly' | 'collaborative') => void
  onRevoke: () => void
  onClose: () => void
}

export function ShareDialog({ list, shareUrl, loading, onGenerate, onRevoke, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Share list"
        className="w-full max-w-md space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl light:border-slate-200 light:bg-white"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Share &ldquo;{list.name}&rdquo;</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-slate-300">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {shareUrl ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm light:border-slate-200 light:bg-slate-50">
              <span className="flex-1 truncate text-slate-300 light:text-slate-700">{shareUrl}</span>
              <button
                onClick={copyLink}
                className="shrink-0 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Mode: <span className="font-medium text-slate-400">{list.share_mode}</span>
            </p>
            <button
              onClick={onRevoke}
              className="w-full rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
            >
              Revoke share link
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => onGenerate('readonly')}
              disabled={loading}
              className="w-full rounded-lg border border-slate-700 px-4 py-3 text-left text-sm transition hover:border-indigo-500/50 hover:bg-indigo-500/5 disabled:opacity-50 light:border-slate-200"
            >
              <span className="font-medium">Read-only</span>
              <span className="mt-0.5 block text-xs text-slate-500">Others can view but not edit</span>
            </button>
            <button
              onClick={() => onGenerate('collaborative')}
              disabled={loading}
              className="w-full rounded-lg border border-slate-700 px-4 py-3 text-left text-sm transition hover:border-indigo-500/50 hover:bg-indigo-500/5 disabled:opacity-50 light:border-slate-200"
            >
              <span className="font-medium">Collaborative</span>
              <span className="mt-0.5 block text-xs text-slate-500">Others can add and complete todos</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
