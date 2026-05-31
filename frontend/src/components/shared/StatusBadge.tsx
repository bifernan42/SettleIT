import { Badge } from '@/components/ui/badge';

type Status = 'PENDING' | 'FULFILLED' | 'DELIVERY_FAILED';

const CONFIG: Record<Status, { label: string; className: string }> = {
  PENDING: { label: '⏳ En attente', className: 'bg-amber-100 text-amber-800 hover:bg-amber-100' },
  FULFILLED: { label: '✅ Réglé', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
  DELIVERY_FAILED: { label: "❌ Échec d'envoi", className: 'bg-red-100 text-red-800 hover:bg-red-100' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { label, className } = CONFIG[status] ?? CONFIG.PENDING;
  return <Badge className={className}>{label}</Badge>;
}
