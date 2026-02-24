import type { ReactNode } from "react";
import { Header } from "./Header";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-950 text-surface-50">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-surface-800 py-6">
        <p className="text-center text-xs text-surface-700">
          CollabTodo &mdash; Real-time collaborative todos. Built with React, Supabase &amp; Tailwind.
        </p>
      </footer>
    </div>
  );
}
