'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        // Store token in localStorage as backup
        localStorage.setItem('auth_token', data.token);
        toast({ title: 'Login successful' });
        // Small delay to ensure cookie is set
        setTimeout(() => {
          window.location.href = '/';
        }, 100);
      } else {
        const data = await res.json();
        toast({ title: 'Login failed', description: data.error || 'Invalid credentials', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Connection failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F4C3C 0%, #06D6A0 100%)' }}>
      {/* Geometric Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-400 rounded-full blur-3xl"></div>
      </div>
      
      <Card className="w-full max-w-md shadow-2xl border-0 relative z-10">
        <CardHeader className="text-center pb-8 pt-10">
          <div className="mx-auto mb-6">
            <img src="/logo.png" alt="Buzz Plus Solutions" className="h-24 w-auto mx-auto" />
          </div>
          <CardTitle className="text-3xl font-bold" style={{ fontFamily: 'Montserrat, sans-serif', color: '#0F4C3C' }}>Buzz Plus Solutions</CardTitle>
          <p className="text-sm mt-2" style={{ color: '#666', fontFamily: 'Lato, sans-serif' }}>Invoice Management System</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full text-white font-semibold rounded-lg shadow-lg transition-all hover:shadow-xl" 
              style={{ 
                background: 'linear-gradient(135deg, #0F4C3C 0%, #06D6A0 100%)',
                fontFamily: 'Montserrat, sans-serif'
              }}
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <div className="text-center mt-4">
              <a href="#" className="text-sm hover:underline" style={{ color: '#FFD166', fontFamily: 'Lato, sans-serif' }}>Forgot Password?</a>
            </div>
            <p className="text-xs text-center mt-4" style={{ color: '#999', fontFamily: 'Lato, sans-serif' }}>
              Default: admin@example.com / admin123
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
