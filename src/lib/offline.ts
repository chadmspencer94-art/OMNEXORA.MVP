import type { Todo, TodoList } from "./types";

const STORAGE_KEYS = {
  TODOS: "collabtodo_todos",
  LISTS: "collabtodo_lists",
  PENDING_OPS: "collabtodo_pending_ops",
} as const;

interface PendingOperation {
  id: string;
  type: "create" | "update" | "delete";
  table: "todos" | "todo_lists";
  data: Record<string, unknown>;
  timestamp: number;
}

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable — silently degrade
  }
}

export const offlineStore = {
  getTodos(listId: string): Todo[] {
    const all = safeGet<Record<string, Todo[]>>(STORAGE_KEYS.TODOS, {});
    return all[listId] ?? [];
  },

  setTodos(listId: string, todos: Todo[]): void {
    const all = safeGet<Record<string, Todo[]>>(STORAGE_KEYS.TODOS, {});
    all[listId] = todos;
    safeSet(STORAGE_KEYS.TODOS, all);
  },

  getLists(): TodoList[] {
    return safeGet<TodoList[]>(STORAGE_KEYS.LISTS, []);
  },

  setLists(lists: TodoList[]): void {
    safeSet(STORAGE_KEYS.LISTS, lists);
  },

  addPendingOp(op: Omit<PendingOperation, "id" | "timestamp">): void {
    const ops = safeGet<PendingOperation[]>(STORAGE_KEYS.PENDING_OPS, []);
    ops.push({
      ...op,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    });
    safeSet(STORAGE_KEYS.PENDING_OPS, ops);
  },

  getPendingOps(): PendingOperation[] {
    return safeGet<PendingOperation[]>(STORAGE_KEYS.PENDING_OPS, []);
  },

  clearPendingOps(): void {
    safeSet(STORAGE_KEYS.PENDING_OPS, []);
  },

  removePendingOp(id: string): void {
    const ops = safeGet<PendingOperation[]>(STORAGE_KEYS.PENDING_OPS, []);
    safeSet(
      STORAGE_KEYS.PENDING_OPS,
      ops.filter((op) => op.id !== id),
    );
  },
};
