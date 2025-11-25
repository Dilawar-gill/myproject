export type Province = 'ON' | 'QC' | 'NB' | 'NS';

export interface Company {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  province: Province;
}

export interface Service {
  id: string;
  nameEn: string;
  nameFr?: string;
  defaultPrice: number;
  category: 'CORE' | 'ADDITIONAL';
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  date: Date;
  dueDate?: Date;
  companyId: string;
  clientId: string;
  province: Province;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  notes?: string;
  items: InvoiceItem[];
}

// Tax rates by province (HST/GST+PST)
export const TAX_RATES: Record<Province, { rate: number; name: string; nameFr: string }> = {
  ON: { rate: 0.13, name: 'HST', nameFr: 'TVH' },
  QC: { rate: 0.14975, name: 'GST+QST', nameFr: 'TPS+TVQ' },
  NB: { rate: 0.15, name: 'HST', nameFr: 'TVH' },
  NS: { rate: 0.15, name: 'HST', nameFr: 'TVH' },
};
