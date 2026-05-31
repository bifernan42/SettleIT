import {
  Bar,
  BarChart,
  CartesianGrid,
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
import { useAnalyticsControllerSummary } from '@/api/generated/analytics/analytics';

// Vivid, explicit palette (also drives the --chart-* tokens in index.css).
const C = {
  blue: 'oklch(0.62 0.19 260)',
  green: 'oklch(0.7 0.17 162)',
  amber: 'oklch(0.77 0.16 70)',
  red: 'oklch(0.64 0.22 25)',
  purple: 'oklch(0.6 0.2 305)',
};
const FLOW_COLORS = [C.blue, C.purple, C.green, C.amber, C.red];
const CHANNEL_COLORS: Record<string, string> = {
  EMAIL: C.blue,
  SMS: C.green,
  WHATSAPP: C.amber,
  COURRIER: C.purple,
  AUTRE: C.red,
};
const CHANNEL_LABELS: Record<string, string> = {
  EMAIL: '📧 Email',
  SMS: '💬 SMS',
  WHATSAPP: '🟢 WhatsApp',
  COURRIER: '📮 Courrier',
  AUTRE: 'Autre',
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'En attente', color: C.amber },
  FULFILLED: { label: 'Réglées', color: C.green },
  DELIVERY_FAILED: { label: "Échecs d'envoi", color: C.red },
};

const euro = (n: number) =>
  n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
const pct = (n: number) => `${Math.round(n * 100)} %`;

type FlowPerf = {
  flowId: string;
  flowName: string;
  total: number;
  fulfilled: number;
  pending: number;
  failed: number;
  recovered: number;
  due: number;
  fulfillmentRate: number;
};
type ChannelPerf = {
  channel: string;
  total: number;
  fulfilled: number;
  failed: number;
  recovered: number;
  fulfillmentRate: number;
  deliveryFailureRate: number;
};
type Summary = {
  totals: { recovered: number; due: number; fulfillmentRate: number };
  byFlow: FlowPerf[];
  byChannel: ChannelPerf[];
};

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-white shadow-sm p-6">
      <h2 className="font-semibold text-base">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      <div className="h-72 mt-4">{children}</div>
    </section>
  );
}

function KpiCard({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border-2 p-5" style={{ borderColor: color }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold" style={{ color }}>
            {value}
          </p>
        </div>
        <span className="text-3xl">{emoji}</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: visites } = usePatientExaminationsControllerFindAll();
  const { data: relances } = usePaymentRequestsControllerFindAll();
  const { data: summaryData } = useAnalyticsControllerSummary();

  const visitesArr = ((visites as unknown) as any[]) ?? [];
  const relancesArr = ((relances as unknown) as any[]) ?? [];
  const summary = (summaryData as unknown) as Summary | undefined;

  const byFlow = summary?.byFlow ?? [];
  const byChannel = summary?.byChannel ?? [];
  const totals = summary?.totals ?? { recovered: 0, due: 0, fulfillmentRate: 0 };

  const bestFlow = byFlow[0];
  const bestChannel = [...byChannel].sort(
    (a, b) => b.fulfillmentRate - a.fulfillmentRate,
  )[0];

  // Pie — relances par statut
  const statusData = ['PENDING', 'FULFILLED', 'DELIVERY_FAILED'].map((s) => ({
    name: STATUS_META[s].label,
    value: relancesArr.filter((r) => r.status === s).length,
    color: STATUS_META[s].color,
  }));

  // Visites par mois (12 derniers mois)
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
    const m = months.find((mm) => mm.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (m) m.count += 1;
  }

  const flowChart = byFlow.map((f) => ({
    name: f.flowName,
    recovered: f.recovered,
    due: f.due,
  }));

  const channelChart = byChannel.map((c) => ({
    name: CHANNEL_LABELS[c.channel] ?? c.channel,
    channel: c.channel,
    Efficacité: Math.round(c.fulfillmentRate * 100),
    recovered: c.recovered,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">📊 Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Performance des relances : argent recouvré, efficacité des workflows et des canaux.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard emoji="💰" label="Total recouvré" value={euro(totals.recovered)} color={C.green} />
        <KpiCard emoji="⏳" label="Encore dû" value={euro(totals.due)} color={C.amber} />
        <KpiCard
          emoji="🎯"
          label="Taux de règlement"
          value={pct(totals.fulfillmentRate)}
          color={C.blue}
        />
        <KpiCard
          emoji="🏆"
          label="Canal le plus efficace"
          value={bestChannel ? (CHANNEL_LABELS[bestChannel.channel] ?? bestChannel.channel) : '—'}
          color={C.purple}
        />
      </div>

      {/* Flow le plus efficace — highlight */}
      {bestFlow && (
        <div
          className="flex items-center gap-3 rounded-lg px-4 py-3 border"
          style={{ borderColor: C.green, backgroundColor: 'oklch(0.7 0.17 162 / 0.08)' }}
        >
          <span className="text-2xl">🥇</span>
          <p className="text-sm">
            Workflow le plus rentable :{' '}
            <span className="font-bold">« {bestFlow.flowName} »</span> —{' '}
            {euro(bestFlow.recovered)} recouvrés, taux de règlement{' '}
            {pct(bestFlow.fulfillmentRate)}.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Argent recouvré / dû par flow */}
        <ChartCard title="Argent par workflow" subtitle="Recouvré vs encore dû (€)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={flowChart} layout="vertical" margin={{ left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => euro(Number(v))} />
              <Legend />
              <Bar dataKey="recovered" name="Recouvré" fill={C.green} radius={[0, 4, 4, 0]} />
              <Bar dataKey="due" name="Dû" fill={C.amber} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Efficacité par canal */}
        <ChartCard
          title="Efficacité par canal"
          subtitle="Taux de règlement après livraison (%)"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelChart}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => `${v} %`} />
              <Bar dataKey="Efficacité" radius={[4, 4, 0, 0]}>
                {channelChart.map((c, i) => (
                  <Cell key={i} fill={CHANNEL_COLORS[c.channel] ?? FLOW_COLORS[i % FLOW_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Relances par statut */}
        <ChartCard title="Relances par statut" subtitle="Répartition de toutes les relances">
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
                {statusData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Visites par mois */}
        <ChartCard title="Visites par mois" subtitle="12 derniers mois">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={months}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Visites" fill={C.blue} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Tableau récap par canal */}
      {byChannel.length > 0 && (
        <section className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50/50">
            <h2 className="font-semibold text-base">Détail par canal</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground border-b">
                <th className="px-6 py-2 font-medium">Canal</th>
                <th className="px-6 py-2 font-medium text-right">Envoyées</th>
                <th className="px-6 py-2 font-medium text-right">Réglées</th>
                <th className="px-6 py-2 font-medium text-right">Recouvré</th>
                <th className="px-6 py-2 font-medium text-right">Efficacité</th>
                <th className="px-6 py-2 font-medium text-right">Échec livraison</th>
              </tr>
            </thead>
            <tbody>
              {byChannel.map((c) => (
                <tr key={c.channel} className="border-b last:border-0">
                  <td className="px-6 py-2.5 font-medium">
                    {CHANNEL_LABELS[c.channel] ?? c.channel}
                  </td>
                  <td className="px-6 py-2.5 text-right">{c.total}</td>
                  <td className="px-6 py-2.5 text-right">{c.fulfilled}</td>
                  <td className="px-6 py-2.5 text-right font-medium" style={{ color: C.green }}>
                    {euro(c.recovered)}
                  </td>
                  <td className="px-6 py-2.5 text-right">{pct(c.fulfillmentRate)}</td>
                  <td className="px-6 py-2.5 text-right" style={{ color: C.red }}>
                    {pct(c.deliveryFailureRate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
