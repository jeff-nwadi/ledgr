"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { 
  ShoppingBag, 
  Trash2, 
  PackagePlus, 
  Clock, 
  Coins, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Search, 
  Check, 
  AlertTriangle, 
  UserPlus, 
  X, 
  ChevronRight, 
  ChevronLeft,
  ArrowLeft,
  DollarSign,
  Info,
  CheckCircle2,
  Lock,
  Home,
  ClipboardList,
  BarChart3,
  LogOut,
  User,
  Store,
  Plus,
  Minus,
  ShoppingCart,
  TrendingUp,
  Package,
  Sparkles,
  Layers,
  HelpCircle
} from "lucide-react";
import { 
  submitOpeningStockCountAction,
  logSaleAction, 
  logWasteAction, 
  logRestockAction, 
  closeShiftAction, 
  getShiftStockSummaryAction,
  quickAddCustomerAction,
  searchCustomersAction,
  getActiveShiftAction,
  getMyShiftActivityAction
} from "@/app/actions/shift";
import { signOutAction } from "@/app/actions/auth";
import { useOfflineStore } from "@/lib/store/offline-queue";
import { toast } from "@/lib/store/toast-store";
import { ThemeToggle } from "@/components/theme-toggle";

interface Product {
  id: string;
  name: string;
  unit: string;
  sellingPrice: number;
  currentStock: number;
  lowStockThreshold: number | null;
  category: string | null;
  expectedOpeningQty?: number;
}

interface ProductSalesBreakdown {
  productId: string;
  productName: string;
  unit: string;
  soldQty: number;
  addedQty: number;
  wasteQty: number;
  openingQty: number;
  currentStock: number;
  sellingPrice: number;
  totalRevenue: number;
}

interface ActiveShift {
  id: string;
  date: string;
  openingFloat: number;
  expectedCash: number;
  totalSalesAmount: number;
  openingCountCompleted: boolean;
  totalUnitsSold?: number;
  productSalesBreakdown?: ProductSalesBreakdown[];
}

interface ActivityItem {
  id: string;
  type: "sale" | "waste" | "restock" | "opening_count";
  title: string;
  detail: string;
  amount: number | null;
  createdAt: string;
}

interface CartItem {
  productId: string;
  quantity: number;
}

interface StaffDashboardProps {
  initialShift: ActiveShift | null;
  products: Product[];
  initialActivities: ActivityItem[];
  currencySymbol?: string;
  staffName?: string;
  shopCode?: string;
}

type BottomTabType = "home" | "waste" | "sale" | "stock" | "activity";

export function StaffDashboard({
  initialShift,
  products,
  initialActivities,
  currencySymbol = "₦",
  staffName = "Staff Member",
  shopCode = ""
}: StaffDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [shift, setShift] = useState<ActiveShift | null>(initialShift);
  const [productList, setProductList] = useState<Product[]>(products);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);

  // Sub-tab inside Stock view: "count" | "restock"
  const [stockSubTab, setStockSubTab] = useState<"count" | "restock">("count");

  // Search filter states
  const [saleSearch, setSaleSearch] = useState("");
  const [wasteSearch, setWasteSearch] = useState("");

  // Opening Stock Count State
  const [openingCounts, setOpeningCounts] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    products.forEach((p) => {
      init[p.id] = p.expectedOpeningQty ?? p.currentStock ?? 0;
    });
    return init;
  });
  const [isOpeningSubmitting, setIsOpeningSubmitting] = useState(false);

  // Sale Cart & Checkout State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<"paid" | "credit">("paid");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [isSaleSubmitting, setIsSaleSubmitting] = useState(false);
  const [saleSuccess, setSaleSuccess] = useState(false);

  // Log Waste State
  const [wasteProductId, setWasteProductId] = useState<string>("");
  const [wasteQty, setWasteQty] = useState<number>(1);
  const [wasteReason, setWasteReason] = useState<string>("Expired");
  const [isWasteSubmitting, setIsWasteSubmitting] = useState(false);
  const [wasteSuccess, setWasteSuccess] = useState(false);

  // Log Restock State
  const [restockProductId, setRestockProductId] = useState<string>("");
  const [restockQty, setRestockQty] = useState<number>(1);
  const [isRestockSubmitting, setIsRestockSubmitting] = useState(false);

  // Shift Closure Fullscreen Takeover State
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);
  const [closeStep, setCloseStep] = useState<"stock" | "cash" | "summary">("stock");
  const [closingStockCounts, setClosingStockCounts] = useState<Record<string, number>>({});
  const [stockSummary, setStockSummary] = useState<any[]>([]);
  const [countedCash, setCountedCash] = useState<string>("");
  const [expectedCashForClose, setExpectedCashForClose] = useState<number>(0);
  const [isClosingSubmitting, setIsClosingSubmitting] = useState(false);

  // Focus ref for search
  const saleSearchInputRef = useRef<HTMLInputElement>(null);

  // Sync activeTab with Sidebar link URL parameter (?tab=sale, ?tab=waste, etc.)
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get("tab") as string | null;

  useEffect(() => {
    if (tabFromUrl && ["home", "sale", "waste", "stock", "activity"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (!tabFromUrl) {
      setActiveTab("home");
    }
  }, [tabFromUrl]);

  // Offline queue
  const isOnline = useOfflineStore((s) => s.isOnline);
  const enqueueAction = useOfflineStore((s) => s.enqueueAction);

  useEffect(() => {
    setProductList(products);
    const init: Record<string, number> = {};
    products.forEach((p) => {
      init[p.id] = p.expectedOpeningQty ?? p.currentStock ?? 0;
    });
    setOpeningCounts(init);
  }, [products]);

  const isOpeningDone = !!shift?.openingCountCompleted;

  // Auto focus search input when entering Sale tab
  useEffect(() => {
    if (activeTab === "sale" && isOpeningDone) {
      setTimeout(() => saleSearchInputRef.current?.focus(), 150);
    }
  }, [activeTab, isOpeningDone]);

  // Refresh active shift & activity data from server
  const refreshDashboardData = async () => {
    try {
      const shiftRes = await getActiveShiftAction();
      if (shiftRes.activeShift) {
        setShift(shiftRes.activeShift);
      }
      if (shiftRes.products) {
        setProductList(shiftRes.products);
      }
      const actRes = await getMyShiftActivityAction();
      if (actRes.activities) {
        setActivities(actRes.activities);
      }
    } catch (e) {
      console.error("Error refreshing dashboard data:", e);
    }
  };

  // Search Customers for credit sale
  useEffect(() => {
    if (paymentType !== "credit" || !customerSearch.trim()) {
      setCustomerResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await searchCustomersAction(customerSearch);
      if (res.customers) setCustomerResults(res.customers);
    }, 200);
    return () => clearTimeout(timer);
  }, [customerSearch, paymentType]);

  // Handle Tab Click with Locked Check
  const handleTabClick = (tab: string) => {
    if ((tab === "sale" || tab === "waste") && !isOpeningDone) {
      toast.error("Count Stock First", "You must count today's opening stock before logging sales or waste.");
      setActiveTab("stock");
      setStockSubTab("count");
      return;
    }
    setActiveTab(tab);
  };

  // Cart Helper Methods
  const getCartQty = (productId: string) => {
    return cart.find((item) => item.productId === productId)?.quantity || 0;
  };

  const setCartQty = (productId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.productId !== productId);
      }
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
      }
      return [...prev, { productId, quantity }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    const current = getCartQty(productId);
    setCartQty(productId, current + delta);
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => {
    const p = productList.find((prod) => prod.id === item.productId);
    return sum + (p ? p.sellingPrice * item.quantity : 0);
  }, 0);

  const cartTotalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Submit Opening Stock Count
  const handleOpeningCountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpeningSubmitting(true);
    try {
      const res = await submitOpeningStockCountAction(openingCounts);
      if (res.error) {
        toast.error("Failed to Submit", res.error);
      } else {
        toast.success("Opening Stock Confirmed", "Your shift is active! You can now log sales and changes.");
        await refreshDashboardData();
        setActiveTab("home");
      }
    } finally {
      setIsOpeningSubmitting(false);
    }
  };

  // Submit Sale
  const handleSaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return toast.error("Cart Empty", "Please add at least one product to the order.");
    if (paymentType === "credit" && !selectedCustomer && !newCustName.trim()) {
      return toast.error("Customer Required", "Credit sales require selecting or adding a customer.");
    }

    setIsSaleSubmitting(true);
    try {
      const payload = {
        items: cart,
        paymentType,
        customerId: selectedCustomer?.id,
        newCustomer: newCustName.trim() ? { name: newCustName.trim(), phone: newCustPhone.trim() } : undefined,
      };

      if (!isOnline) {
        enqueueAction("sale", payload);
        toast.info("Queued Offline", "Order saved locally. Will sync when back online.");
        clearCart();
        setSelectedCustomer(null);
        setCustomerSearch("");
        setNewCustName("");
        setNewCustPhone("");
        setShowAddCustomer(false);
        setActiveTab("home");
        return;
      }

      const res = await logSaleAction(payload);
      if (res.error) {
        toast.error("Sale Failed", res.error);
      } else {
        setSaleSuccess(true);
        toast.success("Order Complete!", `Logged sale worth ${currencySymbol}${cartTotal.toLocaleString()}`);
        setTimeout(async () => {
          clearCart();
          setSelectedCustomer(null);
          setCustomerSearch("");
          setNewCustName("");
          setNewCustPhone("");
          setShowAddCustomer(false);
          setSaleSuccess(false);
          await refreshDashboardData();
          setActiveTab("home");
        }, 600);
      }
    } finally {
      setIsSaleSubmitting(false);
    }
  };

  // Submit Waste
  const handleWasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteProductId) return toast.error("Product Required", "Please select a product.");
    if (wasteQty <= 0) return toast.error("Invalid Quantity", "Quantity must be greater than 0.");

    setIsWasteSubmitting(true);
    try {
      const payload = { productId: wasteProductId, quantity: wasteQty, reason: wasteReason };

      if (!isOnline) {
        enqueueAction("waste", payload);
        toast.info("Queued Offline", "Waste logged locally. Will sync when back online.");
        setWasteProductId("");
        setWasteQty(1);
        setActiveTab("home");
        return;
      }

      const res = await logWasteAction(payload);
      if (res.error) {
        toast.error("Waste Failed", res.error);
      } else {
        setWasteSuccess(true);
        const prod = productList.find((p) => p.id === wasteProductId);
        toast.success("Waste Logged", `${wasteQty} ${prod?.unit || "unit"}(s) recorded as waste.`);
        setTimeout(async () => {
          setWasteProductId("");
          setWasteQty(1);
          setWasteSuccess(false);
          await refreshDashboardData();
          setActiveTab("home");
        }, 600);
      }
    } finally {
      setIsWasteSubmitting(false);
    }
  };

  // Submit Restock
  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProductId) return toast.error("Product Required", "Please select a product.");
    if (restockQty <= 0) return toast.error("Invalid Quantity", "Quantity must be greater than 0.");

    setIsRestockSubmitting(true);
    try {
      const payload = { productId: restockProductId, quantity: restockQty };

      if (!isOnline) {
        enqueueAction("restock", payload);
        toast.info("Queued Offline", "Restock logged locally. Will sync when back online.");
        setRestockProductId("");
        setRestockQty(1);
        return;
      }

      const res = await logRestockAction(payload);
      if (res.error) {
        toast.error("Restock Failed", res.error);
      } else {
        const prod = productList.find((p) => p.id === restockProductId);
        toast.success("Restock Added", `${restockQty} ${prod?.unit || "unit"}(s) added to inventory.`);
        setRestockProductId("");
        setRestockQty(1);
        await refreshDashboardData();
        setStockSubTab("count");
      }
    } finally {
      setIsRestockSubmitting(false);
    }
  };

  // Open Shift Closure Takeover Flow
  const handleOpenCloseShift = async () => {
    const res = await getShiftStockSummaryAction();
    if (res.error) {
      toast.error("Error", res.error);
      return;
    }
    setStockSummary(res.shiftStockSummary || []);
    setExpectedCashForClose(res.expectedCash || 0);

    const initialClose: Record<string, number> = {};
    (res.shiftStockSummary || []).forEach((item: any) => {
      initialClose[item.productId] = item.calculatedClosingQty;
    });
    setClosingStockCounts(initialClose);
    setCloseStep("stock");
    setIsCloseShiftOpen(true);
  };

  // Submit Final Shift Closure
  const handleFinalCloseShift = async () => {
    const countedCashNum = parseInt(countedCash, 10) || 0;
    setIsClosingSubmitting(true);
    try {
      const res = await closeShiftAction({
        stockCounts: closingStockCounts,
        countedCash: countedCashNum,
      });

      if (res.error) {
        toast.error("Close Shift Failed", res.error);
      } else {
        toast.success(
          "Shift Closed Successfully",
          `Cash Variance: ${currencySymbol}${(res.cashVariance || 0).toLocaleString()}`
        );
        setIsCloseShiftOpen(false);
        setShift(null);
        setActiveTab("home");
      }
    } finally {
      setIsClosingSubmitting(false);
    }
  };

  // Filtered Products for Log Sale
  const filteredSaleProducts = productList.filter((p) =>
    p.name.toLowerCase().includes(saleSearch.toLowerCase())
  );

  // Filtered Products for Log Waste
  const filteredWasteProducts = productList.filter((p) =>
    p.name.toLowerCase().includes(wasteSearch.toLowerCase())
  );

  // Opening Count Progress
  const totalOpeningProducts = productList.length;
  const countedOpeningCount = Object.keys(openingCounts).length;
  const openingProgressPercent = totalOpeningProducts > 0 
    ? Math.round((countedOpeningCount / totalOpeningProducts) * 100) 
    : 100;

  const totalUnitsSold = shift?.totalUnitsSold || 0;
  const breakdownList = shift?.productSalesBreakdown || [];

  const currentHour = new Date().getHours();
  const greeting = 
    currentHour < 12 ? "Good morning" : 
    currentHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-brand selection:text-white">
      {/* Full Responsive Dashboard Container (Matching Owner Dashboard) */}
      <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-8 space-y-6 pb-24 md:pb-12 min-h-screen">

        {/* TOP DASHBOARD HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-heading text-text-primary ">
                {greeting}, {staffName}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/20">
                Staff Shift
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              {shopCode ? `Shop: ${shopCode} · ` : ""}Manage sales, log waste, and perform stock count reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 border ${
              isOnline ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? "Online" : "Offline Queue"}
            </span>

            {shift && (
              <button
                onClick={handleOpenCloseShift}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-xs font-bold rounded-xl border border-rose-500/20 transition-all min-h-[40px] flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Close Shift
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* SHIFT KPI METRICS (Matching Owner Dashboard 4-card KPI grid) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-[1rem] border border-border/50 bg-background p-3.5 sm:p-5 shadow-xs space-y-1">
            <span className="text-xs font-medium text-text-muted block truncate">Shift Revenue</span>
            <p className="text-lg sm:text-[24px] font-bold text-brand tracking-tight tabular-nums">
              {currencySymbol}{(shift?.totalSalesAmount || 0).toLocaleString()}
            </p>
            <span className="text-[10px] sm:text-[11px] text-text-muted block truncate">Live shift sales</span>
          </div>

          <div className="rounded-[1rem] border border-border/50 bg-background p-3.5 sm:p-5 shadow-xs space-y-1">
            <span className="text-xs font-medium text-text-muted block truncate">Units Sold</span>
            <p className="text-lg sm:text-[24px] font-bold text-emerald-600 tracking-tight tabular-nums">
              {totalUnitsSold} items
            </p>
            <span className="text-[10px] sm:text-[11px] text-text-muted block truncate">Across catalog</span>
          </div>

          <div className="rounded-[1rem] border border-border/50 bg-background p-3.5 sm:p-5 shadow-xs space-y-1">
            <span className="text-xs font-medium text-text-muted block truncate">Expected Cash Drawer</span>
            <p className="text-lg sm:text-[24px] font-bold text-text-primary tracking-tight tabular-nums">
              {currencySymbol}{(shift?.expectedCash || 0).toLocaleString()}
            </p>
            <span className="text-[10px] sm:text-[11px] text-text-muted block truncate">Float + cash sales</span>
          </div>

          <div className="rounded-[1rem] border border-border/50 bg-background p-3.5 sm:p-5 shadow-xs space-y-1">
            <span className="text-xs font-medium text-text-muted block truncate">Catalog Products</span>
            <p className="text-lg sm:text-[24px] font-bold text-indigo-600 tracking-tight tabular-nums">
              {productList.length} items
            </p>
            <span className="text-[10px] sm:text-[11px] text-text-muted block truncate">Available stock</span>
          </div>
        </div>

        {/* MAIN DASHBOARD CONTENT */}
        <main className="space-y-6">

          {/* ==================================================================== */}
          {/* TAB 1: HOME PAGE */}
          {/* ==================================================================== */}
          {activeTab === "home" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* LEFT 2 COLUMNS: PRIMARY SHIFT ACTIONS */}
                <div className="lg:col-span-2 space-y-5">

              {/* PERSISTENT OPENING STOCK COUNT BANNER IF PENDING */}
              {(!shift || !isOpeningDone) && (
                <div 
                  className="rounded-2xl p-5 text-white space-y-3 shadow-md border border-brand/20 animate-pulse"
                  style={{ backgroundImage: 'var(--brand-gradient)' }}
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-200">Shift Action Required</span>
                  </div>
                  <h3 className="text-lg font-bold font-heading leading-snug">
                    Count today's stock to start your shift
                  </h3>
                  <p className="text-xs text-white/90 leading-relaxed font-medium">
                    Sales and waste logging are disabled until your physical shelf stock count is confirmed.
                  </p>
                  <button
                    onClick={() => { setActiveTab("stock"); setStockSubTab("count"); }}
                    className="w-full py-3 bg-white text-brand font-bold text-xs rounded-xl shadow-sm hover:bg-white/90 transition-all flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    Count Shelf Stock Now <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* PRIMARY ACTION BUTTON: LOG A SALE (THUMB-ZONE PLACEMENT) */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => handleTabClick("sale")}
                  className={`w-full py-4 px-5 rounded-2xl text-white font-bold text-base shadow-lg transition-all transform active:scale-98 flex items-center justify-between min-h-[56px] ${
                    isOpeningDone 
                      ? "hover:opacity-95 shadow-brand/20 cursor-pointer" 
                      : "opacity-60 cursor-not-allowed"
                  }`}
                  style={{ backgroundImage: isOpeningDone ? 'var(--brand-gradient)' : undefined, backgroundColor: !isOpeningDone ? '#5B6764' : undefined }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block leading-tight font-heading">Log a Sale</span>
                      <span className="text-xs text-white/80 font-normal">Quick product checkout</span>
                    </div>
                  </div>
                  {!isOpeningDone ? <Lock className="w-5 h-5 text-amber-300" /> : <ChevronRight className="w-5 h-5 text-white/80" />}
                </button>

                {/* SECONDARY ACTIONS UNDERNEATH */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleTabClick("waste")}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all min-h-[48px] ${
                      isOpeningDone
                        ? "bg-surface border-border hover:border-rose-500/40 text-text-primary"
                        : "bg-surface/50 border-border/50 text-text-muted opacity-60"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Log Waste</span>
                      <span className="text-[10px] text-text-muted block">Record spoilage</span>
                    </div>
                  </button>

                  <button
                    onClick={() => { setActiveTab("stock"); setStockSubTab("restock"); }}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all min-h-[48px] ${
                      isOpeningDone
                        ? "bg-surface border-border hover:border-emerald-500/40 text-text-primary"
                        : "bg-surface/50 border-border/50 text-text-muted opacity-60"
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                      <PackagePlus className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block">Log Restock</span>
                      <span className="text-[10px] text-text-muted block">Add inventory</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT 1 COLUMN: SHIFT AUDIT & RECENT ACTIVITY */}
            <div className="space-y-5">
                  {/* Shift Status Box */}
                  <div className="bg-surface rounded-2xl p-5 border border-border space-y-3 shadow-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${shift && isOpeningDone ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
                      <h3 className="text-sm font-bold font-heading text-text-primary">
                        {shift ? "Active Shift Status" : "Shift Not Started"}
                      </h3>
                    </div>
                    <div className="text-xs space-y-2 text-text-muted border-t border-border/50 pt-3">
                      <div className="flex justify-between">
                        <span>Started at:</span>
                        <span className="font-semibold text-text-primary">
                          {shift ? new Date(shift.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Pending"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Opening Float:</span>
                        <span className="font-semibold text-text-primary">
                          {currencySymbol}{(shift?.openingFloat || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stock Count Status:</span>
                        <span className={`font-semibold ${isOpeningDone ? "text-emerald-600" : "text-amber-600"}`}>
                          {isOpeningDone ? "Confirmed" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RECENT SHIFT ACTIVITY PREVIEW */}
                  <div className="bg-surface rounded-2xl p-4 border border-border space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Shift Activity</h3>
                      <button onClick={() => setActiveTab("activity")} className="text-xs text-brand font-semibold hover:underline">
                        View all ({activities.length})
                      </button>
                    </div>

                    {activities.length === 0 ? (
                      <p className="text-xs text-text-muted py-4 text-center">No activity recorded yet today.</p>
                    ) : (
                      <div className="divide-y divide-border/50">
                        {activities.slice(0, 5).map((act) => (
                          <div key={act.id} className="py-2.5 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-1.5 rounded-lg shrink-0 ${
                                act.type === "sale" ? "bg-emerald-500/10 text-emerald-600" :
                                act.type === "waste" ? "bg-rose-500/10 text-rose-600" :
                                act.type === "restock" ? "bg-indigo-500/10 text-indigo-600" : "bg-amber-500/10 text-amber-600"
                              }`}>
                                {act.type === "sale" ? <ShoppingBag className="w-3.5 h-3.5" /> :
                                 act.type === "waste" ? <Trash2 className="w-3.5 h-3.5" /> :
                                 act.type === "restock" ? <PackagePlus className="w-3.5 h-3.5" /> : <BarChart3 className="w-3.5 h-3.5" />}
                              </div>
                              <div className="truncate">
                                <p className="font-semibold text-text-primary truncate">{act.title}</p>
                                <p className="text-[10px] text-text-muted truncate">{act.detail}</p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              {act.amount !== null && (
                                <p className="font-bold text-text-primary">{currencySymbol}{act.amount.toLocaleString()}</p>
                              )}
                              <span className="text-[10px] text-text-muted block">
                                {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 2: LOG A SALE (SEARCH-FIRST CONTINUOUS FLOW) */}
          {/* ==================================================================== */}
          {activeTab === "sale" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-border/50 pb-3">
                <div>
                  <h2 className="text-lg font-bold font-heading text-text-primary">Log a Sale / POS Checkout</h2>
                  <p className="text-xs text-text-muted">Search catalog products, build customer order, and process checkout</p>
                </div>
                {cart.length > 0 && (
                  <button onClick={clearCart} className="text-xs font-semibold text-rose-600 hover:underline">
                    Clear Order ({cartTotalItemsCount})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* LEFT 2 COLUMNS: SEARCH & PRODUCT LIST */}
                <div className="lg:col-span-2 space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      ref={saleSearchInputRef}
                      type="text"
                      placeholder="Search product by name..."
                      value={saleSearch}
                      onChange={(e) => setSaleSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-border bg-surface rounded-2xl text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand min-h-[48px]"
                    />
                    {saleSearch && (
                      <button 
                        onClick={() => setSaleSearch("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Scrollable Product Grid */}
                  <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-0.5">
                    {filteredSaleProducts.length === 0 ? (
                      <div className="py-10 text-center space-y-2 bg-surface rounded-2xl border border-border p-4">
                        <Package className="w-8 h-8 text-text-muted/40 mx-auto" />
                        <p className="text-xs font-semibold text-text-muted">No products found matching "{saleSearch}"</p>
                      </div>
                    ) : (
                      filteredSaleProducts.map((prod) => {
                        const inCartQty = getCartQty(prod.id);
                        const isLowStock = prod.lowStockThreshold !== null && prod.currentStock <= prod.lowStockThreshold;

                        return (
                          <div
                            key={prod.id}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between min-h-[56px] ${
                              inCartQty > 0 
                                ? "bg-brand/5 border-brand/40 shadow-xs" 
                                : "bg-surface border-border hover:border-brand/30"
                            }`}
                          >
                            <div className="space-y-1 min-w-0 flex-1 pr-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-semibold text-text-primary truncate">{prod.name}</h4>
                                {isLowStock && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                    Low Stock ({prod.currentStock})
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-brand font-bold">
                                {currencySymbol}{prod.sellingPrice.toLocaleString()} <span className="text-[10px] text-text-muted font-normal">/ {prod.unit}</span>
                              </p>
                            </div>

                            {/* Stepper (+/-) or Add button */}
                            <div>
                              {inCartQty > 0 ? (
                                <div className="flex items-center gap-1 bg-background p-1 rounded-xl border border-brand/30">
                                  <button
                                    type="button"
                                    onClick={() => updateCartQty(prod.id, -1)}
                                    className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center font-bold text-text-primary active:scale-95 transition-transform"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="w-7 text-center text-xs font-bold text-brand">{inCartQty}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateCartQty(prod.id, 1)}
                                    className="w-9 h-9 rounded-lg bg-brand text-white flex items-center justify-center font-bold active:scale-95 transition-transform"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setCartQty(prod.id, 1)}
                                  className="px-4 py-2 bg-brand/10 hover:bg-brand text-brand hover:text-white border border-brand/20 font-bold text-xs rounded-xl transition-all flex items-center gap-1 min-h-[40px] active:scale-95"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* RIGHT 1 COLUMN: ACTIVE ORDER CHECKOUT PANEL */}
                <div className="space-y-4">
                  <div className="bg-surface rounded-2xl p-5 border border-border space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-border/50 pb-3">
                      <h3 className="text-sm font-bold font-heading text-text-primary">Current Order Summary</h3>
                      <span className="text-xs font-semibold text-text-muted">{cartTotalItemsCount} item(s)</span>
                    </div>

                    {cart.length === 0 ? (
                      <p className="text-xs text-text-muted py-6 text-center">Your order cart is empty. Add products from the catalog to proceed.</p>
                    ) : (
                      <div className="space-y-4">
                        {/* Cart items list */}
                        <div className="divide-y divide-border/40 max-h-48 overflow-y-auto pr-1">
                          {cart.map((item) => {
                            const p = productList.find((prod) => prod.id === item.productId);
                            if (!p) return null;
                            return (
                              <div key={item.productId} className="py-2 flex items-center justify-between text-xs">
                                <span className="font-semibold text-text-primary truncate max-w-[140px]">{p.name} × {item.quantity}</span>
                                <span className="font-bold text-text-primary">{currencySymbol}{(p.sellingPrice * item.quantity).toLocaleString()}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Order Total */}
                        <div className="p-3 bg-background rounded-xl border border-border/80 flex items-center justify-between">
                          <span className="text-xs font-bold text-text-muted">Total Amount Due</span>
                          <span className="text-xl font-bold font-heading text-brand">{currencySymbol}{cartTotal.toLocaleString()}</span>
                        </div>

                        {/* Payment Type Selection */}
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-text-primary uppercase tracking-wider block">Payment Type</span>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setPaymentType("paid")}
                              className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
                                paymentType === "paid"
                                  ? "bg-brand text-white border-brand shadow-xs"
                                  : "bg-background text-text-muted border-border hover:text-text-primary"
                              }`}
                            >
                              <Coins className="w-3.5 h-3.5" /> Cash / Transfer
                            </button>

                            <button
                              type="button"
                              onClick={() => setPaymentType("credit")}
                              className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition-all min-h-[44px] flex items-center justify-center gap-1.5 ${
                                paymentType === "credit"
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                                  : "bg-background text-text-muted border-border hover:text-text-primary"
                              }`}
                            >
                              <UserPlus className="w-3.5 h-3.5" /> Credit Customer
                            </button>
                          </div>

                          {/* Customer Debt Selector */}
                          {paymentType === "credit" && (
                            <div className="p-3 bg-background rounded-xl border border-indigo-500/30 space-y-2.5 animate-in fade-in duration-150">
                              <span className="text-xs font-semibold text-text-primary block">Customer Account</span>
                              {!showAddCustomer ? (
                                <div className="space-y-2">
                                  <input
                                    type="text"
                                    placeholder="Search customer name..."
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                    className="w-full px-3 py-2 border border-border bg-surface rounded-xl text-xs text-text-primary focus:outline-none min-h-[38px]"
                                  />
                                  {selectedCustomer && (
                                    <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between text-xs text-indigo-700 font-semibold">
                                      <span>{selectedCustomer.name}</span>
                                      <button type="button" onClick={() => setSelectedCustomer(null)}>
                                        <X className="w-3.5 h-3.5 text-indigo-700" />
                                      </button>
                                    </div>
                                  )}
                                  {customerResults.length > 0 && !selectedCustomer && (
                                    <div className="divide-y divide-border/50 border border-border rounded-xl bg-surface max-h-32 overflow-y-auto">
                                      {customerResults.map((c) => (
                                        <button
                                          key={c.id}
                                          type="button"
                                          onClick={() => { setSelectedCustomer(c); setCustomerResults([]); }}
                                          className="w-full p-2 text-left text-xs hover:bg-border/30 flex items-center justify-between"
                                        >
                                          <span className="font-semibold text-text-primary">{c.name}</span>
                                          <span className="text-text-muted">Owes {currencySymbol}{c.balanceOwed?.toLocaleString() || 0}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => setShowAddCustomer(true)}
                                    className="text-[11px] font-semibold text-indigo-600 hover:underline block"
                                  >
                                    + Add New Customer
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-text-primary">New Customer</span>
                                    <button type="button" onClick={() => setShowAddCustomer(false)} className="text-xs text-text-muted hover:underline">
                                      Cancel
                                    </button>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={newCustName}
                                    onChange={(e) => setNewCustName(e.target.value)}
                                    className="w-full px-3 py-1.5 border border-border bg-surface rounded-xl text-xs text-text-primary min-h-[36px]"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Phone (optional)"
                                    value={newCustPhone}
                                    onChange={(e) => setNewCustPhone(e.target.value)}
                                    className="w-full px-3 py-1.5 border border-border bg-surface rounded-xl text-xs text-text-primary min-h-[36px]"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Complete Order Button */}
                        <form onSubmit={handleSaleSubmit}>
                          <button
                            type="submit"
                            disabled={isSaleSubmitting}
                            className="w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px] active:scale-98 disabled:opacity-50"
                            style={{ backgroundImage: saleSuccess ? undefined : 'var(--brand-gradient)', backgroundColor: saleSuccess ? '#059669' : undefined }}
                          >
                            {saleSuccess ? (
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 animate-bounce text-white" /> Order Logged!
                              </span>
                            ) : isSaleSubmitting ? (
                              "Processing..."
                            ) : (
                              "Complete Order →"
                            )}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 3: LOG WASTE */}
          {/* ==================================================================== */}
          {activeTab === "waste" && (
            <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-lg font-bold font-heading text-text-primary">Log Waste & Spoilage</h2>
                <p className="text-xs text-text-muted">Record unsellable, damaged, or expired items</p>
              </div>

              <form onSubmit={handleWasteSubmit} className="bg-surface p-5 sm:p-6 rounded-2xl border border-border space-y-4 shadow-xs">
                {/* Product Search & Select */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">1. Select Product</label>
                  <input
                    type="text"
                    placeholder="Search product..."
                    value={wasteSearch}
                    onChange={(e) => setWasteSearch(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-border bg-background rounded-xl text-xs font-medium text-text-primary min-h-[44px]"
                  />
                  <select
                    value={wasteProductId}
                    onChange={(e) => setWasteProductId(e.target.value)}
                    className="w-full px-3.5 py-3 border border-border bg-background rounded-xl text-xs font-semibold text-text-primary min-h-[48px] focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="">-- Choose Product --</option>
                    {filteredWasteProducts.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.currentStock} in stock)</option>
                    ))}
                  </select>
                </div>

                {/* Reason Tappable Chips */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">2. Reason for Waste</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "Expired", label: "Expired / Spoiled", icon: "🥀" },
                      { id: "Damaged", label: "Damaged / Broken", icon: "📦" },
                      { id: "Overproduction", label: "Overproduction", icon: "🍞" },
                      { id: "Other", label: "Other / Error", icon: "📝" }
                    ].map((reason) => (
                      <button
                        key={reason.id}
                        type="button"
                        onClick={() => setWasteReason(reason.id)}
                        className={`p-3 rounded-xl border text-xs font-bold transition-all min-h-[48px] flex items-center justify-center gap-2 ${
                          wasteReason === reason.id
                            ? "bg-rose-600 text-white border-rose-600 shadow-xs"
                            : "bg-background text-text-muted border-border hover:text-text-primary"
                        }`}
                      >
                        <span>{reason.icon}</span>
                        <span>{reason.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">3. Wasted Quantity</label>
                  <div className="flex items-center gap-3 bg-background p-2 rounded-2xl border border-border justify-between">
                    <button
                      type="button"
                      onClick={() => setWasteQty((q) => Math.max(1, q - 1))}
                      className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center font-bold text-text-primary active:scale-95 transition-transform"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="text-xl font-bold text-rose-600 font-heading">{wasteQty}</span>
                    <button
                      type="button"
                      onClick={() => setWasteQty((q) => q + 1)}
                      className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold active:scale-95 transition-transform"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isWasteSubmitting || !wasteProductId}
                  className={`w-full py-4 text-white font-bold text-sm rounded-2xl shadow-md transition-all min-h-[52px] active:scale-98 disabled:opacity-50 ${
                    wasteSuccess ? "bg-emerald-600" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {wasteSuccess ? (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5 animate-bounce" /> Waste Logged!
                    </span>
                  ) : isWasteSubmitting ? (
                    "Logging Waste..."
                  ) : (
                    "Confirm & Log Waste Item →"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 4: STOCK COUNT & RESTOCK */}
          {/* ==================================================================== */}
          {activeTab === "stock" && (
            <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200">
              
              {/* SUB TAB SWITCHER */}
              <div className="flex bg-surface p-1 rounded-2xl border border-border">
                <button
                  onClick={() => setStockSubTab("count")}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all min-h-[40px] ${
                    stockSubTab === "count"
                      ? "bg-brand text-white shadow-xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Physical Stock Count
                </button>
                <button
                  onClick={() => setStockSubTab("restock")}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all min-h-[40px] ${
                    stockSubTab === "restock"
                      ? "bg-brand text-white shadow-xs"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  Log Restock Delivery
                </button>
              </div>

              {/* STOCK SUB-TAB 1: PHYSICAL STOCK COUNT */}
              {stockSubTab === "count" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold font-heading text-text-primary">
                      {isOpeningDone ? "Shift Stock Record" : "Physical Stock Count"}
                    </h2>
                    <p className="text-xs text-text-muted">
                      {isOpeningDone 
                        ? "Opening counts recorded. Perform shift closing count at shift end."
                        : "Enter physical counted numbers for each item below."}
                    </p>
                  </div>

                  {!isOpeningDone ? (
                    <form onSubmit={handleOpeningCountSubmit} className="space-y-4">
                      {/* RUNNING PROGRESS INDICATOR BANNER */}
                      <div className="bg-surface p-3.5 rounded-2xl border border-border space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span className="text-text-primary">Counting Progress</span>
                          <span className="text-brand">{countedOpeningCount} of {totalOpeningProducts} counted ({openingProgressPercent}%)</span>
                        </div>
                        <div className="w-full h-2 bg-border/60 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-brand rounded-full transition-all duration-300"
                            style={{ width: `${openingProgressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* PRODUCT COUNT CARDS (HIDDEN LIVE VARIANCE) */}
                      <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-0.5">
                        {productList.map((prod) => {
                          const expected = prod.expectedOpeningQty ?? prod.currentStock;
                          const counted = openingCounts[prod.id] ?? expected;

                          return (
                            <div key={prod.id} className="p-3.5 bg-surface rounded-2xl border border-border space-y-2.5">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="text-sm font-bold text-text-primary">{prod.name}</h4>
                                  <p className="text-xs text-text-muted mt-0.5">
                                    Expected: <span className="font-bold text-text-primary">{expected} {prod.unit}(s)</span>
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setOpeningCounts({ ...openingCounts, [prod.id]: expected })}
                                  className="px-2.5 py-1 text-[11px] font-semibold text-brand bg-brand/10 hover:bg-brand/20 rounded-lg border border-brand/20"
                                >
                                  Match Expected
                                </button>
                              </div>

                              {/* STEPPER + NUMERIC INPUT */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setOpeningCounts({
                                    ...openingCounts,
                                    [prod.id]: Math.max(0, (openingCounts[prod.id] ?? expected) - 1)
                                  })}
                                  className="w-11 h-11 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-text-primary active:scale-95 transition-transform"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <input
                                  type="number"
                                  min="0"
                                  value={counted}
                                  onChange={(e) => setOpeningCounts({
                                    ...openingCounts,
                                    [prod.id]: Math.max(0, parseInt(e.target.value, 10) || 0)
                                  })}
                                  className="flex-1 py-2.5 border border-border bg-background rounded-xl text-base font-bold text-center text-text-primary focus:ring-2 focus:ring-brand min-h-[44px]"
                                />
                                <button
                                  type="button"
                                  onClick={() => setOpeningCounts({
                                    ...openingCounts,
                                    [prod.id]: (openingCounts[prod.id] ?? expected) + 1
                                  })}
                                  className="w-11 h-11 rounded-xl bg-brand text-white flex items-center justify-center font-bold active:scale-95 transition-transform"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* FIXED SUBMIT BUTTON */}
                      <button
                        type="submit"
                        disabled={isOpeningSubmitting}
                        className="w-full py-4 text-white font-bold text-sm rounded-2xl shadow-md transition-all min-h-[52px]"
                        style={{ backgroundImage: 'var(--brand-gradient)' }}
                      >
                        {isOpeningSubmitting ? "Confirming Count..." : "Confirm Opening Stock Count →"}
                      </button>
                    </form>
                  ) : (
                    <div className="bg-surface rounded-2xl p-6 border border-border text-center space-y-3">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                      <h3 className="text-base font-bold text-text-primary font-heading">Opening Count Complete</h3>
                      <p className="text-xs text-text-muted leading-relaxed">
                        Opening stock count has been recorded. End-of-shift closing count will be prompted during Shift Close.
                      </p>
                      <button
                        onClick={handleOpenCloseShift}
                        className="px-4 py-2.5 bg-rose-500/10 text-rose-600 font-semibold text-xs rounded-xl border border-rose-500/20"
                      >
                        Close Shift Now
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* STOCK SUB-TAB 2: LOG RESTOCK */}
              {stockSubTab === "restock" && (
                <form onSubmit={handleRestockSubmit} className="bg-surface p-5 sm:p-6 rounded-2xl border border-border space-y-4 shadow-xs">
                  <div className="space-y-1">
                    <h2 className="text-lg font-bold font-heading text-text-primary">Log Restock</h2>
                    <p className="text-xs text-text-muted">Record new inventory delivered to shop</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">Product</label>
                    <select
                      value={restockProductId}
                      onChange={(e) => setRestockProductId(e.target.value)}
                      className="w-full px-3.5 py-3 border border-border bg-background rounded-xl text-xs font-semibold text-text-primary min-h-[48px]"
                    >
                      <option value="">-- Choose Product --</option>
                      {productList.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.currentStock} in stock)</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">Quantity Delivered</label>
                    <div className="flex items-center gap-3 bg-background p-2 rounded-2xl border border-border justify-between">
                      <button
                        type="button"
                        onClick={() => setRestockQty((q) => Math.max(1, q - 1))}
                        className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center font-bold text-text-primary active:scale-95 transition-transform"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="text-xl font-bold text-emerald-600 font-heading">{restockQty}</span>
                      <button
                        type="button"
                        onClick={() => setRestockQty((q) => q + 1)}
                        className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold active:scale-95 transition-transform"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isRestockSubmitting || !restockProductId}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all min-h-[52px]"
                  >
                    {isRestockSubmitting ? "Adding Restock..." : "Add to Inventory →"}
                  </button>
                </form>
              )}

            </div>
          )}

          {/* ==================================================================== */}
          {/* TAB 5: ACTIVITY LOG */}
          {/* ==================================================================== */}
          {activeTab === "activity" && (
            <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in duration-200">
              <div className="space-y-1">
                <h2 className="text-lg font-bold font-heading text-text-primary">Shift Activity</h2>
                <p className="text-xs text-text-muted">Reverse-chronological event log for this shift</p>
              </div>

              <div className="bg-surface rounded-2xl p-4 border border-border space-y-3 shadow-xs">
                {activities.length === 0 ? (
                  <p className="text-xs text-text-muted py-8 text-center">No activity logged yet for this shift.</p>
                ) : (
                  <div className="divide-y divide-border/50">
                    {activities.map((act) => (
                      <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2 rounded-xl shrink-0 ${
                            act.type === "sale" ? "bg-emerald-500/10 text-emerald-600" :
                            act.type === "waste" ? "bg-rose-500/10 text-rose-600" :
                            act.type === "restock" ? "bg-indigo-500/10 text-indigo-600" : "bg-amber-500/10 text-amber-600"
                          }`}>
                            {act.type === "sale" ? <ShoppingBag className="w-4 h-4" /> :
                             act.type === "waste" ? <Trash2 className="w-4 h-4" /> :
                             act.type === "restock" ? <PackagePlus className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
                          </div>
                          <div className="truncate">
                            <p className="font-bold text-text-primary truncate">{act.title}</p>
                            <p className="text-[11px] text-text-muted truncate">{act.detail}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          {act.amount !== null && (
                            <p className="font-bold text-text-primary">{currencySymbol}{act.amount.toLocaleString()}</p>
                          )}
                          <span className="text-[10px] text-text-muted block">
                            {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </main>

        {/* ==================================================================== */}
        {/* FULL-SCREEN SHIFT CLOSURE TAKEOVER */}
        {/* ==================================================================== */}
        {isCloseShiftOpen && (
          <div className="fixed inset-0 z-50 bg-background overflow-y-auto flex flex-col p-4 sm:p-6 max-w-lg mx-auto animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider block">
                  {closeStep === "stock" ? "Step 1 of 2" : closeStep === "cash" ? "Step 2 of 2" : "Final Step"}
                </span>
                <h2 className="text-xl font-bold font-heading text-text-primary">
                  {closeStep === "stock" ? "Closing Stock Count" : closeStep === "cash" ? "Cash Drawer Reconciliation" : "Confirm Shift Closure"}
                </h2>
              </div>
              <button onClick={() => setIsCloseShiftOpen(false)} className="p-2 rounded-xl border border-border text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 py-4 space-y-4">
              {/* STEP 1: CLOSING STOCK COUNT */}
              {closeStep === "stock" && (
                <div className="space-y-4">
                  <p className="text-xs text-text-muted">Physically count remaining stock on shelf before closing.</p>

                  <div className="divide-y divide-border/50 bg-surface rounded-2xl border border-border max-h-[60vh] overflow-y-auto">
                    {stockSummary.map((item) => {
                      const counted = closingStockCounts[item.productId] ?? item.calculatedClosingQty;

                      return (
                        <div key={item.id} className="p-3.5 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-text-primary">{item.productName}</h4>
                              <p className="text-[11px] text-text-muted mt-0.5">
                                Expected: <span className="font-bold text-text-primary">{item.calculatedClosingQty} {item.unit}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setClosingStockCounts({
                                ...closingStockCounts,
                                [item.productId]: Math.max(0, counted - 1)
                              })}
                              className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-text-primary min-h-[40px]"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={counted}
                              onChange={(e) => setClosingStockCounts({
                                ...closingStockCounts,
                                [item.productId]: Math.max(0, parseInt(e.target.value, 10) || 0)
                              })}
                              className="w-20 py-2 border border-border bg-background rounded-xl text-center text-sm font-bold min-h-[40px]"
                            />
                            <button
                              type="button"
                              onClick={() => setClosingStockCounts({
                                ...closingStockCounts,
                                [item.productId]: counted + 1
                              })}
                              className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center font-bold text-text-primary min-h-[40px]"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setCloseStep("cash")}
                      className="w-full sm:w-auto px-6 py-3 bg-brand hover:opacity-90 text-white font-bold text-xs rounded-xl shadow-md transition-all min-h-[44px]"
                    >
                      Next: Cash Reconciliation →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: CASH DRAWER RECONCILIATION */}
              {closeStep === "cash" && (
                <div className="space-y-4">
                  <div className="bg-surface rounded-2xl p-4 border border-border space-y-2">
                    <span className="text-xs text-text-muted font-medium block">Calculated System Cash</span>
                    <p className="text-2xl font-bold font-heading text-brand">
                      {currencySymbol}{expectedCashForClose.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-text-muted">Opening float + total cash sales recorded today.</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-text-primary uppercase tracking-wider block">Physical Counted Cash in Drawer</label>
                    <input
                      type="number"
                      placeholder="Enter counted ₦ cash..."
                      value={countedCash}
                      onChange={(e) => setCountedCash(e.target.value)}
                      className="w-full p-4 border border-border bg-surface rounded-2xl text-lg font-bold text-text-primary focus:ring-2 focus:ring-brand min-h-[52px]"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setCloseStep("stock")}
                      className="w-1/3 py-3.5 border border-border bg-surface text-text-primary text-xs font-bold rounded-2xl min-h-[48px]"
                    >
                      ← Back
                    </button>

                    <button
                      type="button"
                      onClick={() => setCloseStep("summary")}
                      disabled={!countedCash}
                      className="w-2/3 py-3.5 text-white text-xs font-bold rounded-2xl shadow-md transition-all min-h-[48px] disabled:opacity-50"
                      style={{ backgroundImage: 'var(--brand-gradient)' }}
                    >
                      Review Final Summary →
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: FINAL RECONCILIATION SUMMARY & CONFIRMATION */}
              {closeStep === "summary" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-text-primary">Shift Reconciliation Overview</h3>
                    <p className="text-xs text-text-muted">Review surfaced variances before confirming shift closure.</p>
                  </div>

                  {/* Cash Variance Box */}
                  {(() => {
                    const countedNum = parseInt(countedCash, 10) || 0;
                    const cashVar = countedNum - expectedCashForClose;

                    return (
                      <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                        cashVar === 0 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700"
                          : "bg-rose-500/10 border-rose-500/30 text-rose-700"
                      }`}>
                        <div className="flex items-center gap-3">
                          {cashVar === 0 ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-rose-600" />}
                          <div>
                            <span className="text-xs font-bold block">Cash Drawer Variance</span>
                            <span className="text-[11px] opacity-80">Counted {currencySymbol}{countedNum.toLocaleString()} vs Expected {currencySymbol}{expectedCashForClose.toLocaleString()}</span>
                          </div>
                        </div>
                        <span className="text-base font-bold">
                          {cashVar >= 0 ? `+${currencySymbol}${cashVar.toLocaleString()}` : `-${currencySymbol}${Math.abs(cashVar).toLocaleString()}`}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Stock Variance List */}
                  <div className="bg-surface rounded-2xl p-4 border border-border space-y-3 max-h-52 overflow-y-auto">
                    <span className="text-xs font-bold text-text-muted uppercase tracking-wider block">Stock Variances</span>
                    <div className="divide-y divide-border/50">
                      {stockSummary.map((item) => {
                        const counted = closingStockCounts[item.productId] ?? item.calculatedClosingQty;
                        const variance = counted - item.calculatedClosingQty;

                        return (
                          <div key={item.id} className="py-2 flex items-center justify-between text-xs">
                            <span className="font-semibold text-text-primary">{item.productName}</span>
                            <div className="flex items-center gap-1.5 font-bold">
                              {variance === 0 ? (
                                <span className="text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> 0 variance
                                </span>
                              ) : (
                                <span className="text-rose-600 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" /> {variance > 0 ? `+${variance}` : variance} {item.unit}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCloseStep("cash")}
                      className="w-1/3 py-3.5 border border-border bg-surface text-text-primary text-xs font-bold rounded-2xl min-h-[48px]"
                    >
                      ← Edit
                    </button>

                    <button
                      type="button"
                      onClick={handleFinalCloseShift}
                      disabled={isClosingSubmitting}
                      className="w-2/3 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-lg transition-all min-h-[48px] disabled:opacity-50"
                    >
                      {isClosingSubmitting ? "Closing Shift..." : "Confirm & Close Shift"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
