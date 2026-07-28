"use client";

import { useState, useEffect } from "react";
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
  PanelLeftClose,
  PanelLeftOpen
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

type TabType = "overview" | "sale" | "waste" | "restock" | "stock-count" | "activity";

export function StaffDashboard({
  initialShift,
  products,
  initialActivities,
  currencySymbol = "₦",
  staffName = "Staff User",
  shopCode = ""
}: StaffDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [shift, setShift] = useState<ActiveShift | null>(initialShift);
  const [productList, setProductList] = useState<Product[]>(products);
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities);

  // Opening Stock Count State
  const [openingCounts, setOpeningCounts] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    products.forEach((p) => {
      init[p.id] = p.expectedOpeningQty ?? p.currentStock ?? 0;
    });
    return init;
  });
  const [isOpeningSubmitting, setIsOpeningSubmitting] = useState(false);

  // Multi-Item Cart Log Sale State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentType, setPaymentType] = useState<"paid" | "credit">("paid");
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [isSaleSubmitting, setIsSaleSubmitting] = useState(false);

  // Log Waste State
  const [wasteProductId, setWasteProductId] = useState<string>("");
  const [wasteQty, setWasteQty] = useState<number>(1);
  const [wasteReason, setWasteReason] = useState<string>("spoiled");
  const [isWasteSubmitting, setIsWasteSubmitting] = useState(false);

  // Log Restock State
  const [restockProductId, setRestockProductId] = useState<string>("");
  const [restockQty, setRestockQty] = useState<number>(1);
  const [isRestockSubmitting, setIsRestockSubmitting] = useState(false);

  // Shift Closure State
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [closeStep, setCloseStep] = useState<"stock" | "cash">("stock");
  const [closingStockCounts, setClosingStockCounts] = useState<Record<string, number>>({});
  const [stockSummary, setStockSummary] = useState<any[]>([]);
  const [countedCash, setCountedCash] = useState<string>("");
  const [expectedCashForClose, setExpectedCashForClose] = useState<number>(0);
  const [isClosingSubmitting, setIsClosingSubmitting] = useState(false);

  // Offline queue
  const isOnline = useOfflineStore((s) => s.isOnline);
  const queuedItems = useOfflineStore((s) => s.pendingQueue);
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

  // Cart Helper Methods
  const addToCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => {
    const p = productList.find((prod) => prod.id === item.productId);
    return sum + (p ? p.sellingPrice * item.quantity : 0);
  }, 0);

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
        setActiveTab("overview");
      }
    } finally {
      setIsOpeningSubmitting(false);
    }
  };

  // Submit Multi-Item Sale
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
        return;
      }

      const res = await logSaleAction(payload);
      if (res.error) {
        toast.error("Sale Failed", res.error);
      } else {
        toast.success("Order Complete!", `Logged sale worth ${currencySymbol}${cartTotal.toLocaleString()}`);
        clearCart();
        setSelectedCustomer(null);
        setCustomerSearch("");
        setNewCustName("");
        setNewCustPhone("");
        setShowAddCustomer(false);
        await refreshDashboardData();
        setActiveTab("overview");
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
        return;
      }

      const res = await logWasteAction(payload);
      if (res.error) {
        toast.error("Waste Failed", res.error);
      } else {
        const prod = productList.find((p) => p.id === wasteProductId);
        toast.success("Waste Logged", `${wasteQty} ${prod?.unit || "unit"}(s) recorded as waste.`);
        setWasteProductId("");
        setWasteQty(1);
        await refreshDashboardData();
        setActiveTab("overview");
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
        setActiveTab("overview");
      }
    } finally {
      setIsRestockSubmitting(false);
    }
  };

  // Open Shift Closure Flow
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
    setIsCloseShiftModalOpen(true);
  };

  // Submit Shift Closure
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
        setIsCloseShiftModalOpen(false);
        setShift(null);
        setActiveTab("overview");
      }
    } finally {
      setIsClosingSubmitting(false);
    }
  };

  const totalUnitsSold = shift?.totalUnitsSold || 0;
  const breakdownList = shift?.productSalesBreakdown || [];

  return (
    <div className="flex min-h-screen bg-background">
      {/* COLLAPSIBLE DESKTOP SIDEBAR NAVIGATION */}
      <aside 
        className={`${
          isCollapsed ? "w-20 p-3" : "w-64 p-5"
        } border-r border-border bg-surface flex flex-col justify-between sticky top-0 h-screen flex-shrink-0 transition-all duration-300 ease-in-out`}
      >
        <div className="space-y-6">
          {/* Brand Header with Collapse Toggle */}
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            {!isCollapsed ? (
              <div>
                <h1 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
                  Ledgr
                </h1>
                <p className="text-[11px] text-text-muted font-medium">Staff Workspace</p>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand font-bold font-heading text-lg flex items-center justify-center mx-auto">
                L
              </div>
            )}

            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg border border-border bg-background hover:bg-border/40 text-text-muted hover:text-text-primary transition-all"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab("overview")}
              title={isCollapsed ? "Dashboard Home" : undefined}
              className={`w-full flex items-center ${isCollapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5"} rounded-xl text-xs font-semibold transition-all ${
                activeTab === "overview"
                  ? "bg-brand text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary hover:bg-border/40"
              }`}
            >
              <Home className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Dashboard Home</span>}
            </button>

            <button
              onClick={() => setActiveTab("sale")}
              disabled={!isOpeningDone}
              title={isCollapsed ? "Log a Sale" : undefined}
              className={`w-full flex items-center ${isCollapsed ? "justify-center p-3" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-semibold transition-all relative ${
                activeTab === "sale"
                  ? "bg-brand text-white shadow-sm"
                  : isOpeningDone
                  ? "text-text-muted hover:text-text-primary hover:bg-border/40"
                  : "text-text-muted/40 cursor-not-allowed opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Log a Sale</span>}
              </div>
              {cart.length > 0 && (
                <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-white text-brand ${
                  isCollapsed ? "absolute -top-1 -right-1" : ""
                }`}>
                  {cart.length}
                </span>
              )}
              {!isOpeningDone && !isCollapsed && <Lock className="w-3 h-3 text-amber-500" />}
            </button>

            <button
              onClick={() => setActiveTab("waste")}
              disabled={!isOpeningDone}
              title={isCollapsed ? "Log Waste" : undefined}
              className={`w-full flex items-center ${isCollapsed ? "justify-center p-3" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-semibold transition-all relative ${
                activeTab === "waste"
                  ? "bg-brand text-white shadow-sm"
                  : isOpeningDone
                  ? "text-text-muted hover:text-text-primary hover:bg-border/40"
                  : "text-text-muted/40 cursor-not-allowed opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Log Waste</span>}
              </div>
              {!isOpeningDone && !isCollapsed && <Lock className="w-3 h-3 text-amber-500" />}
            </button>

            <button
              onClick={() => setActiveTab("restock")}
              disabled={!isOpeningDone}
              title={isCollapsed ? "Log Restock" : undefined}
              className={`w-full flex items-center ${isCollapsed ? "justify-center p-3" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-semibold transition-all relative ${
                activeTab === "restock"
                  ? "bg-brand text-white shadow-sm"
                  : isOpeningDone
                  ? "text-text-muted hover:text-text-primary hover:bg-border/40"
                  : "text-text-muted/40 cursor-not-allowed opacity-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <PackagePlus className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Log Restock</span>}
              </div>
              {!isOpeningDone && !isCollapsed && <Lock className="w-3 h-3 text-amber-500" />}
            </button>

            <button
              onClick={() => setActiveTab("stock-count")}
              title={isCollapsed ? "Stock Count" : undefined}
              className={`w-full flex items-center ${isCollapsed ? "justify-center p-3" : "justify-between px-3.5 py-2.5"} rounded-xl text-xs font-semibold transition-all relative ${
                activeTab === "stock-count"
                  ? "bg-brand text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary hover:bg-border/40"
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>Stock Count</span>}
              </div>
              {!isOpeningDone && (
                <span className={`w-2 h-2 rounded-full bg-amber-500 animate-pulse ${
                  isCollapsed ? "absolute top-1 right-1" : ""
                }`} />
              )}
            </button>

            <button
              onClick={() => setActiveTab("activity")}
              title={isCollapsed ? "Activity Log" : undefined}
              className={`w-full flex items-center ${isCollapsed ? "justify-center p-3" : "gap-3 px-3.5 py-2.5"} rounded-xl text-xs font-semibold transition-all ${
                activeTab === "activity"
                  ? "bg-brand text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary hover:bg-border/40"
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Activity Log</span>}
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-border/50 space-y-3">
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
                  {staffName.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-text-primary truncate">{staffName}</p>
                  <span className="text-[10px] text-text-muted block">Staff Account</span>
                </div>
              </div>
              <ThemeToggle />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs" title={staffName}>
                {staffName.charAt(0)}
              </div>
              <ThemeToggle />
            </div>
          )}

          <form action={async () => { await signOutAction(); }}>
            <button
              type="submit"
              title={isCollapsed ? "Sign Out" : undefined}
              className={`w-full flex items-center ${isCollapsed ? "justify-center p-2.5" : "justify-center gap-2 px-3 py-2"} text-xs font-semibold text-rose-600 hover:bg-rose-500/10 rounded-xl border border-rose-500/20 transition-colors`}
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </form>
        </div>
      </aside>

      {/* RIGHT MAIN PANEL */}
      <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl overflow-y-auto">
        {/* Top Header Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${shift ? "bg-brand/10 text-brand" : "bg-amber-500/10 text-amber-500"}`}>
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-text-primary">
                  {shift ? "Active Shift in Progress" : "No Shift Active"}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  shift && isOpeningDone ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                  shift ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-text-muted/10 text-text-muted"
                }`}>
                  {shift && isOpeningDone ? "Shift Active" : shift ? "Opening Count Required" : "Offline / Idle"}
                </span>
              </div>
              <p className="text-xs text-text-muted mt-0.5">
                {shift ? `Shift started ${new Date(shift.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Perform physical opening count to activate shift."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1.5 border ${
              isOnline ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              {isOnline ? "Online" : "Offline"}
            </span>

            {shift && (
              <button
                onClick={handleOpenCloseShift}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 text-xs font-semibold rounded-xl border border-rose-500/20 transition-colors"
              >
                End Shift & Close Out
              </button>
            )}
          </div>
        </div>

        {/* Persistent Opening Stock Count Banner on Home */}
        {(!shift || !isOpeningDone) && activeTab === "overview" && (
          <div 
            className="rounded-2xl p-6 text-white space-y-3 shadow-md border border-brand/20"
            style={{ backgroundImage: 'var(--brand-gradient)' }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold backdrop-blur">
                  <AlertTriangle className="w-3.5 h-3.5" /> Shift Action Required
                </span>
                <h3 className="text-xl font-bold text-white font-heading">
                  Count Today's Stock to Start Shift
                </h3>
                <p className="text-xs text-white/90 max-w-xl leading-relaxed font-medium">
                  Physically count the items currently on your shelf. Your count establishes the opening baseline to track sales, waste, and variances.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("stock-count")}
              className="px-5 py-2.5 bg-white text-brand font-semibold text-xs rounded-xl shadow-sm hover:bg-white/90 transition-all flex items-center gap-2"
            >
              Count Shelf Stock Now <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW / DASHBOARD HOME */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* 3 Summary Cards: Sales Amount, Items Sold Count, Expected Cash */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface rounded-2xl p-5 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-muted">Total Shift Sales</span>
                  <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-text-primary tracking-tight">
                  {currencySymbol}{(shift?.totalSalesAmount || 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-text-muted block">Includes Paid and Credit sales</span>
              </div>

              <div className="bg-surface rounded-2xl p-5 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-muted">Total Items Sold</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600">
                    <Package className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-emerald-600 tracking-tight">
                  {totalUnitsSold.toLocaleString()} <span className="text-sm font-normal text-text-muted">units</span>
                </p>
                <span className="text-[11px] text-text-muted block">Total items sold across all products</span>
              </div>

              <div className="bg-surface rounded-2xl p-5 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-text-muted">Expected Shift Cash</span>
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600">
                    <Coins className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-brand tracking-tight">
                  {currencySymbol}{(shift?.expectedCash || 0).toLocaleString()}
                </p>
                <span className="text-[11px] text-text-muted block">Sum of non-credit paid sales</span>
              </div>
            </div>

            {/* Quick Action Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab("sale")}
                disabled={!isOpeningDone}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all ${
                  isOpeningDone 
                    ? "bg-surface hover:bg-border/40 border-border text-text-primary hover:border-brand/40" 
                    : "bg-surface/50 border-border/50 text-text-muted opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="p-2.5 rounded-xl bg-brand/10 text-brand w-fit">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold block">Log a Sale</span>
                  <span className="text-[11px] text-text-muted">{isOpeningDone ? "Checkout item" : "Stock count required"}</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("waste")}
                disabled={!isOpeningDone}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all ${
                  isOpeningDone 
                    ? "bg-surface hover:bg-border/40 border-border text-text-primary hover:border-rose-500/40" 
                    : "bg-surface/50 border-border/50 text-text-muted opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 w-fit">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold block">Log Waste</span>
                  <span className="text-[11px] text-text-muted">{isOpeningDone ? "Record spoilage" : "Stock count required"}</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("restock")}
                disabled={!isOpeningDone}
                className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all ${
                  isOpeningDone 
                    ? "bg-surface hover:bg-border/40 border-border text-text-primary hover:border-emerald-500/40" 
                    : "bg-surface/50 border-border/50 text-text-muted opacity-60 cursor-not-allowed"
                }`}
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 w-fit">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold block">Log Restock</span>
                  <span className="text-[11px] text-text-muted">{isOpeningDone ? "Add delivery" : "Stock count required"}</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("stock-count")}
                className="p-5 rounded-2xl border bg-surface hover:bg-border/40 border-border text-text-primary hover:border-brand/40 text-left flex flex-col justify-between h-32 transition-all"
              >
                <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 w-fit">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold block">Stock Count</span>
                  <span className="text-[11px] text-text-muted">{isOpeningDone ? "Review count" : "Perform count"}</span>
                </div>
              </button>
            </div>

            {/* Per-Product Sales Breakdown ("Items Sold This Shift") */}
            <div className="bg-surface rounded-2xl p-6 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold font-heading text-text-primary">Items Sold This Shift</h3>
                  <p className="text-xs text-text-muted">Real-time summary of quantities sold per product.</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand/10 text-brand">
                  {totalUnitsSold} total units
                </span>
              </div>

              {breakdownList.length === 0 || breakdownList.every(b => b.soldQty === 0) ? (
                <div className="py-8 text-center space-y-2 border border-dashed border-border/70 rounded-xl bg-background">
                  <ShoppingBag className="w-8 h-8 text-text-muted/40 mx-auto" />
                  <p className="text-xs font-semibold text-text-muted">No sales recorded yet for this shift.</p>
                  <p className="text-[11px] text-text-muted">As you log sales, product quantities will update here automatically.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50 border border-border/60 rounded-xl bg-background overflow-hidden">
                  <div className="p-3 bg-surface border-b border-border text-[11px] font-bold text-text-muted grid grid-cols-12 gap-2 uppercase tracking-wider">
                    <span className="col-span-5">Product</span>
                    <span className="col-span-3 text-center">Units Sold</span>
                    <span className="col-span-2 text-right">Revenue</span>
                    <span className="col-span-2 text-right">Remaining Stock</span>
                  </div>
                  {breakdownList.map((b) => (
                    <div key={b.productId} className="p-3 grid grid-cols-12 gap-2 items-center text-xs">
                      <div className="col-span-5">
                        <p className="font-semibold text-text-primary">{b.productName}</p>
                        <p className="text-[11px] text-text-muted">{currencySymbol}{b.sellingPrice.toLocaleString()} / {b.unit}</p>
                      </div>
                      <div className="col-span-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          b.soldQty > 0 ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-text-muted/10 text-text-muted"
                        }`}>
                          {b.soldQty} {b.unit}(s)
                        </span>
                      </div>
                      <div className="col-span-2 text-right font-bold text-text-primary">
                        {currencySymbol}{b.totalRevenue.toLocaleString()}
                      </div>
                      <div className="col-span-2 text-right text-xs font-semibold text-text-muted">
                        {b.currentStock} {b.unit}(s)
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Shift Activity Table Preview */}
            <div className="bg-surface rounded-2xl p-6 border border-border space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">Shift Activity Log</h3>
                <button onClick={() => setActiveTab("activity")} className="text-xs text-brand font-medium hover:underline">
                  View all ({activities.length})
                </button>
              </div>

              {activities.length === 0 ? (
                <p className="text-xs text-text-muted py-6 text-center">No activity recorded yet for this shift.</p>
              ) : (
                <div className="divide-y divide-border/50">
                  {activities.slice(0, 6).map((act) => (
                    <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-text-primary">{act.title}</p>
                        <p className="text-text-muted text-[11px] mt-0.5">{act.detail}</p>
                      </div>
                      <div className="text-right">
                        {act.amount !== null && (
                          <p className="font-bold text-text-primary">{currencySymbol}{act.amount.toLocaleString()}</p>
                        )}
                        <span className="text-text-muted text-[10px]">
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

        {/* TAB 2: STOCK COUNT */}
        {activeTab === "stock-count" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-heading text-text-primary">
                {isOpeningDone ? "Shift Opening Stock Record" : "Physical Opening Stock Count"}
              </h2>
              <p className="text-xs text-text-muted">
                {isOpeningDone 
                  ? "Opening stock baseline has been established for this shift." 
                  : "Count physical shelf stock before logging sales or stock events."}
              </p>
            </div>

            {!isOpeningDone ? (
              <form onSubmit={handleOpeningCountSubmit} className="space-y-4">
                <div className="bg-surface rounded-2xl border border-border overflow-hidden">
                  <div className="divide-y divide-border/50">
                    {productList.map((prod) => {
                      const expected = prod.expectedOpeningQty ?? prod.currentStock;
                      const counted = openingCounts[prod.id] ?? expected;
                      const variance = counted - expected;

                      return (
                        <div key={prod.id} className="p-4 flex items-center justify-between gap-4">
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-text-primary">{prod.name}</p>
                            <p className="text-xs text-text-muted">
                              Expected: <span className="font-semibold">{expected} {prod.unit}(s)</span>
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="space-y-1 text-right">
                              <span className="text-[10px] text-text-muted uppercase font-semibold block">Counted</span>
                              <input
                                type="number"
                                min="0"
                                value={counted}
                                onChange={(e) => setOpeningCounts({
                                  ...openingCounts,
                                  [prod.id]: Math.max(0, parseInt(e.target.value, 10) || 0)
                                })}
                                className="w-24 px-3 py-1.5 rounded-xl border border-border bg-background text-sm font-semibold text-text-primary text-center focus:outline-none focus:ring-2 focus:ring-brand"
                              />
                            </div>

                            <div className="text-right min-w-[80px]">
                              <span className="text-[10px] text-text-muted uppercase font-semibold block">Variance</span>
                              <span className={`text-xs font-bold ${
                                variance === 0 ? "text-emerald-600" : variance > 0 ? "text-blue-600" : "text-rose-600"
                              }`}>
                                {variance > 0 ? `+${variance}` : variance}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isOpeningSubmitting}
                  className="w-full py-3 text-white text-xs font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                  style={{ backgroundImage: 'var(--brand-gradient)' }}
                >
                  {isOpeningSubmitting ? "Confirming Count..." : "Confirm Opening Stock Count →"}
                </button>
              </form>
            ) : (
              <div className="bg-surface rounded-2xl p-8 border border-border text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-base font-semibold text-text-primary">Opening Count Completed</h3>
                <p className="text-xs text-text-muted max-w-md mx-auto">
                  Opening stock counts have been recorded and locked for this shift. You can now log sales, waste, or restocks freely.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LOG SALE (MULTI-ITEM POS CHECKOUT) */}
        {activeTab === "sale" && (
          <div className="space-y-6">
            {!isOpeningDone ? (
              <div className="bg-surface rounded-2xl p-8 border border-border text-center space-y-4">
                <Lock className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="text-base font-semibold text-text-primary">Opening Stock Count Required</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Sales cannot be logged until opening shelf stock is counted to establish a baseline.
                </p>
                <button
                  onClick={() => setActiveTab("stock-count")}
                  className="px-5 py-2.5 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                  style={{ backgroundImage: 'var(--brand-gradient)' }}
                >
                  Count Stock Now →
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Product Catalog Grid (Left 7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold font-heading text-text-primary">Select Products</h2>
                      <p className="text-xs text-text-muted">Click items to add to the customer's order cart.</p>
                    </div>
                    <span className="text-xs font-semibold text-text-muted">
                      {productList.length} products
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                    {productList.map((prod) => {
                      const cartItem = cart.find((i) => i.productId === prod.id);
                      const inCartQty = cartItem?.quantity || 0;

                      return (
                        <div
                          key={prod.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                            inCartQty > 0
                              ? "border-brand bg-brand/5 shadow-sm"
                              : "border-border bg-surface hover:border-brand/40"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-semibold text-text-primary">{prod.name}</h4>
                              <p className="text-xs text-brand font-bold mt-0.5">
                                {currencySymbol}{prod.sellingPrice.toLocaleString()} <span className="text-[10px] text-text-muted font-normal">/ {prod.unit}</span>
                              </p>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-border/60 text-text-primary">
                              {prod.currentStock} in stock
                            </span>
                          </div>

                          {inCartQty > 0 ? (
                            <div className="flex items-center justify-between bg-surface p-1.5 rounded-xl border border-brand/30">
                              <button
                                type="button"
                                onClick={() => updateCartQty(prod.id, -1)}
                                className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center font-bold text-xs hover:bg-border/40"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold text-brand px-2">{inCartQty} in cart</span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(prod.id, 1)}
                                className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center font-bold text-xs"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(prod.id)}
                              className="w-full py-2 bg-surface hover:bg-brand hover:text-white border border-border text-text-primary text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5" /> Add to Order
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cart & Checkout Panel (Right 5 Cols) */}
                <div className="lg:col-span-5 bg-surface rounded-2xl p-5 border border-border space-y-5 sticky top-6">
                  <div className="flex items-center justify-between border-b border-border pb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-brand" />
                      <h3 className="text-base font-bold font-heading text-text-primary">Order Cart</h3>
                    </div>
                    {cart.length > 0 && (
                      <button
                        type="button"
                        onClick={clearCart}
                        className="text-xs text-rose-600 font-medium hover:underline flex items-center gap-1"
                      >
                        Clear Cart
                      </button>
                    )}
                  </div>

                  {cart.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <ShoppingBag className="w-10 h-10 text-text-muted/40 mx-auto" />
                      <p className="text-xs font-semibold text-text-muted">Cart is empty</p>
                      <p className="text-[11px] text-text-muted">Select products on the left to build the order.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSaleSubmit} className="space-y-5">
                      {/* Cart Items List */}
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1 divide-y divide-border/40">
                        {cart.map((item) => {
                          const prod = productList.find((p) => p.id === item.productId);
                          if (!prod) return null;
                          const subtotal = prod.sellingPrice * item.quantity;

                          return (
                            <div key={item.productId} className="pt-2 flex items-center justify-between text-xs">
                              <div className="space-y-0.5">
                                <p className="font-semibold text-text-primary">{prod.name}</p>
                                <p className="text-[11px] text-text-muted">
                                  {currencySymbol}{prod.sellingPrice.toLocaleString()} × {item.quantity} = <span className="font-bold text-text-primary">{currencySymbol}{subtotal.toLocaleString()}</span>
                                </p>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex items-center border border-border rounded-lg bg-background">
                                  <button
                                    type="button"
                                    onClick={() => updateCartQty(item.productId, -1)}
                                    className="px-2 py-1 text-text-muted hover:text-text-primary font-bold text-xs"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 text-xs font-bold">{item.quantity}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateCartQty(item.productId, 1)}
                                    className="px-2 py-1 text-text-muted hover:text-text-primary font-bold text-xs"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.productId)}
                                  className="text-text-muted hover:text-rose-600 p-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total Amount Summary */}
                      <div className="p-3.5 rounded-xl bg-background border border-border flex items-center justify-between">
                        <span className="text-xs font-semibold text-text-muted">Total Order Amount</span>
                        <span className="text-xl font-bold text-brand tracking-tight">
                          {currencySymbol}{cartTotal.toLocaleString()}
                        </span>
                      </div>

                      {/* Payment Type */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-text-primary">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPaymentType("paid")}
                            className={`py-2.5 px-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                              paymentType === "paid"
                                ? "border-brand bg-brand/10 text-brand shadow-sm"
                                : "border-border bg-background text-text-muted hover:text-text-primary"
                            }`}
                          >
                            Paid (Cash/Transfer)
                          </button>
                          <button
                            type="button"
                            onClick={() => setPaymentType("credit")}
                            className={`py-2.5 px-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                              paymentType === "credit"
                                ? "border-amber-500 bg-amber-500/10 text-amber-600 shadow-sm"
                                : "border-border bg-background text-text-muted hover:text-text-primary"
                            }`}
                          >
                            Credit (Debt)
                          </button>
                        </div>
                      </div>

                      {/* Credit Customer Selector */}
                      {paymentType === "credit" && (
                        <div className="space-y-3 bg-background p-3.5 rounded-xl border border-border">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-text-primary">Customer Owed</label>
                            <button
                              type="button"
                              onClick={() => setShowAddCustomer(!showAddCustomer)}
                              className="text-[11px] text-brand font-medium hover:underline flex items-center gap-1"
                            >
                              <UserPlus className="w-3 h-3" /> {showAddCustomer ? "Select Existing" : "Quick Add"}
                            </button>
                          </div>

                          {!showAddCustomer ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Search customer by name..."
                                value={customerSearch}
                                onChange={(e) => setCustomerSearch(e.target.value)}
                                className="w-full px-3 py-1.5 border border-border bg-surface rounded-xl text-xs text-text-primary"
                              />
                              {selectedCustomer && (
                                <div className="p-2 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-between text-xs text-brand font-semibold">
                                  <span>{selectedCustomer.name}</span>
                                  <button type="button" onClick={() => setSelectedCustomer(null)}><X className="w-3.5 h-3.5" /></button>
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
                                      <span className="text-text-muted">{currencySymbol}{c.balanceOwed?.toLocaleString() || 0}</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <input
                                type="text"
                                placeholder="Customer Full Name"
                                value={newCustName}
                                onChange={(e) => setNewCustName(e.target.value)}
                                className="w-full px-3 py-1.5 border border-border bg-surface rounded-xl text-xs text-text-primary"
                              />
                              <input
                                type="text"
                                placeholder="Phone Number (optional)"
                                value={newCustPhone}
                                onChange={(e) => setNewCustPhone(e.target.value)}
                                className="w-full px-3 py-1.5 border border-border bg-surface rounded-xl text-xs text-text-primary"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isSaleSubmitting}
                        className="w-full py-3 text-white text-xs font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                        style={{ backgroundImage: 'var(--brand-gradient)' }}
                      >
                        {isSaleSubmitting ? "Processing Order..." : `Complete Order (${currencySymbol}${cartTotal.toLocaleString()}) →`}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: LOG WASTE */}
        {activeTab === "waste" && (
          <div className="space-y-6 max-w-2xl">
            {!isOpeningDone ? (
              <div className="bg-surface rounded-2xl p-8 border border-border text-center space-y-4">
                <Lock className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="text-base font-semibold text-text-primary">Opening Stock Count Required</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Waste cannot be logged until opening shelf stock is counted to establish a baseline.
                </p>
                <button
                  onClick={() => setActiveTab("stock-count")}
                  className="px-5 py-2.5 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                  style={{ backgroundImage: 'var(--brand-gradient)' }}
                >
                  Count Stock Now →
                </button>
              </div>
            ) : (
              <form onSubmit={handleWasteSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold font-heading text-text-primary">Log Waste & Spoilage</h2>
                  <p className="text-xs text-text-muted">Record unsellable or damaged stock.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-primary">Product</label>
                  <select
                    value={wasteProductId}
                    onChange={(e) => setWasteProductId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border bg-background rounded-xl text-xs text-text-primary"
                  >
                    <option value="">-- Select Product --</option>
                    {productList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.currentStock} left)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-primary">Quantity Wasted</label>
                  <input
                    type="number"
                    min="1"
                    value={wasteQty}
                    onChange={(e) => setWasteQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2.5 border border-border bg-background rounded-xl text-xs font-semibold text-text-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-primary">Reason</label>
                  <select
                    value={wasteReason}
                    onChange={(e) => setWasteReason(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border bg-background rounded-xl text-xs text-text-primary"
                  >
                    <option value="spoiled">Spoiled / Expired</option>
                    <option value="damaged">Damaged / Broken</option>
                    <option value="error">Preparation Error</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isWasteSubmitting}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isWasteSubmitting ? "Logging Waste..." : "Log Waste Item"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 5: LOG RESTOCK */}
        {activeTab === "restock" && (
          <div className="space-y-6 max-w-2xl">
            {!isOpeningDone ? (
              <div className="bg-surface rounded-2xl p-8 border border-border text-center space-y-4">
                <Lock className="w-10 h-10 text-amber-500 mx-auto" />
                <h3 className="text-base font-semibold text-text-primary">Opening Stock Count Required</h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Restocks cannot be logged until opening shelf stock is counted to establish a baseline.
                </p>
                <button
                  onClick={() => setActiveTab("stock-count")}
                  className="px-5 py-2.5 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                  style={{ backgroundImage: 'var(--brand-gradient)' }}
                >
                  Count Stock Now →
                </button>
              </div>
            ) : (
              <form onSubmit={handleRestockSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold font-heading text-text-primary">Log Restock</h2>
                  <p className="text-xs text-text-muted">Record new inventory delivered to the shop.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-primary">Product</label>
                  <select
                    value={restockProductId}
                    onChange={(e) => setRestockProductId(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border bg-background rounded-xl text-xs text-text-primary"
                  >
                    <option value="">-- Select Product --</option>
                    {productList.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.currentStock} left)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-primary">Quantity Delivered</label>
                  <input
                    type="number"
                    min="1"
                    value={restockQty}
                    onChange={(e) => setRestockQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full px-3 py-2.5 border border-border bg-background rounded-xl text-xs font-semibold text-text-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRestockSubmitting}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {isRestockSubmitting ? "Adding Restock..." : "Add to Inventory"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 6: ACTIVITY LOG */}
        {activeTab === "activity" && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold font-heading text-text-primary">Shift Activity Log</h2>
              <p className="text-xs text-text-muted">All transactions and stock events recorded during this shift.</p>
            </div>

            <div className="bg-surface rounded-2xl p-5 border border-border space-y-3">
              {activities.length === 0 ? (
                <p className="text-xs text-text-muted py-8 text-center">No activity recorded yet for this shift.</p>
              ) : (
                <div className="divide-y divide-border/50">
                  {activities.map((act) => (
                    <div key={act.id} className="py-3.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-text-primary">{act.title}</p>
                        <p className="text-text-muted text-[11px] mt-0.5">{act.detail}</p>
                      </div>
                      <div className="text-right">
                        {act.amount !== null && (
                          <p className="font-bold text-text-primary">{currencySymbol}{act.amount.toLocaleString()}</p>
                        )}
                        <span className="text-text-muted text-[10px]">
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

      {/* CLOSE SHIFT MODAL (Two-Step: Stock Count -> Cash Count) */}
      {isCloseShiftModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background border border-border w-full max-w-lg rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-lg font-bold font-heading text-text-primary">
                  {closeStep === "stock" ? "Step 1: End of Shift Stock Count" : "Step 2: End of Shift Cash Count"}
                </h3>
                <p className="text-xs text-text-muted">Reconcile physical stock and expected cash before shift closure.</p>
              </div>
              <button onClick={() => setIsCloseShiftModalOpen(false)}><X className="w-5 h-5 text-text-muted" /></button>
            </div>

            {closeStep === "stock" ? (
              <div className="space-y-4">
                <div className="divide-y divide-border/50 bg-surface rounded-xl border border-border">
                  {stockSummary.map((item) => {
                    const counted = closingStockCounts[item.productId] ?? item.calculatedClosingQty;
                    const variance = counted - item.calculatedClosingQty;

                    return (
                      <div key={item.id} className="p-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-text-primary">{item.productName}</p>
                          <p className="text-[11px] text-text-muted">
                            Opening: {item.countedOpeningQty} | Sold: {item.soldQty} | Waste: {item.wasteQty} | Expected: <span className="font-semibold text-text-primary">{item.calculatedClosingQty}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={counted}
                            onChange={(e) => setClosingStockCounts({
                              ...closingStockCounts,
                              [item.productId]: Math.max(0, parseInt(e.target.value, 10) || 0)
                            })}
                            className="w-20 px-2 py-1 rounded-lg border border-border bg-background text-xs font-semibold text-center"
                          />
                          <span className={`text-xs font-bold w-8 text-right ${
                            variance === 0 ? "text-emerald-600" : variance > 0 ? "text-blue-600" : "text-rose-600"
                          }`}>
                            {variance > 0 ? `+${variance}` : variance}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setCloseStep("cash")}
                  className="w-full py-3 text-white text-xs font-semibold rounded-xl shadow-md transition-all"
                  style={{ backgroundImage: 'var(--brand-gradient)' }}
                >
                  Proceed to Cash Count →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-surface p-4 rounded-xl border border-border space-y-2">
                  <span className="text-xs text-text-muted font-medium">Expected Cash (Non-Credit Sales)</span>
                  <p className="text-2xl font-bold text-text-primary">
                    {currencySymbol}{expectedCashForClose.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-text-muted flex items-center gap-1 mt-1">
                    <Info className="w-3.5 h-3.5 text-brand" />
                    <span>Note: Expected cash includes transfer & online payments.</span>
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-primary">Counted Cash in Drawer ({currencySymbol})</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter physical cash counted..."
                    value={countedCash}
                    onChange={(e) => setCountedCash(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border bg-background rounded-xl text-sm font-semibold text-text-primary"
                  />
                </div>

                {countedCash !== "" && (
                  <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs font-semibold">
                    <span>Cash Variance:</span>
                    <span className={(parseInt(countedCash, 10) || 0) - expectedCashForClose >= 0 ? "text-emerald-600" : "text-rose-600"}>
                      {currencySymbol}{((parseInt(countedCash, 10) || 0) - expectedCashForClose).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCloseStep("stock")}
                    className="w-1/3 py-2.5 border border-border bg-surface text-text-primary text-xs font-semibold rounded-xl"
                  >
                    ← Back
                  </button>

                  <button
                    type="button"
                    onClick={handleFinalCloseShift}
                    disabled={isClosingSubmitting}
                    className="w-2/3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
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
  );
}
