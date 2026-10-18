'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 text-xs text-slate-400 hover:text-red-400 transition-colors w-full px-3 py-2 rounded-lg hover:bg-slate-800"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>Lock Dashboard</span>
    </button>
  );
}
