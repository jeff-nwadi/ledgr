"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const mockData = [
  { date: "Jun 26", revenue: 0 },
  { date: "Jul 1", revenue: 0 },
  { date: "Jul 5", revenue: 0 },
  { date: "Jul 10", revenue: 0 },
  { date: "Jul 15", revenue: 0 },
  { date: "Jul 20", revenue: 0 },
  { date: "Jul 26", revenue: 0 },
];

export function RevenueChart() {
  return (
    <div className="h-64 w-full mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mockData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
            domain={['dataMin', 'dataMax + 1000']} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "var(--surface)", 
              borderColor: "var(--border)", 
              borderRadius: "8px",
              color: "var(--text-primary)"
            }} 
            itemStyle={{ color: "var(--brand)" }}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="var(--brand)" 
            strokeWidth={2} 
            dot={false} 
            activeDot={{ r: 4, fill: "var(--brand)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
