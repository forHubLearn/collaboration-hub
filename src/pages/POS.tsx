import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Camera, Search, Plus, Minus, Trash2, ShoppingCart, X, ScanLine, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMaterials, useTaxes, useTransactions } from '@/lib/useStore';
import { CartItem, Material, Transaction } from '@/lib/types';
import { updateMaterial } from '@/lib/store';
import { toast } from '@/hooks/use-toast';

export default function POS({ role }: { role: 'admin' | 'sales' }) {
  const { materials, refresh: refreshMaterials } = useMaterials();
  const { taxes } = useTaxes();
  const { add: addTransaction } = useTransactions();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef<HTMLDivElement>(null);
  const html5QrCodeRef = useRef<any>(null);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return materials.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.qrCode.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 8);
  }, [searchQuery, materials]);

  function addToCart(material: Material) {
    setCart(prev => {
      const existing = prev.find(c => c.material.id === material.id);
      if (existing) {
        if (existing.quantity >= material.quantity) { toast({ title: 'Insufficient stock', variant: 'destructive' }); return prev; }
        return prev.map(c => c.material.id === material.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      if (material.quantity <= 0) { toast({ title: 'Out of stock', variant: 'destructive' }); return prev; }
      return [...prev, { material, quantity: 1 }];
    });
    setSearchQuery('');
    setShowSuggestions(false);
  }

  function updateQuantity(materialId: string, delta: number) {
    setCart(prev => prev.map(c => {
      if (c.material.id !== materialId) return c;
      const newQty = c.quantity + delta;
      if (newQty <= 0) return c;
      if (newQty > c.material.quantity) { toast({ title: 'Insufficient stock', variant: 'destructive' }); return c; }
      return { ...c, quantity: newQty };
    }));
  }

  function removeFromCart(materialId: string) {
    setCart(prev => prev.filter(c => c.material.id !== materialId));
  }

  function getItemTaxes(item: CartItem) {
    return item.material.taxIds.map(tid => {
      const tax = taxes.find(t => t.id === tid);
      if (!tax) return null;
      return { name: tax.name, percentage: tax.percentage, amount: Math.round(item.material.unitPrice * item.quantity * tax.percentage / 100 * 100) / 100 };
    }).filter(Boolean) as { name: string; percentage: number; amount: number }[];
  }

  const cartSummary = useMemo(() => {
    let subtotal = 0, totalTax = 0;
    cart.forEach(item => {
      subtotal += item.material.unitPrice * item.quantity;
      const itemTaxes = getItemTaxes(item);
      totalTax += itemTaxes.reduce((s, t) => s + t.amount, 0);
    });
    return { subtotal: Math.round(subtotal * 100) / 100, totalTax: Math.round(totalTax * 100) / 100, total: Math.round((subtotal + totalTax) * 100) / 100 };
  }, [cart, taxes]);

  function completeSale() {
    if (cart.length === 0) return;
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      items: cart.map(item => {
        const itemTaxes = getItemTaxes(item);
        const itemTaxTotal = itemTaxes.reduce((s, t) => s + t.amount, 0);
        return { materialId: item.material.id, materialName: item.material.name, quantity: item.quantity, unitPrice: item.material.unitPrice, taxes: itemTaxes, total: Math.round((item.material.unitPrice * item.quantity + itemTaxTotal) * 100) / 100 };
      }),
      subtotal: cartSummary.subtotal,
      totalTax: cartSummary.totalTax,
      totalPrice: cartSummary.total,
      date: new Date().toISOString(),
      soldBy: role,
    };
    // Reduce stock
    cart.forEach(item => {
      const mat = materials.find(m => m.id === item.material.id);
      if (mat) updateMaterial({ ...mat, quantity: mat.quantity - item.quantity });
    });
    addTransaction(tx);
    refreshMaterials();
    setCart([]);
    toast({ title: 'Sale Complete!', description: `Total: ₹${cartSummary.total.toLocaleString()}` });
  }

  // QR Scanner
  async function startScanner() {
    setScannerOpen(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      // Wait for DOM element
      await new Promise(r => setTimeout(r, 300));
      const el = document.getElementById('qr-reader');
      if (!el) return;
      const scanner = new Html5Qrcode('qr-reader');
      html5QrCodeRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          const mat = materials.find(m => m.qrCode === decodedText);
          if (mat) { addToCart(mat); toast({ title: 'Product scanned', description: mat.name }); }
          else toast({ title: 'Unknown QR code', description: decodedText, variant: 'destructive' });
          stopScanner();
        },
        () => {}
      );
    } catch (e) {
      toast({ title: 'Camera error', description: 'Could not access camera', variant: 'destructive' });
      setScannerOpen(false);
    }
  }

  async function stopScanner() {
    if (html5QrCodeRef.current) {
      try { await html5QrCodeRef.current.stop(); } catch {}
      html5QrCodeRef.current = null;
    }
    setScannerOpen(false);
  }

  useEffect(() => { return () => { stopScanner(); }; }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Point of Sale</h1>
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-5">
        {/* Product Selection */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search product by name or QR code..."
                className="pl-9"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                  {suggestions.map(m => (
                    <button key={m.id} className="w-full text-left px-3 py-2 hover:bg-accent flex items-center justify-between" onMouseDown={() => addToCart(m)}>
                      <div>
                        <p className="text-sm font-medium text-foreground">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.category} · Stock: {m.quantity}</p>
                      </div>
                      <span className="text-sm font-medium text-foreground">₹{m.unitPrice}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button variant={scannerOpen ? 'destructive' : 'outline'} onClick={scannerOpen ? stopScanner : startScanner}>
              {scannerOpen ? <X className="h-4 w-4 mr-1" /> : <Camera className="h-4 w-4 mr-1" />}
              {scannerOpen ? 'Close' : 'Scan QR'}
            </Button>
          </div>

          {scannerOpen && (
            <Card>
              <CardContent className="p-4">
                <div id="qr-reader" className="w-full max-w-sm mx-auto" />
                <p className="text-xs text-center text-muted-foreground mt-2">Point camera at QR code</p>
              </CardContent>
            </Card>
          )}

          {/* Quick product grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {materials.slice(0, 8).map(m => (
              <button key={m.id} onClick={() => addToCart(m)} className="p-3 border border-border rounded-lg hover:bg-accent text-left transition-colors">
                <p className="text-sm font-medium text-foreground truncate">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.quantity} {m.unit}</p>
                <p className="text-sm font-bold text-foreground mt-1">₹{m.unitPrice}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart */}
        <div className="lg:col-span-2">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Cart
                {cart.length > 0 && <Badge variant="secondary">{cart.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {cart.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Cart is empty. Search or scan to add products.</p>
              ) : (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {cart.map(item => {
                      const itemTaxes = getItemTaxes(item);
                      const itemTaxTotal = itemTaxes.reduce((s, t) => s + t.amount, 0);
                      const itemTotal = item.material.unitPrice * item.quantity + itemTaxTotal;
                      return (
                        <div key={item.material.id} className="p-3 border border-border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{item.material.name}</p>
                              <p className="text-xs text-muted-foreground">₹{item.material.unitPrice} × {item.quantity}</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => removeFromCart(item.material.id)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.material.id, -1)}><Minus className="h-3 w-3" /></Button>
                            <span className="text-sm font-medium w-8 text-center text-foreground">{item.quantity}</span>
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(item.material.id, 1)}><Plus className="h-3 w-3" /></Button>
                            <div className="flex-1" />
                            <span className="text-sm font-bold text-foreground">₹{itemTotal.toFixed(2)}</span>
                          </div>
                          {itemTaxes.length > 0 && (
                            <div className="mt-1.5 space-y-0.5">
                              {itemTaxes.map(t => (
                                <div key={t.name} className="flex justify-between text-xs text-muted-foreground">
                                  <span>{t.name} ({t.percentage}%)</span>
                                  <span>₹{t.amount.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <Separator />
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>₹{cartSummary.subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-sm text-muted-foreground"><span>Tax</span><span>₹{cartSummary.totalTax.toFixed(2)}</span></div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold text-foreground"><span>Total</span><span>₹{cartSummary.total.toFixed(2)}</span></div>
                  </div>
                  <Button className="w-full" size="lg" onClick={completeSale}>Complete Sale — ₹{cartSummary.total.toFixed(2)}</Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
