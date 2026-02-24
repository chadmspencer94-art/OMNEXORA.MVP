import type { Todo } from "@/lib/types";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  readonly?: boolean;
}

export function TodoList({ todos, onToggle, onDelete, onUpdate, readonly }: TodoListProps) {
  const pending = todos.filter((t) => !t.completed);
  const completed = todos.filter((t) => t.completed);

  if (todos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3 opacity-60">&#x1F4DD;</div>
        <p className="text-surface-700 text-sm">
          {readonly ? "No todos yet." : "No todos yet. Add one above!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-700 mb-3 px-1">
            To do — {pending.length}
          </h3>
          <ul className="space-y-2">
            {pending.map((todo) => (
              <TodoItem
                key={todo.id}
                {...todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
                readonly={readonly}
              />
            ))}
          </ul>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-surface-700 mb-3 px-1">
            Completed — {completed.length}
          </h3>
          <ul className="space-y-2">
            {completed.map((todo) => (
              <TodoItem
                key={todo.id}
                {...todo}
                onToggle={onToggle}
                onDelete={onDelete}
                onUpdate={onUpdate}
                readonly={readonly}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
