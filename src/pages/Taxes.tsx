import { useState } from 'react';
import { Plus, Edit2, Trash2, Star, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTaxes, useMaterials } from '@/lib/useStore';
import { Tax } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export default function Taxes() {
  const { taxes, add, update, remove } = useTaxes();
  const { materials } = useMaterials();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Tax | null>(null);
  const [name, setName] = useState('');
  const [percentage, setPercentage] = useState(0);

  function openAdd() { setEditing(null); setName(''); setPercentage(0); setDialogOpen(true); }
  function openEdit(t: Tax) { setEditing(t); setName(t.name); setPercentage(t.percentage); setDialogOpen(true); }

  function handleSave() {
    if (!name || percentage <= 0) { toast({ title: 'Error', description: 'Name and percentage required', variant: 'destructive' }); return; }
    if (editing) {
      update({ ...editing, name, percentage });
      toast({ title: 'Updated', description: `${name} tax updated` });
    } else {
      add({ id: `tax-${Date.now()}`, name, percentage, isDefault: taxes.length === 0 });
      toast({ title: 'Added', description: `${name} tax created` });
    }
    setDialogOpen(false);
  }

  function handleSetDefault(t: Tax) {
    taxes.forEach(tx => update({ ...tx, isDefault: tx.id === t.id }));
    toast({ title: 'Default tax set', description: `${t.name} is now the default tax` });
  }

  function handleDelete(t: Tax) {
    remove(t.id);
    toast({ title: 'Deleted', description: `${t.name} tax removed` });
  }

  function getProductCount(taxId: string) {
    return materials.filter(m => m.taxIds.includes(taxId)).length;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tax Management</h1>
          <p className="text-sm text-muted-foreground">{taxes.length} tax types configured</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Tax</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tax Name</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Products</TableHead>
                <TableHead className="w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taxes.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-foreground">{t.name}</TableCell>
                  <TableCell className="text-foreground">{t.percentage}%</TableCell>
                  <TableCell>
                    {t.isDefault ? <Badge className="bg-primary text-primary-foreground">Default</Badge> : (
                      <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => handleSetDefault(t)}>Set default</Button>
                    )}
                  </TableCell>
                  <TableCell><Badge variant="secondary">{getProductCount(t.id)} products</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(t)}><Edit2 className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(t)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {taxes.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No taxes configured</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? 'Edit Tax' : 'Add Tax'}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Tax Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. VAT" />
            </div>
            <div className="grid gap-1.5">
              <Label>Percentage (%)</Label>
              <Input type="number" value={percentage || ''} onChange={e => setPercentage(+e.target.value)} />
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
