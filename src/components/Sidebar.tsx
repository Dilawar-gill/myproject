'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, FileText, Settings, LogOut, Receipt } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: '/', label: 'Create Invoice', icon: Home },
    { href: '/invoices', label: 'Invoice History', icon: FileText },
    { href: '/admin', label: 'Admin Panel', icon: Settings },
  ];

  const handleLogout = () => {
    document.cookie = 'invoice_token=; Max-Age=0; path=/';
    router.push('/login');
  };

  return (
    <div className="w-64 min-h-screen flex flex-col shadow-xl" style={{ background: '#0F4C3C' }}>
      <div className="p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Buzz Plus Solutions" className="h-10 w-auto" />
          <div>
            <h1 className="text-lg font-bold text-white" style={{ fontFamily: 'Montserrat, sans-serif' }}>Buzz Plus</h1>
            <p className="text-xs" style={{ color: '#FFD166', fontFamily: 'Lato, sans-serif' }}>Solutions</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                isActive 
                  ? 'text-white shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
              style={isActive ? { background: '#06D6A0' } : {}}
              onMouseEnter={(e) => !isActive && (e.currentTarget.style.background = 'rgba(6, 214, 160, 0.1)')}
              onMouseLeave={(e) => !isActive && (e.currentTarget.style.background = 'transparent')}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-gray-300 hover:text-white transition-all"
          style={{ fontFamily: 'Lato, sans-serif' }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#EF476F'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
