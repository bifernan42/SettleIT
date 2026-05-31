import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { usePatientExaminationsControllerFindAll } from '@/api/generated/patient-examinations/patient-examinations';
import { usePaymentRequestsControllerFindAll } from '@/api/generated/payment-requests/payment-requests';

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  FULFILLED: 'Réglées',
  DELIVERY_FAILED: "Échecs d'envoi",
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-white shadow-sm p-6">
      <h2 className="font-semibold text-base mb-4">{title}</h2>
      <div className="h-72">{children}</div>
    </section>
  );
}

export default function AnalyticsPage() {
  const { data: visites } = usePatientExaminationsControllerFindAll();
  const { data: relances } = usePaymentRequestsControllerFindAll();

  const visitesArr = ((visites as unknown) as any[]) ?? [];
  const relancesArr = ((relances as unknown) as any[]) ?? [];

  // Pie — relances par statut
  const statusData = ['PENDING', 'FULFILLED', 'DELIVERY_FAILED'].map((s) => ({
    name: STATUS_LABELS[s],
    value: relancesArr.filter((r) => r.status === s).length,
  }));

  // Bar — euros dus vs recouvrés
  const outOfPocket = (r: any) => {
    const pe = r.patientExamination;
    if (!pe?.examination || !pe?.patient) return 0;
    return pe.examination.baseCost * (1 - pe.patient.coverageRate);
  };
  const eurosData = [
    {
      name: 'Montants',
      Dus: relancesArr
        .filter((r) => r.status === 'PENDING')
        .reduce((s, r) => s + outOfPocket(r), 0),
      Recouvrés: relancesArr
        .filter((r) => r.status === 'FULFILLED')
        .reduce((s, r) => s + outOfPocket(r), 0),
    },
  ];

  // Bar — visites par mois (12 derniers mois)
  const monthFmt = (d: Date) =>
    d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
  const months: { key: string; label: string; count: number }[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthFmt(d), count: 0 });
  }
  for (const v of visitesArr) {
    if (!v.date) continue;
    const d = new Date(v.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const m = months.find((mm) => mm.key === key);
    if (m) m.count += 1;
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📊 Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Vue d'ensemble de l'activité de relance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Relances par statut">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {statusData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Reste à charge (€)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={eurosData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(v) =>
                  Number(v).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })
                }
              />
              <Legend />
              <Bar dataKey="Dus" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Recouvrés" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Visites enregistrées par mois">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={months}>
            <XAxis dataKey="label" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" name="Visites" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
