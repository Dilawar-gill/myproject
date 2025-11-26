'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Company, Service, InvoiceItem, Province, TAX_RATES } from '@/types';
import { Trash2, Plus } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

/**
 * Home Page - Invoice Creation
 * Protected route - requires authentication
 * Middleware will redirect to /login if not authenticated
 */
export default function InvoicePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [clientInfo, setClientInfo] = useState({ name: '', address: '', phone: '', email: '' });
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  /**
   * Check authentication status on mount
   * This is a client-side check in addition to middleware protection
   */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          setIsAuthenticated(true);
          // User is authenticated, fetch data
          fetchCompanies();
          fetchServices();
        } else {
          // Not authenticated, middleware will redirect
          router.replace('/login');
        }
      } catch (error) {
        router.replace('/login');
      }
    };
    checkAuth();
  }, [router]);

  const fetchCompanies = async () => {
    const res = await fetch('/api/companies');
    if (res.ok) setCompanies(await res.json());
  };

  const fetchServices = async () => {
    const res = await fetch('/api/services');
    if (res.ok) setServices(await res.json());
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, discount: 0, totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Calculate total price: (unitPrice - discount) * quantity
    const item = newItems[index];
    item.totalPrice = (item.unitPrice - item.discount) * item.quantity;
    
    setItems(newItems);
  };

  const selectService = (index: number, serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        description: service.nameEn,
        unitPrice: service.defaultPrice,
      };
      // Recalculate total
      const item = newItems[index];
      item.totalPrice = (item.unitPrice - item.discount) * item.quantity;
      setItems(newItems);
    }
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const taxRate = selectedCompany ? TAX_RATES[selectedCompany.province].rate : 0;
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  const handleGeneratePDF = async () => {
    if (!selectedCompany || items.length === 0) {
      toast({ title: 'Please select a company and add items', variant: 'destructive' });
      return;
    }

    // Validate items have descriptions
    const invalidItems = items.filter(item => !item.description || item.description.trim() === '');
    if (invalidItems.length > 0) {
      toast({ title: 'Please add descriptions for all items', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      console.log('[INVOICE] Sending items:', JSON.stringify(items, null, 2));
      
      // First create the invoice
      const invoiceRes = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: selectedCompany.id,
          client: clientInfo,
          province: selectedCompany.province,
          items,
          subtotal,
          taxRate,
          taxAmount,
          total,
          notes,
        }),
      });

      if (!invoiceRes.ok) throw new Error('Failed to create invoice');
      
      const invoice = await invoiceRes.json();

      // Generate PDF
      const pdfRes = await fetch('/api/invoices/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });

      if (!pdfRes.ok) throw new Error('Failed to generate PDF');

      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoice.invoiceNumber}.pdf`;
      a.click();

      toast({ title: 'Invoice created and PDF generated' });
      
      // Reset form
      setItems([]);
      setClientInfo({ name: '', address: '', phone: '', email: '' });
      setNotes('');
    } catch (error) {
      toast({ title: 'Error generating invoice', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Create Invoice</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label>Select Company</Label>
                <Select onValueChange={(id) => setSelectedCompany(companies.find(c => c.id === id) || null)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name} ({company.province})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCompany && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold">{selectedCompany.name}</p>
                    <p className="text-sm">{selectedCompany.address}</p>
                    <p className="text-sm">{selectedCompany.phone}</p>
                    <p className="text-sm">{selectedCompany.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input value={clientInfo.name} onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={clientInfo.phone} onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Address</Label>
                  <Input value={clientInfo.address} onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={clientInfo.email} onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-3">Quick Add Services</h3>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((service) => (
                    <label key={service.id} className="flex items-center gap-2 p-2 hover:bg-blue-100 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          if (e.target.checked) {
                            setItems([...items, {
                              description: service.nameEn,
                              quantity: 1,
                              unitPrice: service.defaultPrice,
                              discount: 0,
                              totalPrice: service.defaultPrice
                            }]);
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{service.nameEn} - ${service.defaultPrice}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start p-4 border rounded-lg">
                    <div className="col-span-4 space-y-2">
                      <Label>Description</Label>
                      <Input 
                        value={item.description} 
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        placeholder="Enter description or select service below"
                      />
                      <Select onValueChange={(id) => selectService(index, id)}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Quick select service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.nameEn} - ${service.defaultPrice}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Quantity</Label>
                      <Input type="number" step="0.01" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Unit Price</Label>
                      <Input type="number" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Discount</Label>
                      <Input type="number" step="0.01" value={item.discount} onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div className="col-span-1 space-y-2">
                      <Label>Total</Label>
                      <p className="text-lg font-semibold">${item.totalPrice.toFixed(2)}</p>
                    </div>
                    <div className="col-span-1">
                      <Button variant="destructive" size="icon" onClick={() => removeItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button onClick={addItem} variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Add Item
                </Button>
              </div>

              <div className="mt-6 space-y-2 border-t pt-4">
                <div className="flex justify-between text-lg">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span>Tax ({selectedCompany ? TAX_RATES[selectedCompany.province].name : ''} - {(taxRate * 100).toFixed(2)}%):</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes or payment instructions..." rows={4} />
            </CardContent>
          </Card>

          <Button onClick={handleGeneratePDF} disabled={loading} size="lg" className="w-full">
            {loading ? 'Generating...' : 'Generate Invoice & PDF'}
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}
