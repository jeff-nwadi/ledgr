import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logSaleAction, logWasteAction, logRestockAction } from "@/app/actions/shift";

export interface QueuedAction {
  id: string;
  type: "sale" | "waste" | "restock";
  payload: any;
  timestamp: string;
}

interface OfflineState {
  isOnline: boolean;
  pendingQueue: QueuedAction[];
  isSyncing: boolean;
  setOnlineStatus: (status: boolean) => void;
  enqueueAction: (type: "sale" | "waste" | "restock", payload: any) => void;
  processQueue: () => Promise<void>;
  clearQueue: () => void;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: typeof window !== "undefined" ? navigator.onLine : true,
      pendingQueue: [],
      isSyncing: false,

      setOnlineStatus: (status: boolean) => {
        set({ isOnline: status });
        if (status) {
          get().processQueue();
        }
      },

      enqueueAction: (type, payload) => {
        const newItem: QueuedAction = {
          id: `queue_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          type,
          payload,
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          pendingQueue: [...state.pendingQueue, newItem],
        }));

        // If online, try syncing right away
        if (get().isOnline) {
          get().processQueue();
        }
      },

      processQueue: async () => {
        const { pendingQueue, isSyncing, isOnline } = get();
        if (isSyncing || pendingQueue.length === 0 || !isOnline) return;

        set({ isSyncing: true });

        const queueToProcess = [...pendingQueue];
        const remainingQueue: QueuedAction[] = [];

        for (const item of queueToProcess) {
          try {
            let res: any = { success: false };
            if (item.type === "sale") {
              res = await logSaleAction(item.payload);
            } else if (item.type === "waste") {
              res = await logWasteAction(item.payload);
            } else if (item.type === "restock") {
              res = await logRestockAction(item.payload);
            }

            if (!res.success) {
              // Re-queue item on error
              remainingQueue.push(item);
            }
          } catch {
            remainingQueue.push(item);
          }
        }

        set({
          pendingQueue: remainingQueue,
          isSyncing: false,
        });
      },

      clearQueue: () => set({ pendingQueue: [] }),
    }),
    {
      name: "ledgr-offline-queue",
      partialize: (state) => ({ pendingQueue: state.pendingQueue }),
    }
  )
);
