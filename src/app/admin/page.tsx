'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Company, Service, Province } from '@/types';
import Sidebar from '@/components/Sidebar';
import UserManagement from '@/components/UserManagement';

export default function AdminPanel() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    const res = await fetch('/api/auth/me');
    if (res.ok) setCurrentUser(await res.json());
  };

  const isAdmin = currentUser?.role === 'ADMIN';

  const [companyForm, setCompanyForm] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: '',
    province: 'ON' as Province,
  });

  const [serviceForm, setServiceForm] = useState({
    nameEn: '',
    nameFr: '',
    defaultPrice: 0,
    category: 'CORE' as 'CORE' | 'ADDITIONAL',
  });

  useEffect(() => {
    fetchCompanies();
    fetchServices();
  }, []);

  const fetchCompanies = async () => {
    const res = await fetch('/api/companies');
    if (res.ok) setCompanies(await res.json());
  };

  const fetchServices = async () => {
    const res = await fetch('/api/services');
    if (res.ok) setServices(await res.json());
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(companyForm),
      });
      if (res.ok) {
        toast({ title: 'Company saved successfully' });
        fetchCompanies();
        setCompanyForm({ name: '', address: '', phone: '', email: '', website: '', logo: '', province: 'ON' });
      }
    } catch (error) {
      toast({ title: 'Error saving company', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(serviceForm),
      });
      if (res.ok) {
        toast({ title: 'Service saved successfully' });
        fetchServices();
        setServiceForm({ nameEn: '', nameFr: '', defaultPrice: 0, category: 'CORE' });
      }
    } catch (error) {
      toast({ title: 'Error saving service', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleServiceUpdate = async (id: string, defaultPrice: number) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultPrice }),
      });
      if (res.ok) {
        toast({ title: 'Service updated' });
        fetchServices();
      }
    } catch (error) {
      toast({ title: 'Error updating service', variant: 'destructive' });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCompanyForm({ ...companyForm, logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        <Tabs defaultValue={isAdmin ? "companies" : "services"} className="space-y-4">
          <TabsList>
            {isAdmin && <TabsTrigger value="companies">Companies</TabsTrigger>}
            <TabsTrigger value="services">Services</TabsTrigger>
            {isAdmin && <TabsTrigger value="users">Users</TabsTrigger>}
          </TabsList>

          {isAdmin && <TabsContent value="companies">
            <Card>
              <CardHeader>
                <CardTitle>Company Management</CardTitle>
                <CardDescription>Add or update company information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCompanySubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Province</Label>
                      <Select value={companyForm.province} onValueChange={(v) => setCompanyForm({ ...companyForm, province: v as Province })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ON">Ontario</SelectItem>
                          <SelectItem value="QC">Quebec</SelectItem>
                          <SelectItem value="NB">New Brunswick</SelectItem>
                          <SelectItem value="NS">Nova Scotia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Address</Label>
                    <Input value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input type="email" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input value={companyForm.website} onChange={(e) => setCompanyForm({ ...companyForm, website: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <Input type="file" accept="image/*" onChange={handleLogoUpload} />
                    {companyForm.logo && <img src={companyForm.logo} alt="Logo preview" className="h-20 mt-2" />}
                  </div>
                  <Button type="submit" disabled={loading}>Save Company</Button>
                </form>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Existing Companies</h3>
                  <div className="space-y-2">
                    {companies.map((company) => (
                      <div key={company.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{company.name}</h4>
                            <p className="text-sm text-gray-600">{company.address}</p>
                            <p className="text-sm text-gray-600">{company.province}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {company.logo && <img src={company.logo} alt={company.name} className="h-12" />}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={async () => {
                                if (confirm(`Delete ${company.name}?`)) {
                                  const res = await fetch(`/api/companies/${company.id}`, { method: 'DELETE' });
                                  if (res.ok) {
                                    toast({ title: 'Company deleted' });
                                    fetchCompanies();
                                  }
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>}

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Service Management</CardTitle>
                <CardDescription>Add or update services and pricing</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleServiceSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Service Name (English)</Label>
                      <Input value={serviceForm.nameEn} onChange={(e) => setServiceForm({ ...serviceForm, nameEn: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Service Name (French)</Label>
                      <Input value={serviceForm.nameFr} onChange={(e) => setServiceForm({ ...serviceForm, nameFr: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Default Price ($)</Label>
                      <Input type="number" step="0.01" value={serviceForm.defaultPrice} onChange={(e) => setServiceForm({ ...serviceForm, defaultPrice: parseFloat(e.target.value) })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={serviceForm.category} onValueChange={(v) => setServiceForm({ ...serviceForm, category: v as 'CORE' | 'ADDITIONAL' })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CORE">Core Service</SelectItem>
                          <SelectItem value="ADDITIONAL">Additional Service</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" disabled={loading}>Add Service</Button>
                </form>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Existing Services</h3>
                  <div className="space-y-2">
                    {services.map((service) => (
                      <div key={service.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <div className="flex-1">
                          <h4 className="font-semibold">{service.nameEn}</h4>
                          {service.nameFr && <p className="text-sm text-gray-600">{service.nameFr}</p>}
                          <p className="text-xs text-gray-500">{service.category}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            defaultValue={service.defaultPrice}
                            className="w-24"
                            onBlur={(e) => handleServiceUpdate(service.id, parseFloat(e.target.value))}
                          />
                          <span className="text-sm">$</span>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              if (confirm(`Delete ${service.nameEn}?`)) {
                                const res = await fetch(`/api/services/${service.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  toast({ title: 'Service deleted' });
                                  fetchServices();
                                }
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {isAdmin && <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Add admin users with email authentication</CardDescription>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>}
        </Tabs>
      </div>
    </div>
    </div>
  );
}
