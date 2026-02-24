import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Button } from "./ui/Button";
import { Link } from "react-router-dom";

export function Header() {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-50 border-b border-surface-800 bg-surface-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-4xl flex items-center justify-between px-4 h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center transition-transform group-hover:scale-105">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-surface-50">
            CollabTodo
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {!isOnline && (
            <span className="text-xs px-2 py-1 rounded-full bg-warning/15 text-warning font-medium">
              Offline
            </span>
          )}

          <button
            onClick={toggle}
            className="p-2 rounded-lg hover:bg-surface-800 transition-colors text-surface-200 cursor-pointer"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {user && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-surface-700 hidden sm:inline">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign out
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
