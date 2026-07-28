"use client";

import { useToastStore, ToastItem } from "@/lib/store/toast-store";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div 
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onClose }: { toast: ToastItem; onClose: () => void }) {
  const isSuccess = toast.type === "success";
  const isError = toast.type === "error";
  const isWarning = toast.type === "warning";

  const bgStyles = isSuccess
    ? "border-success/30 bg-surface/95 text-text-primary shadow-lg shadow-success/5"
    : isError
    ? "border-danger/30 bg-surface/95 text-text-primary shadow-lg shadow-danger/5"
    : isWarning
    ? "border-amber-500/30 bg-surface/95 text-text-primary shadow-lg shadow-amber-500/5"
    : "border-border/80 bg-surface/95 text-text-primary shadow-lg";

  const IconComponent = isSuccess
    ? CheckCircle2
    : isError
    ? XCircle
    : isWarning
    ? AlertTriangle
    : Info;

  const iconColor = isSuccess
    ? "text-success"
    : isError
    ? "text-danger"
    : isWarning
    ? "text-amber-500"
    : "text-brand";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md ${bgStyles}`}
    >
      <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold tracking-tight">{toast.title}</h4>
        {toast.message && (
          <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{toast.message}</p>
        )}
      </div>

      <button
        onClick={onClose}
        className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-md hover:bg-surface-hover shrink-0 -mr-1 -mt-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
