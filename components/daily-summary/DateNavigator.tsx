"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { addDays, subDays, parseISO, format } from "date-fns";

export function DateNavigator({ currentDate }: { currentDate: string }) {
  const router = useRouter();

  const handleDateChange = (dateStr: string) => {
    router.push(`/owner/daily-summary?date=${dateStr}`);
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
    <div className="flex items-center justify-between w-full sm:w-auto bg-surface border border-border rounded-xl p-1 shadow-2xs">
      <button
        onClick={prevDay}
        className="p-2.5 text-text-muted hover:text-text-primary hover:bg-background rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Previous day"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <div className="relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-background border border-border/50 rounded-lg min-h-[44px]">
        <CalendarIcon className="w-4 h-4 text-brand" />
        <span className="text-sm font-semibold text-text-primary">
          {format(current, "EEEE, MMM d, yyyy")}
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
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          aria-label="Select date"
        />
      </div>

      <button
        onClick={nextDay}
        disabled={isTodayOrFuture}
        className="p-2.5 text-text-muted hover:text-text-primary hover:bg-background rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none min-h-[44px] min-w-[44px] flex items-center justify-center"
        aria-label="Next day"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
