"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface RevenueChartProps {
  data?: { date: string; revenue: number }[];
  currencySymbol?: string;
}

const defaultMockData = [
  { date: "Jun 26", revenue: 0 },
  { date: "Jul 1", revenue: 0 },
  { date: "Jul 5", revenue: 0 },
  { date: "Jul 10", revenue: 0 },
  { date: "Jul 15", revenue: 0 },
  { date: "Jul 20", revenue: 0 },
  { date: "Jul 26", revenue: 0 },
];

export function RevenueChart({ data = defaultMockData, currencySymbol = "₦" }: RevenueChartProps) {
  const chartData = data.length > 0 ? data : defaultMockData;

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="var(--border)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: "var(--text-muted)" }} 
            dy={10} 
          />
          <YAxis 
            hide={true} 
            domain={['dataMin', 'dataMax + 100']} 
          />
          <Tooltip 
            formatter={(value: any) => [`${currencySymbol}${Number(value).toLocaleString()}`, "Revenue"]}
            contentStyle={{ 
              backgroundColor: "var(--surface)", 
              borderColor: "var(--border)", 
              borderRadius: "12px",
              color: "var(--text-primary)",
              fontWeight: 600,
              fontSize: "12px"
            }} 
            itemStyle={{ color: "var(--brand)" }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="var(--brand)" 
            strokeWidth={2.5} 
            dot={{ r: 3, fill: "var(--brand)" }} 
            activeDot={{ r: 6, fill: "var(--brand)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
