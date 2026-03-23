export interface Tax {
  id: string;
  name: string;
  percentage: number;
  isDefault: boolean;
}

export interface Material {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  alertQuantity: number;
  qrCode: string;
  taxIds: string[];
  category: string;
  unit: string;
}

export interface CartItem {
  material: Material;
  quantity: number;
}

export interface Transaction {
  id: string;
  items: {
    materialId: string;
    materialName: string;
    quantity: number;
    unitPrice: number;
    taxes: { name: string; percentage: number; amount: number }[];
    total: number;
  }[];
  subtotal: number;
  totalTax: number;
  totalPrice: number;
  date: string;
  soldBy: 'admin' | 'sales';
}

export type UserRole = 'admin' | 'sales';
