import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { 
  LayoutDashboard, 
  Kanban, 
  Sparkles, 
  Users, 
  Settings, 
  ShieldCheck,
  Lock
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      {/* Sidebar / Mobile Header */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex-shrink-0 flex flex-col">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center font-bold text-white shadow-sm">
              W
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-tight leading-tight">Lead Engine</h1>
              <span className="text-xs text-sky-400 font-mono">raj@d4f.me</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Active</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 flex-1">
          <Link 
            href="/" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-sky-400" />
            <span>Dashboard</span>
          </Link>
          <Link 
            href="/recommendations" 
            className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Outreach Queue</span>
            </div>
            <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-semibold">1/hr Autopilot</span>
          </Link>
          <Link 
            href="/pipeline" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Kanban className="w-4 h-4 text-indigo-400" />
            <span>Pipeline / Leads</span>
          </Link>
          <Link 
            href="/clients" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Clients & Support</span>
          </Link>
          <Link 
            href="/settings" 
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Markets & Settings</span>
          </Link>
        </nav>

        {/* Security & Reassurance footer */}
        <div className="p-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>Human-in-the-loop</span>
          </div>
          <p className="text-slate-500 text-[11px] leading-relaxed">
            Zero cold outreach sent without explicit review.
          </p>
          <div className="pt-2 border-t border-slate-800">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
