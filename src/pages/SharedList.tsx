import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import { TodoList } from "@/components/todo/TodoList";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import type { Todo, TodoList as TodoListType } from "@/lib/types";

export function SharedList() {
  const { token } = useParams<{ token: string }>();
  const [list, setList] = useState<TodoListType | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    async function load() {
      const { data: listData, error: listError } = await supabase
        .from("todo_lists")
        .select("*")
        .eq("share_token", token!)
        .eq("is_public", true)
        .single();

      if (listError || !listData) {
        setError("This list doesn't exist or isn't shared.");
        setLoading(false);
        return;
      }

      setList(listData as TodoListType);

      const { data: todoData } = await supabase
        .from("todos")
        .select("*")
        .eq("list_id", (listData as TodoListType).id)
        .order("position", { ascending: true })
        .order("created_at", { ascending: true });

      if (todoData) setTodos(todoData as Todo[]);
      setLoading(false);
    }

    load();
  }, [token]);

  // Real-time on shared list
  useEffect(() => {
    if (!list) return;
    const channel = supabase
      .channel(`shared:${list.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todos",
          filter: `list_id=eq.${list.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setTodos((prev) => {
              const exists = prev.some((t) => t.id === (payload.new as Todo).id);
              return exists ? prev : [...prev, payload.new as Todo];
            });
          } else if (payload.eventType === "UPDATE") {
            setTodos((prev) =>
              prev.map((t) =>
                t.id === (payload.new as Todo).id ? (payload.new as Todo) : t,
              ),
            );
          } else if (payload.eventType === "DELETE") {
            setTodos((prev) =>
              prev.filter((t) => t.id !== (payload.old as { id: string }).id),
            );
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [list]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !list) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">&#x1F512;</div>
          <h1 className="text-xl font-bold text-surface-50 mb-2">Not found</h1>
          <p className="text-sm text-surface-700 mb-6">
            {error ?? "This shared list could not be found."}
          </p>
          <Link to="/">
            <Button>Go home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{list.name} — CollabTodo Shared List</title>
        <meta name="description" content={`Shared todo list: ${list.name}`} />
      </Helmet>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6">
          <Link
            to="/"
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors inline-flex items-center gap-1 mb-3"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to my todos
          </Link>
          <h1 className="text-2xl font-bold text-surface-50">{list.name}</h1>
          <p className="text-sm text-surface-700 mt-1">
            Shared list &mdash; view only
          </p>
        </div>

        <TodoList
          todos={todos}
          onToggle={() => {}}
          onDelete={() => {}}
          onUpdate={() => {}}
          readonly
        />
      </div>
    </>
  );
}
