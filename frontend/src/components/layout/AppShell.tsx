import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

const mainNav = [
  { to: '/', label: 'Accueil', emoji: '🏠', end: true },
  { to: '/flows', label: 'Workflows', emoji: '🔀' },
  { to: '/visites', label: 'Visites', emoji: '🗓️' },
  { to: '/patients', label: 'Patients', emoji: '👥' },
  { to: '/relances', label: 'Relances', emoji: '💳' },
  { to: '/campagne', label: 'Campagne', emoji: '📤' },
  { to: '/analytics', label: 'Analytics', emoji: '📊' },
];

const bottomNav = [
  { to: '/reglages', label: 'Réglages', emoji: '⚙️' },
];

function NavItem({ to, label, emoji, end }: { to: string; label: string; emoji: string; end?: boolean }) {
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
      <span className="text-base leading-none">{emoji}</span>
      <span>{label}</span>
    </NavLink>
  );
}

export default function AppShell() {
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-56 shrink-0 border-r flex flex-col py-5 px-3">
        {/* Logo / titre */}
        <div className="px-3 mb-6">
          <p className="font-bold text-base tracking-tight text-foreground">SettleIT</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Gestion des relances patients</p>
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
