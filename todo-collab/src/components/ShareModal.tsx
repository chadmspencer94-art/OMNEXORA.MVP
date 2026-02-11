import { useState } from 'react';

interface ShareModalProps {
  listId: string;
  onClose: () => void;
}

export function ShareModal({ listId, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}?list=${listId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="card max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Share Your List</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Share this link with others to collaborate on this todo list in real-time.
        </p>

        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-4">
          <code className="text-sm break-all">{shareUrl}</code>
        </div>

        <button onClick={copyToClipboard} className="btn-primary w-full">
          {copied ? '✓ Copied!' : 'Copy Link'}
        </button>

        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>Note:</strong> In demo mode, sharing is simulated. Configure Supabase for real collaboration.
          </p>
        </div>
      </div>
    </div>
  );
}
