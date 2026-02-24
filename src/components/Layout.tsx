import type { ReactNode } from 'react'
import { ThemeToggle } from './ThemeToggle'

interface Props {
  children: ReactNode
  user?: { email: string } | null
  onSignOut?: () => void
}

export function Layout({ children, user, onSignOut }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100 transition-colors dark:bg-slate-950 light:bg-slate-50 light:text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl light:border-slate-200 light:bg-white/80">
        <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <a href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <svg className="h-6 w-6 text-indigo-400" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="14" fill="currentColor" />
              <path d="M18 34l8 8 20-20" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-lg">SyncTodo</span>
          </a>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && (
              <>
                <span className="hidden text-sm text-slate-500 sm:inline">{user.email}</span>
                <button
                  onClick={onSignOut}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">{children}</main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-600 light:border-slate-200">
        SyncTodo &mdash; Real-time collaborative todos
      </footer>
    </div>
  )
}
