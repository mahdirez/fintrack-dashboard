import { useEffect } from "react";
import { useToastStore, type Toast } from "../store/useToastStore";

const DURATION = 5000;

function ToastItem({ toast }: { toast: Toast }) {
  const dismissToast = useToastStore((s) => s.dismissToast);

  useEffect(() => {
    const id = setTimeout(() => dismissToast(toast.id), DURATION);
    return () => clearTimeout(id);
  }, [toast.id, dismissToast]);

  const handleAction = () => {
    toast.onAction?.();
    dismissToast(toast.id);
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-lg">
      <p className="min-w-0 flex-1 truncate">{toast.message}</p>

      {toast.actionLabel && (
        <button
          onClick={handleAction}
          className="shrink-0 font-semibold text-indigo-600 hover:underline"
        >
          {toast.actionLabel}
        </button>
      )}

      <button
        onClick={() => dismissToast(toast.id)}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100"
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-4 sm:items-end"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto w-full sm:w-96">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}
