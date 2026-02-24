import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { offlineStore } from "@/lib/offline";
import { useAuth } from "@/contexts/AuthContext";
import type { TodoList } from "@/lib/types";

export function useTodoLists() {
  const { user } = useAuth();
  const [lists, setLists] = useState<TodoList[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLists = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("todo_lists")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setLists(data as TodoList[]);
      offlineStore.setLists(data as TodoList[]);
    } else if (!navigator.onLine) {
      setLists(offlineStore.getLists());
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const createList = useCallback(
    async (name: string) => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("todo_lists")
        .insert({ name, user_id: user.id, is_public: false })
        .select()
        .single();

      if (!error && data) {
        const list = data as TodoList;
        setLists((prev) => [list, ...prev]);
        return list;
      }

      if (!navigator.onLine) {
        const optimistic: TodoList = {
          id: crypto.randomUUID(),
          name,
          user_id: user.id,
          share_token: null,
          is_public: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setLists((prev) => [optimistic, ...prev]);
        offlineStore.addPendingOp({
          type: "create",
          table: "todo_lists",
          data: { name, user_id: user.id, is_public: false },
        });
        return optimistic;
      }

      return null;
    },
    [user],
  );

  const deleteList = useCallback(
    async (id: string) => {
      setLists((prev) => prev.filter((l) => l.id !== id));
      const { error } = await supabase.from("todo_lists").delete().eq("id", id);
      if (error && !navigator.onLine) {
        offlineStore.addPendingOp({
          type: "delete",
          table: "todo_lists",
          data: { id },
        });
      }
    },
    [],
  );

  const toggleShareList = useCallback(
    async (id: string) => {
      const list = lists.find((l) => l.id === id);
      if (!list) return null;
      const newPublic = !list.is_public;
      setLists((prev) =>
        prev.map((l) => (l.id === id ? { ...l, is_public: newPublic } : l)),
      );
      const { data } = await supabase
        .from("todo_lists")
        .update({ is_public: newPublic })
        .eq("id", id)
        .select()
        .single();
      if (data) {
        const updated = data as TodoList;
        setLists((prev) => prev.map((l) => (l.id === id ? updated : l)));
        return updated;
      }
      return list;
    },
    [lists],
  );

  return { lists, loading, createList, deleteList, toggleShareList, refetch: fetchLists };
}
