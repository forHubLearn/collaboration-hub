import { useState, useMemo } from 'react';
import { Download, TrendingUp, DollarSign, ShoppingCart, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';
import { getTransactions } from '@/lib/store';
import { Transaction } from '@/lib/types';

type Period = 'week' | 'month' | 'quarter' | 'year';

export default function Analytics() {
  const transactions = getTransactions();
  const [period, setPeriod] = useState<Period>('month');

  const filtered = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();
    if (period === 'week') cutoff.setDate(now.getDate() - 7);
    else if (period === 'month') cutoff.setMonth(now.getMonth() - 1);
    else if (period === 'quarter') cutoff.setMonth(now.getMonth() - 3);
    else cutoff.setFullYear(now.getFullYear() - 1);
    return transactions.filter(t => new Date(t.date) >= cutoff);
  }, [transactions, period]);

  const totalRevenue = filtered.reduce((s, t) => s + t.totalPrice, 0);
  const totalTax = filtered.reduce((s, t) => s + t.totalTax, 0);
  const avgSale = filtered.length > 0 ? totalRevenue / filtered.length : 0;

  // Daily chart data
  const chartData = useMemo(() => {
    const map: Record<string, { date: string; revenue: number; count: number }> = {};
    filtered.forEach(t => {
      const d = new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!map[d]) map[d] = { date: d, revenue: 0, count: 0 };
      map[d].revenue += t.totalPrice;
      map[d].count += 1;
    });
    return Object.values(map).map(v => ({ ...v, revenue: Math.round(v.revenue) }));
  }, [filtered]);

  // Top products
  const topProducts = useMemo(() => {
    const map: Record<string, { name: string; quantity: number; revenue: number }> = {};
    filtered.forEach(t => t.items.forEach(item => {
      if (!map[item.materialId]) map[item.materialId] = { name: item.materialName, quantity: 0, revenue: 0 };
      map[item.materialId].quantity += item.quantity;
      map[item.materialId].revenue += item.total;
    }));
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [filtered]);

  async function exportPDF() {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Sales Report', 14, 22);
    doc.setFontSize(10);
    doc.text(`Period: ${period} | Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString()} | Transactions: ${filtered.length}`, 14, 36);

    autoTable(doc, {
      startY: 44,
      head: [['Date', 'Items', 'Subtotal', 'Tax', 'Total']],
      body: filtered.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.items.map(i => `${i.materialName} x${i.quantity}`).join(', '),
        `₹${t.subtotal.toFixed(2)}`,
        `₹${t.totalTax.toFixed(2)}`,
        `₹${t.totalPrice.toFixed(2)}`,
      ]),
    });
    doc.save(`sales-report-${period}.pdf`);
    toast({ title: 'PDF Downloaded', description: `Sales report for ${period} saved` });
  }

  async function exportXLSX() {
    const XLSX = await import('xlsx');
    const data = filtered.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Items: t.items.map(i => `${i.materialName} x${i.quantity}`).join(', '),
      Subtotal: t.subtotal,
      Tax: t.totalTax,
      Total: t.totalPrice,
      SoldBy: t.soldBy,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales');
    XLSX.writeFile(wb, `sales-report-${period}.xlsx`);
    toast({ title: 'Excel Downloaded', description: `Sales report for ${period} saved` });
  }

  const chartConfig = {
    revenue: { label: 'Revenue', color: 'hsl(var(--primary))' },
    count: { label: 'Transactions', color: 'hsl(var(--muted-foreground))' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Sales Analytics</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} transactions in selected period</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v: Period) => setPeriod(v)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportPDF}><Download className="h-4 w-4 mr-1" /> PDF</Button>
          <Button variant="outline" onClick={exportXLSX}><Download className="h-4 w-4 mr-1" /> Excel</Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-secondary text-primary"><DollarSign className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
              <p className="text-xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-secondary text-primary"><ShoppingCart className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-xl font-bold text-foreground">{filtered.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-secondary text-primary"><TrendingUp className="h-5 w-5" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Avg. Sale</p>
              <p className="text-xl font-bold text-foreground">₹{avgSale.toFixed(0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Revenue Over Time</CardTitle></CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-64 w-full">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">No data for selected period</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-lg">Top Products</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs w-5 h-5 flex items-center justify-center p-0">{i + 1}</Badge>
                    <div>
                      <p className="text-sm font-medium text-foreground truncate max-w-[140px]">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.quantity} units</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground">₹{Math.round(p.revenue).toLocaleString()}</span>
                </div>
              ))}
              {topProducts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No data</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
