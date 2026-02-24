import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { offlineStore } from "@/lib/offline";
import { useAuth } from "@/contexts/AuthContext";
import type { Todo } from "@/lib/types";

export function useTodos(listId: string | null) {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    if (!listId) {
      setTodos([]);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("list_id", listId)
      .order("position", { ascending: true })
      .order("created_at", { ascending: true });

    if (!error && data) {
      setTodos(data as Todo[]);
      offlineStore.setTodos(listId, data as Todo[]);
    } else if (!navigator.onLine) {
      setTodos(offlineStore.getTodos(listId));
    }
    setLoading(false);
  }, [listId]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Real-time subscription
  useEffect(() => {
    if (!listId) return;
    const channel = supabase
      .channel(`todos:${listId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "todos",
          filter: `list_id=eq.${listId}`,
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
  }, [listId]);

  const addTodo = useCallback(
    async (text: string) => {
      if (!listId || !user) return;
      const position = todos.length;
      const optimistic: Todo = {
        id: crypto.randomUUID(),
        text,
        completed: false,
        list_id: listId,
        user_id: user.id,
        position,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setTodos((prev) => [...prev, optimistic]);

      const { data, error } = await supabase
        .from("todos")
        .insert({
          text,
          completed: false,
          list_id: listId,
          user_id: user.id,
          position,
        })
        .select()
        .single();

      if (data) {
        setTodos((prev) =>
          prev.map((t) => (t.id === optimistic.id ? (data as Todo) : t)),
        );
      } else if (error && !navigator.onLine) {
        offlineStore.addPendingOp({
          type: "create",
          table: "todos",
          data: {
            text,
            completed: false,
            list_id: listId,
            user_id: user.id,
            position,
          },
        });
      }
    },
    [listId, user, todos.length],
  );

  const toggleTodo = useCallback(async (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
    );
    const current = todos.find((t) => t.id === id);
    if (!current) return;
    const { error } = await supabase
      .from("todos")
      .update({ completed: !current.completed })
      .eq("id", id);

    if (error && !navigator.onLine) {
      offlineStore.addPendingOp({
        type: "update",
        table: "todos",
        data: { id, completed: !current.completed },
      });
    }
  }, [todos]);

  const deleteTodo = useCallback(async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error && !navigator.onLine) {
      offlineStore.addPendingOp({
        type: "delete",
        table: "todos",
        data: { id },
      });
    }
  }, []);

  const updateTodo = useCallback(async (id: string, text: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text } : t)),
    );
    const { error } = await supabase
      .from("todos")
      .update({ text })
      .eq("id", id);

    if (error && !navigator.onLine) {
      offlineStore.addPendingOp({
        type: "update",
        table: "todos",
        data: { id, text },
      });
    }
  }, []);

  return { todos, loading, addTodo, toggleTodo, deleteTodo, updateTodo, refetch: fetchTodos };
}
