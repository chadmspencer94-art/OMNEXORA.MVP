import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTodoLists } from "@/hooks/useTodoLists";
import { useTodos } from "@/hooks/useTodos";
import { TodoInput } from "@/components/todo/TodoInput";
import { TodoList } from "@/components/todo/TodoList";
import { ShareModal } from "@/components/todo/ShareModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import type { TodoList as TodoListType } from "@/lib/types";

export function Home() {
  const { lists, loading: listsLoading, createList, deleteList, toggleShareList } =
    useTodoLists();
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [shareList, setShareList] = useState<TodoListType | null>(null);
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState("");

  const activeList = lists.find((l) => l.id === activeListId) ?? lists[0] ?? null;
  const currentListId = activeList?.id ?? null;

  const { todos, loading: todosLoading, addTodo, toggleTodo, deleteTodo, updateTodo } =
    useTodos(currentListId);

  const handleCreateList = async () => {
    const name = newListName.trim() || "My Todos";
    const list = await createList(name);
    if (list) {
      setActiveListId(list.id);
      setNewListName("");
      setShowNewList(false);
    }
  };

  if (listsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Todos — CollabTodo</title>
      </Helmet>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Sidebar: Lists */}
          <aside className="sm:w-56 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-surface-700">
                Lists
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNewList(true)}
                aria-label="New list"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </Button>
            </div>

            {showNewList && (
              <div className="mb-3 flex gap-1.5">
                <input
                  autoFocus
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateList();
                    if (e.key === "Escape") setShowNewList(false);
                  }}
                  placeholder="List name…"
                  className="flex-1 text-xs rounded-lg border border-surface-700 bg-surface-900 px-2.5 py-1.5
                    text-surface-50 placeholder:text-surface-700 focus:border-brand-500 focus:outline-none"
                />
                <Button size="sm" onClick={handleCreateList}>
                  Add
                </Button>
              </div>
            )}

            <nav className="space-y-1">
              {lists.length === 0 && (
                <p className="text-xs text-surface-700 py-2">
                  No lists yet. Create one!
                </p>
              )}
              {lists.map((list) => (
                <div
                  key={list.id}
                  className={`
                    group flex items-center rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer
                    ${
                      list.id === currentListId
                        ? "bg-brand-600/15 text-brand-400 font-medium"
                        : "text-surface-200 hover:bg-surface-800"
                    }
                  `}
                  onClick={() => setActiveListId(list.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setActiveListId(list.id)}
                >
                  <span className="flex-1 truncate">{list.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShareList(list);
                      }}
                      className="p-1 text-surface-700 hover:text-brand-400 cursor-pointer"
                      aria-label="Share list"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteList(list.id);
                        if (list.id === currentListId) setActiveListId(null);
                      }}
                      className="p-1 text-surface-700 hover:text-danger cursor-pointer"
                      aria-label="Delete list"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main: Todos */}
          <section className="flex-1 min-w-0">
            {currentListId ? (
              <div className="space-y-6">
                <div>
                  <h1 className="text-xl font-bold text-surface-50 mb-1">
                    {activeList?.name}
                  </h1>
                  {activeList?.is_public && (
                    <span className="inline-flex items-center gap-1 text-xs text-brand-400 bg-brand-600/10 rounded-full px-2 py-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" />
                      </svg>
                      Shared
                    </span>
                  )}
                </div>

                <TodoInput onAdd={addTodo} />

                {todosLoading ? (
                  <LoadingSpinner className="py-12" />
                ) : (
                  <TodoList
                    todos={todos}
                    onToggle={toggleTodo}
                    onDelete={deleteTodo}
                    onUpdate={updateTodo}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[40vh]">
                <div className="text-center">
                  <div className="text-5xl mb-4 opacity-60">&#x1F4CB;</div>
                  <h2 className="text-lg font-semibold text-surface-200 mb-2">
                    Select or create a list
                  </h2>
                  <p className="text-sm text-surface-700 mb-4">
                    Organize your todos into lists
                  </p>
                  <Button onClick={() => setShowNewList(true)}>
                    Create your first list
                  </Button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <ShareModal
        open={!!shareList}
        onClose={() => setShareList(null)}
        list={shareList}
        onToggleShare={toggleShareList}
      />
    </>
  );
}
