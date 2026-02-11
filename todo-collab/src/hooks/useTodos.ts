import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { offlineStore } from '../lib/offline';
import { Todo, TodoList } from '../types/todo';

export function useTodos(userId: string, listId: string, isDemoMode: boolean) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    loadTodos();

    if (!isDemoMode && isSupabaseConfigured()) {
      // Subscribe to real-time changes
      const channel = supabase
        .channel('todos-channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'todos',
            filter: `list_id=eq.${listId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setTodos((prev) => [...prev, payload.new as Todo]);
            } else if (payload.eventType === 'UPDATE') {
              setTodos((prev) =>
                prev.map((todo) => (todo.id === payload.new.id ? (payload.new as Todo) : todo))
              );
            } else if (payload.eventType === 'DELETE') {
              setTodos((prev) => prev.filter((todo) => todo.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId, listId, isDemoMode]);

  const loadTodos = async () => {
    try {
      if (isDemoMode || !isSupabaseConfigured()) {
        // Load from IndexedDB for demo mode
        const offlineTodos = await offlineStore.getTodos();
        setTodos(offlineTodos);
      } else {
        // Load from Supabase
        const { data, error } = await supabase
          .from('todos')
          .select('*')
          .eq('list_id', listId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTodos(data || []);
        
        // Also save to IndexedDB for offline access
        if (data) await offlineStore.saveTodos(data);
      }
    } catch (error) {
      console.error('Error loading todos:', error);
      // Try loading from offline storage as fallback
      const offlineTodos = await offlineStore.getTodos();
      setTodos(offlineTodos);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (title: string) => {
    const newTodo: Todo = {
      id: crypto.randomUUID(),
      user_id: userId,
      title,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      list_id: listId,
    };

    // Optimistic update
    setTodos((prev) => [newTodo, ...prev]);
    await offlineStore.saveTodo(newTodo);

    if (!isDemoMode && isSupabaseConfigured() && isOnline) {
      try {
        const { error } = await supabase.from('todos').insert([newTodo]);
        if (error) throw error;
      } catch (error) {
        console.error('Error adding todo:', error);
      }
    }
  };

  const toggleTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const updatedTodo = {
      ...todo,
      completed: !todo.completed,
      updated_at: new Date().toISOString(),
    };

    // Optimistic update
    setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)));
    await offlineStore.saveTodo(updatedTodo);

    if (!isDemoMode && isSupabaseConfigured() && isOnline) {
      try {
        const { error } = await supabase
          .from('todos')
          .update({ completed: updatedTodo.completed, updated_at: updatedTodo.updated_at })
          .eq('id', id);
        if (error) throw error;
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    }
  };

  const deleteTodo = async (id: string) => {
    // Optimistic update
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await offlineStore.deleteTodo(id);

    if (!isDemoMode && isSupabaseConfigured() && isOnline) {
      try {
        const { error } = await supabase.from('todos').delete().eq('id', id);
        if (error) throw error;
      } catch (error) {
        console.error('Error deleting todo:', error);
      }
    }
  };

  return {
    todos,
    loading,
    isOnline,
    addTodo,
    toggleTodo,
    deleteTodo,
    refreshTodos: loadTodos,
  };
}
