import { useState, type FormEvent, useRef, useEffect } from "react";

interface TodoInputProps {
  onAdd: (text: string) => void;
  disabled?: boolean;
}

export function TodoInput({ onAdd, disabled }: TodoInputProps) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new todo…"
        disabled={disabled}
        className="flex-1 rounded-xl border border-surface-700 bg-surface-900 px-4 py-3 text-sm text-surface-50
          placeholder:text-surface-700 transition-all
          focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none
          disabled:opacity-50"
        aria-label="New todo text"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-medium text-white
          hover:bg-brand-500 active:bg-brand-700 transition-all
          disabled:opacity-50 disabled:pointer-events-none cursor-pointer
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950"
        aria-label="Add todo"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </form>
  );
}
