import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import type { TodoList } from "@/lib/types";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  list: TodoList | null;
  onToggleShare: (id: string) => Promise<TodoList | null>;
}

export function ShareModal({ open, onClose, list, onToggleShare }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [toggling, setToggling] = useState(false);

  if (!list) return null;

  const shareUrl = list.share_token
    ? `${window.location.origin}/shared/${list.share_token}`
    : null;

  const handleToggle = async () => {
    setToggling(true);
    await onToggleShare(list.id);
    setToggling(false);
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Share list">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-surface-50">Public access</p>
            <p className="text-xs text-surface-700">
              Anyone with the link can view this list
            </p>
          </div>
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={`
              relative w-11 h-6 rounded-full transition-colors cursor-pointer
              ${list.is_public ? "bg-brand-600" : "bg-surface-700"}
            `}
            role="switch"
            aria-checked={list.is_public}
            aria-label="Toggle public sharing"
          >
            <span
              className={`
                block w-4 h-4 rounded-full bg-white transition-transform absolute top-1
                ${list.is_public ? "translate-x-6" : "translate-x-1"}
              `}
            />
          </button>
        </div>

        {list.is_public && shareUrl && (
          <div className="space-y-2">
            <label className="block text-xs font-medium text-surface-200">
              Share link
            </label>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 rounded-lg border border-surface-700 bg-surface-950 px-3 py-2 text-xs text-surface-200 select-all"
              />
              <Button size="sm" variant="secondary" onClick={handleCopy}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
