import { useState, useMemo, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Camera, X, ScanLine } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useMaterials, useTaxes } from '@/lib/useStore';
import { Material } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

const emptyMat: Omit<Material, 'id'> = { name: '', unitPrice: 0, quantity: 0, alertQuantity: 0, serialCode: '', taxIds: [], category: '', unit: '' };

export default function Inventory() {
  const { materials, add, update, remove } = useMaterials();
  const { taxes } = useTaxes();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState(emptyMat);
  const [scannerOpen, setScannerOpen] = useState(false);
  const scannerRef = useRef<any>(null);

  async function startScanner() {
    setScannerOpen(true);
    try {
      const { Html5Qrcode } = await import('html5-qrcode');
      await new Promise(r => setTimeout(r, 300));
      const el = document.getElementById('inventory-scanner');
      if (!el) return;
      const scanner = new Html5Qrcode('inventory-scanner');
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 200, height: 200 } },
        (decodedText: string) => {
          setForm(f => ({ ...f, serialCode: decodedText }));
          toast({ title: 'Code Scanned', description: decodedText });
          stopScanner();
        },
        () => {}
      );
    } catch {
      toast({ title: 'Camera error', description: 'Could not access camera', variant: 'destructive' });
      setScannerOpen(false);
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch {}
      scannerRef.current = null;
    }
    setScannerOpen(false);
  }

  const filtered = useMemo(() =>
    materials.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase())),
    [materials, search]
  );

  function openAdd() { setEditing(null); setForm(emptyMat); setDialogOpen(true); }
  function openEdit(m: Material) { setEditing(m); setForm({ name: m.name, unitPrice: m.unitPrice, quantity: m.quantity, alertQuantity: m.alertQuantity, serialCode: m.serialCode, taxIds: [...m.taxIds], category: m.category, unit: m.unit }); setDialogOpen(true); }

  function handleSave() {
    if (!form.name || form.unitPrice <= 0) { toast({ title: 'Error', description: 'Name and price are required', variant: 'destructive' }); return; }
    if (editing) {
      update({ ...editing, ...form });
      toast({ title: 'Updated', description: `${form.name} updated successfully` });
    } else {
      add({ ...form, id: `mat-${Date.now()}` });
      toast({ title: 'Added', description: `${form.name} added to inventory` });
    }
    setDialogOpen(false);
    stopScanner();
  }

  function handleDelete(m: Material) {
    remove(m.id);
    toast({ title: 'Deleted', description: `${m.name} removed from inventory` });
  }

  function toggleTax(taxId: string) {
    setForm(f => ({ ...f, taxIds: f.taxIds.includes(taxId) ? f.taxIds.filter(id => id !== taxId) : [...f.taxIds, taxId] }));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground">{materials.length} materials in stock</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Material</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search materials..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Alert</TableHead>
                <TableHead>Serial Code</TableHead>
                <TableHead>Taxes</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(m => {
                const isLow = m.quantity <= m.alertQuantity;
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{m.name}</p>
                        <p className="text-xs text-muted-foreground">{m.category} · {m.unit}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">Br{m.unitPrice}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className={isLow ? 'text-destructive font-medium' : 'text-foreground'}>{m.quantity}</span>
                        {isLow && <AlertTriangle className="h-3.5 w-3.5 text-destructive" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{m.alertQuantity}</TableCell>
                    <TableCell><code className="text-xs bg-secondary px-1.5 py-0.5 rounded text-foreground">{m.serialCode}</code></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {m.taxIds.map(tid => {
                          const tax = taxes.find(t => t.id === tid);
                          return tax ? <Badge key={tid} variant="secondary" className="text-xs">{tax.name} {tax.percentage}%</Badge> : null;
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(m)}><Edit2 className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(m)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">No materials found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) stopScanner(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Material' : 'Add Material'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Name</Label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Unit Price (Br)</Label>
                <Input type="number" value={form.unitPrice || ''} onChange={e => setForm(f => ({ ...f, unitPrice: +e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Quantity</Label>
                <Input type="number" value={form.quantity || ''} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Alert Quantity</Label>
                <Input type="number" value={form.alertQuantity || ''} onChange={e => setForm(f => ({ ...f, alertQuantity: +e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Serial Code</Label>
                <div className="flex gap-1">
                  <Input value={form.serialCode} onChange={e => setForm(f => ({ ...f, serialCode: e.target.value }))} className="flex-1" placeholder="Scan or type..." />
                  <Button type="button" size="icon" variant={scannerOpen ? 'destructive' : 'outline'} onClick={scannerOpen ? stopScanner : startScanner}>
                    {scannerOpen ? <X className="h-4 w-4" /> : <ScanLine className="h-4 w-4" />}
                  </Button>
                </div>
                {scannerOpen && (
                  <div id="inventory-scanner" className="w-full max-w-[200px] mx-auto mt-2" />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Category</Label>
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <div className="grid gap-1.5">
                <Label>Unit</Label>
                <Input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="kg, bag, piece..." />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Assign Taxes</Label>
              <div className="space-y-2">
                {taxes.map(t => (
                  <div key={t.id} className="flex items-center gap-2">
                    <Checkbox checked={form.taxIds.includes(t.id)} onCheckedChange={() => toggleTax(t.id)} />
                    <span className="text-sm text-foreground">{t.name} ({t.percentage}%)</span>
                    {t.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
