export interface TourStep {
  target: string; // CSS selector / data-attribute e.g. '[data-tour="nav-menu"]'
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
}

export const OWNER_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="nav-menu"]',
    title: "Welcome to Ledgr 👋",
    description: "This is your main navigation. Quickly navigate between Sales, Inventory, Customers, Staff, and Reports.",
    placement: "bottom",
  },
  {
    target: '[data-tour="dashboard-summary"]',
    title: "Real-Time Shop Metrics",
    description: "View Revenue, Profit, Total Stock Value, and Spoilage at a glance without digging through spreadsheets.",
    placement: "bottom",
  },
  {
    target: '[data-tour="pos-action"]',
    title: "Quick Sale & POS",
    description: "Ring up customer purchases, record credit sales, or log inventory waste in seconds.",
    placement: "bottom",
  },
  {
    target: '[data-tour="stock-ledger"]',
    title: "Daily Stock Ledger",
    description: "Calculates Opening + Added - Sold = Calculated Closing, showing exact physical stock differences.",
    placement: "top",
  },
  {
    target: '[data-tour="cash-session"]',
    title: "Cash Drawer Check",
    description: "Compares expected drawer cash against actual counted cash at shift close to show missing money immediately.",
    placement: "top",
  },
  {
    target: '[data-tour="help-trigger"]',
    title: "Need Help or Replay?",
    description: "Tap here anytime to replay this product tour or access quick assistance.",
    placement: "bottom",
  },
];

export const STAFF_TOUR_STEPS: TourStep[] = [
  {
    target: '[data-tour="pos-action"]',
    title: "Log Sales & Spoilage",
    description: "Tap here to log customer sales or record spoiled/damaged products during your shift.",
    placement: "bottom",
  },
  {
    target: '[data-tour="stock-ledger"]',
    title: "Confirm Closing Stock",
    description: "Count physical items remaining on shelves at the end of the day and submit your count.",
    placement: "top",
  },
  {
    target: '[data-tour="cash-session"]',
    title: "Shift Cash Count",
    description: "Set your opening float when starting your shift and enter counted cash when closing.",
    placement: "top",
  },
];

export function getTourSteps(tourId: string): TourStep[] {
  if (tourId === "staff-tour") return STAFF_TOUR_STEPS;
  return OWNER_TOUR_STEPS;
}
