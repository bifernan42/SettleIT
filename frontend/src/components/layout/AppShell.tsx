import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';

const nav = [
  { to: '/patients', label: 'Patients' },
  { to: '/examinations', label: 'Examinations' },
  { to: '/patient-examinations', label: 'Visits' },
  { to: '/payment-requests', label: 'Payment requests' },
  { to: '/flows', label: 'Reminder flows' },
];

export default function AppShell() {
  return (
    <div className="flex h-screen bg-background">
      <aside className="w-56 shrink-0 border-r flex flex-col py-6 px-3 gap-1">
        <p className="px-3 mb-4 font-semibold text-sm tracking-tight">SettleIT</p>
        {nav.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </aside>
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
