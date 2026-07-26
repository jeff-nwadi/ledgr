import { TrendingUp, TrendingDown, DollarSign, Package } from "lucide-react";

export function TopLineCards({
  revenue,
  cogs,
  grossProfit,
  stockValue,
}: {
  revenue: number;
  cogs: number;
  grossProfit: number;
  stockValue: number | null;
}) {
  const formatMoney = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  const cards = [
    {
      title: "Revenue",
      value: formatMoney(revenue),
      icon: DollarSign,
      color: "text-text-primary",
      bg: "bg-surface"
    },
    {
      title: "COGS",
      value: formatMoney(cogs),
      icon: TrendingDown,
      color: "text-danger",
      bg: "bg-danger/10"
    },
    {
      title: "Gross Profit",
      value: formatMoney(grossProfit),
      icon: TrendingUp,
      color: grossProfit >= 0 ? "text-success" : "text-danger",
      bg: grossProfit >= 0 ? "bg-success/10" : "bg-danger/10"
    },
    {
      title: "Stock Value",
      value: stockValue === null ? "—" : formatMoney(stockValue),
      icon: Package,
      color: "text-text-primary",
      bg: "bg-surface"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="p-5 rounded-[1rem] bg-background border border-border/50 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className={`p-1.5 rounded-md ${card.bg}`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <span className="text-[13px] font-medium text-text-muted">{card.title}</span>
          </div>
          <div className="text-2xl font-bold font-heading text-text-primary mt-auto">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
