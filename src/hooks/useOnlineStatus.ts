import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { offlineStore } from "@/lib/offline";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

export function useOnlineStatus() {
  const isOnline = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    if (!isOnline) return;
    syncPendingOps();
  }, [isOnline]);

  return isOnline;
}

async function syncPendingOps() {
  const ops = offlineStore.getPendingOps();
  for (const op of ops) {
    try {
      const table = op.table as "todos" | "todo_lists";
      if (op.type === "create") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from(table).insert(op.data as any);
      } else if (op.type === "update") {
        const { id, ...rest } = op.data;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await supabase.from(table).update(rest as any).eq("id", id as string);
      } else if (op.type === "delete") {
        await supabase.from(table).delete().eq("id", op.data.id as string);
      }
      offlineStore.removePendingOp(op.id);
    } catch {
      break;
    }
  }
}
