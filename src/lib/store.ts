import { Material, Tax, Transaction, UserRole } from './types';

const KEYS = {
  materials: 'bms_materials',
  taxes: 'bms_taxes',
  transactions: 'bms_transactions',
  role: 'bms_role',
  seeded: 'bms_seeded',
};

function get<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Taxes ---
export function getTaxes(): Tax[] { return get<Tax[]>(KEYS.taxes, []); }
export function saveTaxes(taxes: Tax[]) { set(KEYS.taxes, taxes); }
export function addTax(tax: Tax) { const t = getTaxes(); t.push(tax); saveTaxes(t); }
export function updateTax(tax: Tax) { saveTaxes(getTaxes().map(t => t.id === tax.id ? tax : t)); }
export function deleteTax(id: string) { saveTaxes(getTaxes().filter(t => t.id !== id)); }

// --- Materials ---
export function getMaterials(): Material[] { return get<Material[]>(KEYS.materials, []); }
export function saveMaterials(materials: Material[]) { set(KEYS.materials, materials); }
export function addMaterial(m: Material) { const ms = getMaterials(); ms.push(m); saveMaterials(ms); }
export function updateMaterial(m: Material) { saveMaterials(getMaterials().map(x => x.id === m.id ? m : x)); }
export function deleteMaterial(id: string) { saveMaterials(getMaterials().filter(x => x.id !== id)); }

// --- Transactions ---
export function getTransactions(): Transaction[] { return get<Transaction[]>(KEYS.transactions, []); }
export function saveTransactions(txs: Transaction[]) { set(KEYS.transactions, txs); }
export function addTransaction(tx: Transaction) { const txs = getTransactions(); txs.push(tx); saveTransactions(txs); }

// --- Role ---
export function getRole(): UserRole { return get<UserRole>(KEYS.role, 'admin'); }
export function setRole(role: UserRole) { set(KEYS.role, role); }

// --- Low stock ---
export function getLowStockMaterials(): Material[] {
  return getMaterials().filter(m => m.quantity <= m.alertQuantity);
}

// --- Seed ---
export function seedData() {
  if (localStorage.getItem(KEYS.seeded)) return;

  const taxes: Tax[] = [
    { id: 'tax-1', name: 'VAT', percentage: 18, isDefault: true },
    { id: 'tax-2', name: 'Service Tax', percentage: 5, isDefault: false },
    { id: 'tax-3', name: 'Eco Cess', percentage: 2, isDefault: false },
  ];

  const materials: Material[] = [
    { id: 'mat-1', name: 'Portland Cement (50kg)', unitPrice: 350, quantity: 120, alertQuantity: 20, qrCode: 'CEM-001', taxIds: ['tax-1'], category: 'Cement', unit: 'bag' },
    { id: 'mat-2', name: 'TMT Steel Bars (12mm)', unitPrice: 65, quantity: 500, alertQuantity: 50, qrCode: 'STL-002', taxIds: ['tax-1', 'tax-2'], category: 'Steel', unit: 'kg' },
    { id: 'mat-3', name: 'River Sand', unitPrice: 45, quantity: 200, alertQuantity: 30, qrCode: 'SND-003', taxIds: ['tax-1'], category: 'Sand', unit: 'cft' },
    { id: 'mat-4', name: 'Red Bricks', unitPrice: 8, quantity: 5000, alertQuantity: 500, qrCode: 'BRK-004', taxIds: ['tax-1', 'tax-3'], category: 'Bricks', unit: 'piece' },
    { id: 'mat-5', name: 'Crushed Stone (20mm)', unitPrice: 35, quantity: 15, alertQuantity: 20, qrCode: 'AGG-005', taxIds: ['tax-1'], category: 'Aggregates', unit: 'cft' },
    { id: 'mat-6', name: 'PPC Cement (50kg)', unitPrice: 330, quantity: 80, alertQuantity: 15, qrCode: 'CEM-006', taxIds: ['tax-1'], category: 'Cement', unit: 'bag' },
    { id: 'mat-7', name: 'Binding Wire', unitPrice: 85, quantity: 10, alertQuantity: 10, qrCode: 'WIR-007', taxIds: ['tax-1', 'tax-2'], category: 'Steel', unit: 'kg' },
    { id: 'mat-8', name: 'M-Sand', unitPrice: 55, quantity: 150, alertQuantity: 25, qrCode: 'SND-008', taxIds: ['tax-1'], category: 'Sand', unit: 'cft' },
  ];

  // Seed some transactions for analytics
  const now = new Date();
  const transactions: Transaction[] = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const numItems = Math.floor(Math.random() * 3) + 1;
    const items = [];
    let subtotal = 0, totalTax = 0;
    for (let j = 0; j < numItems; j++) {
      const mat = materials[Math.floor(Math.random() * materials.length)];
      const qty = Math.floor(Math.random() * 10) + 1;
      const matTaxes = taxes.filter(t => mat.taxIds.includes(t.id));
      const taxDetails = matTaxes.map(t => ({ name: t.name, percentage: t.percentage, amount: Math.round(mat.unitPrice * qty * t.percentage / 100 * 100) / 100 }));
      const itemTax = taxDetails.reduce((s, t) => s + t.amount, 0);
      const itemTotal = mat.unitPrice * qty + itemTax;
      subtotal += mat.unitPrice * qty;
      totalTax += itemTax;
      items.push({ materialId: mat.id, materialName: mat.name, quantity: qty, unitPrice: mat.unitPrice, taxes: taxDetails, total: Math.round(itemTotal * 100) / 100 });
    }
    transactions.push({ id: `tx-seed-${i}`, items, subtotal: Math.round(subtotal * 100) / 100, totalTax: Math.round(totalTax * 100) / 100, totalPrice: Math.round((subtotal + totalTax) * 100) / 100, date: date.toISOString(), soldBy: Math.random() > 0.5 ? 'admin' : 'sales' });
  }

  saveTaxes(taxes);
  saveMaterials(materials);
  saveTransactions(transactions);
  localStorage.setItem(KEYS.seeded, 'true');
}
