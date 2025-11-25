'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';
import Sidebar from '@/components/Sidebar';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    const res = await fetch('/api/invoices');
    if (res.ok) setInvoices(await res.json());
  };

  const handleDownloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/invoices/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });

      if (!res.ok) throw new Error('Failed to generate PDF');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${invoiceNumber}.pdf`;
      a.click();

      toast({ title: 'PDF downloaded successfully' });
    } catch (error) {
      toast({ title: 'Error generating PDF', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    inv.company.name.toLowerCase().includes(search.toLowerCase()) ||
    inv.client.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Invoice History</h1>

        <Card>
          <CardHeader>
            <CardTitle>All Invoices</CardTitle>
            <Input
              placeholder="Search by invoice number, company, or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-4"
            />
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Invoice #</th>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Company</th>
                    <th className="text-left p-4">Client</th>
                    <th className="text-left p-4">Province</th>
                    <th className="text-right p-4">Total</th>
                    <th className="text-right p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-gray-50">
                      <td className="p-4 font-semibold">{invoice.invoiceNumber}</td>
                      <td className="p-4">{new Date(invoice.date).toLocaleDateString()}</td>
                      <td className="p-4">{invoice.company.name}</td>
                      <td className="p-4">{invoice.client.name}</td>
                      <td className="p-4">{invoice.province}</td>
                      <td className="p-4 text-right font-semibold">${invoice.total.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownloadPDF(invoice.id, invoice.invoiceNumber)}
                          disabled={loading}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredInvoices.length === 0 && (
                <div className="text-center py-8 text-gray-500">No invoices found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}
