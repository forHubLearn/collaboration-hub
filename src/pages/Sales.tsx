import { useState, useMemo } from 'react';
import { Search, Filter, Calendar, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getTransactions } from '@/lib/store';
import { Transaction } from '@/lib/types';
import { useAuth } from '@/lib/AuthContext';
import { getAllUsers } from '@/lib/auth';

type DateFilter = 'today' | 'yesterday' | 'week' | 'month' | 'all';

interface SalesProps {
  restrictedMode?: boolean;
}

export default function Sales({ restrictedMode = false }: SalesProps) {
  const { user } = useAuth();
  const allTransactions = getTransactions();
  const users = getAllUsers();
  const [dateFilter, setDateFilter] = useState<DateFilter>(restrictedMode ? 'today' : 'all');
  const [userFilter, setUserFilter] = useState<string>(restrictedMode ? (user?.role || 'sales') : 'all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let txs = allTransactions;

    // Date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (dateFilter === 'today') {
      txs = txs.filter(t => new Date(t.date) >= today);
    } else if (dateFilter === 'yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      txs = txs.filter(t => { const d = new Date(t.date); return d >= yesterday && d < today; });
    } else if (dateFilter === 'week') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      txs = txs.filter(t => new Date(t.date) >= weekAgo);
    } else if (dateFilter === 'month') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      txs = txs.filter(t => new Date(t.date) >= monthAgo);
    }

    // User filter
    if (restrictedMode) {
      txs = txs.filter(t => t.soldBy === user?.role);
    } else if (userFilter !== 'all') {
      txs = txs.filter(t => t.soldBy === userFilter);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      txs = txs.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.items.some(i => i.materialName.toLowerCase().includes(q))
      );
    }

    return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allTransactions, dateFilter, userFilter, search, restrictedMode, user]);

  const totalRevenue = filtered.reduce((s, t) => s + t.totalPrice, 0);
  const totalTax = filtered.reduce((s, t) => s + t.totalTax, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {restrictedMode ? "Today's Sales" : 'Sales Report'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} transactions · Revenue: ₹{totalRevenue.toLocaleString()}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={dateFilter} onValueChange={(v: DateFilter) => setDateFilter(v)} disabled={restrictedMode}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!restrictedMode && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by product or invoice..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Transactions</p>
            <p className="text-xl font-bold text-foreground">{filtered.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-xl font-bold text-foreground">₹{totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Tax</p>
            <p className="text-xl font-bold text-foreground">₹{totalTax.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Sold By</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(tx => (
                <TableRow key={tx.id}>
                  <TableCell><code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">{tx.id}</code></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      {tx.items.map((item, i) => (
                        <p key={i} className="text-xs text-foreground">{item.materialName} ×{item.quantity}</p>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{tx.soldBy}</Badge>
                  </TableCell>
                  <TableCell className="text-foreground">₹{tx.subtotal.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">₹{tx.totalTax.toFixed(2)}</TableCell>
                  <TableCell className="font-medium text-foreground">₹{tx.totalPrice.toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No transactions found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
