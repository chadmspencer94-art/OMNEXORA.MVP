import { useState } from 'react';
import { TodoItem } from './TodoItem';
import { AddTodo } from './AddTodo';
import { ShareModal } from './ShareModal';
import { useTodos } from '../hooks/useTodos';

interface TodoListProps {
  userId: string;
  userEmail: string;
  isDemoMode: boolean;
  onSignOut: () => void;
}

export function TodoList({ userId, userEmail, isDemoMode, onSignOut }: TodoListProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  
  // For demo, use a fixed list ID
  const listId = 'default-list';
  
  const { todos, loading, isOnline, addTodo, toggleTodo, deleteTodo } = useTodos(
    userId,
    listId,
    isDemoMode
  );

  // Apply dark mode
  if (darkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  const completedCount = todos.filter((t) => t.completed).length;
  const totalCount = todos.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              📋 Todo Collab
            </h1>
            {!isOnline && (
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-sm rounded-full">
                Offline
              </span>
            )}
            {isDemoMode && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-sm rounded-full">
                Demo Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="btn-secondary"
            >
              Share
            </button>

            <button onClick={onSignOut} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="card mb-6">
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">
              Signed in as <strong>{userEmail}</strong>
            </p>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-500">
              {totalCount > 0 && (
                <span>
                  {completedCount} of {totalCount} completed
                </span>
              )}
            </div>
          </div>

          <AddTodo onAdd={addTodo} />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading todos...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No todos yet. Add one above to get started! 🚀
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
              />
            ))}
          </div>
        )}
      </main>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal listId={listId} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}
