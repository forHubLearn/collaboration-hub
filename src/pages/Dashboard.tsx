import { useEffect } from 'react';
import { Package, AlertTriangle, ShoppingCart, DollarSign, TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getMaterials, getTransactions, getLowStockMaterials } from '@/lib/store';
import { UserRole } from '@/lib/types';

interface DashboardProps { role: UserRole; }

export default function Dashboard({ role }: DashboardProps) {
  const materials = getMaterials();
  const transactions = getTransactions();
  const lowStock = getLowStockMaterials();
  const today = new Date().toDateString();
  const todayTxs = transactions.filter(t => new Date(t.date).toDateString() === today);
  const todayRevenue = todayTxs.reduce((s, t) => s + t.totalPrice, 0);
  const totalRevenue = transactions.reduce((s, t) => s + t.totalPrice, 0);

  const stats = [
    { label: 'Total Products', value: materials.length, icon: Package, color: 'text-primary' },
    { label: 'Low Stock Alerts', value: lowStock.length, icon: AlertTriangle, color: 'text-destructive' },
    { label: "Today's Sales", value: todayTxs.length, icon: ShoppingCart, color: 'text-primary' },
    { label: "Today's Revenue", value: `₹${todayRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-primary' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back! Here's your store overview.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-2 rounded-lg bg-secondary ${s.color}`}><s.icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" /> Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">All stock levels are healthy!</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {lowStock.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/20">
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.category}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive" className="text-xs">{m.quantity} left</Badge>
                      <p className="text-xs text-muted-foreground mt-0.5">Alert: {m.alertQuantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/pos">
              <Button className="w-full justify-between" size="lg">
                Open POS <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/inventory">
              <Button variant="outline" className="w-full justify-between mt-2" size="lg">
                Manage Inventory <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            {role === 'admin' && (
              <Link to="/analytics">
                <Button variant="outline" className="w-full justify-between mt-2" size="lg">
                  View Analytics <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Card className="bg-secondary/50 border-0 mt-4">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">Total Revenue</p>
                </div>
                <p className="text-2xl font-bold text-foreground mt-1">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{transactions.length} transactions total</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
