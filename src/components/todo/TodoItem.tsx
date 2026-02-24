import { useState, useRef, useEffect } from "react";

interface TodoItemProps {
  id: string;
  text: string;
  completed: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
  readonly?: boolean;
}

export function TodoItem({
  id,
  text,
  completed,
  onToggle,
  onDelete,
  onUpdate,
  readonly,
}: TodoItemProps) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(text);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== text) {
      onUpdate(id, trimmed);
    } else {
      setEditText(text);
    }
    setEditing(false);
  };

  return (
    <li
      className={`
        group flex items-center gap-3 rounded-xl px-4 py-3 transition-all
        ${completed ? "bg-surface-900/50" : "bg-surface-850 hover:bg-surface-800"}
      `}
    >
      {!readonly && (
        <button
          onClick={() => onToggle(id)}
          className={`
            shrink-0 w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center cursor-pointer
            ${
              completed
                ? "bg-brand-600 border-brand-600"
                : "border-surface-700 hover:border-brand-400"
            }
          `}
          aria-label={completed ? "Mark incomplete" : "Mark complete"}
        >
          {completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      )}

      {editing && !readonly ? (
        <input
          ref={inputRef}
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") {
              setEditText(text);
              setEditing(false);
            }
          }}
          className="flex-1 bg-transparent text-sm text-surface-50 outline-none border-b border-brand-500 pb-0.5"
        />
      ) : (
        <span
          onDoubleClick={() => !readonly && setEditing(true)}
          className={`
            flex-1 text-sm select-none
            ${completed ? "line-through text-surface-700" : "text-surface-100"}
            ${!readonly ? "cursor-text" : ""}
          `}
        >
          {text}
        </span>
      )}

      {!readonly && (
        <button
          onClick={() => onDelete(id)}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-surface-700 hover:text-danger cursor-pointer"
          aria-label="Delete todo"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </li>
  );
}
