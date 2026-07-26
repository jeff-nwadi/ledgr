"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { addDays, subDays, parseISO, format } from "date-fns";

export function DateNavigator({ currentDate }: { currentDate: string }) {
  const router = useRouter();

  const handleDateChange = (dateStr: string) => {
    router.push(`/dashboard/daily-summary?date=${dateStr}`);
  };

  const current = parseISO(currentDate);

  const prevDay = () => {
    const newDate = subDays(current, 1);
    handleDateChange(format(newDate, "yyyy-MM-dd"));
  };

  const nextDay = () => {
    const newDate = addDays(current, 1);
    handleDateChange(format(newDate, "yyyy-MM-dd"));
  };

  // Ensure user cannot navigate to future days (assuming reports are past/present)
  const isTodayOrFuture = currentDate >= format(new Date(), "yyyy-MM-dd");

  return (
    <div className="flex items-center gap-2 bg-surface border border-border rounded-lg p-1">
      <button
        onClick={prevDay}
        className="p-1.5 text-text-muted hover:text-text-primary hover:bg-background rounded-md transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <div className="relative flex items-center gap-2 px-3 py-1.5 bg-background border border-border/50 rounded-md">
        <CalendarIcon className="w-4 h-4 text-text-muted" />
        <span className="text-sm font-medium text-text-primary">
          {format(current, "MMM d, yyyy")}
        </span>
        <input 
          type="date" 
          value={currentDate}
          max={format(new Date(), "yyyy-MM-dd")}
          onChange={(e) => {
            if (e.target.value) {
              handleDateChange(e.target.value);
            }
          }}
          className="absolute inset-0 opacity-0 cursor-pointer w-full"
        />
      </div>

      <button
        onClick={nextDay}
        disabled={isTodayOrFuture}
        className="p-1.5 text-text-muted hover:text-text-primary hover:bg-background rounded-md transition-colors disabled:opacity-30 disabled:pointer-events-none"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
