import { NavLink, Outlet } from 'react-router-dom';
import {
  Activity,
  BarChart2,
  CalendarDays,
  CreditCard,
  GitBranch,
  Home,
  Send,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mainNav = [
  { to: '/', label: 'Accueil', icon: Home, end: true },
  { to: '/flows', label: 'Workflows', icon: GitBranch },
  { to: '/visites', label: 'Visites', icon: CalendarDays },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/relances', label: 'Relances', icon: CreditCard },
  { to: '/campagne', label: 'Campagne', icon: Send },
  { to: '/analytics', label: 'Analytics', icon: BarChart2 },
];

const bottomNav = [
  { to: '/reglages', label: 'Réglages', icon: Settings },
];

function NavItem({
  to,
  label,
  icon: Icon,
  end,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
          isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )
      }
    >
      <Icon size={16} strokeWidth={1.75} />
      <span>{label}</span>
    </NavLink>
  );
}

export default function AppShell() {
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-56 shrink-0 border-r flex flex-col py-5 px-3">
        {/* Logo */}
        <div className="flex items-center gap-2 px-3 mb-6">
          <Activity size={18} strokeWidth={2} className="text-primary shrink-0" />
          <div>
            <p className="font-bold text-base tracking-tight text-foreground leading-none">SettleIT</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Relances patients</p>
          </div>
        </div>

        {/* Nav principale */}
        <nav className="flex flex-col gap-0.5 flex-1">
          {mainNav.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* Nav bas */}
        <div className="flex flex-col gap-0.5 border-t pt-3 mt-3">
          {bottomNav.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
