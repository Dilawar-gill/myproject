'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId?: string;
}

interface Company {
  id: string;
  name: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'USER'>('USER');
  const [companyId, setCompanyId] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    const res = await fetch('/api/companies');
    if (res.ok) setCompanies(await res.json());
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) setUsers(await res.json());
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role, companyId: role === 'USER' ? companyId : null }),
      });

      if (res.ok) {
        toast({ title: 'User created successfully' });
        setEmail('');
        setPassword('');
        setName('');
        setRole('USER');
        setCompanyId('');
        fetchUsers();
      } else {
        const data = await res.json();
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error creating user', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, userEmail: string) => {
    if (confirm(`Delete user ${userEmail}?`)) {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'User deleted' });
        fetchUsers();
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleAddUser} className="space-y-4 mb-8">
        <div className="grid grid-cols-5 gap-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'ADMIN' | 'USER')}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="USER">User (Limited)</option>
              <option value="ADMIN">Admin (Full Access)</option>
            </select>
          </div>
          {role === 'USER' && (
            <div className="space-y-2">
              <Label>Assign Company</Label>
              <select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                required
              >
                <option value="">Select Company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
          <strong>USER permissions:</strong> Can manage services, view only assigned company invoices<br/>
          <strong>ADMIN permissions:</strong> Full access to everything
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Add User'}
        </Button>
      </form>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold mb-4">Existing Users</h3>
        {users.map((user) => (
          <div key={user.id} className="p-4 border rounded-lg flex justify-between items-center">
            <div>
              <h4 className="font-semibold">{user.name}</h4>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-xs text-gray-500">
                {user.role}
                {user.companyId && ` - ${companies.find(c => c.id === user.companyId)?.name || 'Company'}`}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteUser(user.id, user.email)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
