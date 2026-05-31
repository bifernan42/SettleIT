import { useNavigate } from 'react-router-dom';
import { usePatientExaminationsControllerFindAll } from '@/api/generated/patient-examinations/patient-examinations';
import { usePaymentRequestsControllerFindAll } from '@/api/generated/payment-requests/payment-requests';
import { useReminderFlowsControllerFindAll } from '@/api/generated/reminder-flows/reminder-flows';

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({
  emoji,
  label,
  value,
  color,
}: {
  emoji: string;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className={`rounded-xl border-2 ${color} p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
        <span className="text-3xl">{emoji}</span>
      </div>
    </div>
  );
}

// ─── Action card ─────────────────────────────────────────────────────────────

function ActionCard({
  emoji,
  title,
  description,
  onClick,
}: {
  emoji: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl border-2 border-transparent bg-white p-5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
    >
      <span className="text-3xl">{emoji}</span>
      <p className="mt-3 text-base font-semibold text-foreground group-hover:text-primary transition-colors">
        {title}
      </p>
      <p className="mt-1 text-sm text-muted-foreground leading-snug">{description}</p>
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate();

  const { data: visites } = usePatientExaminationsControllerFindAll();
  const { data: relances } = usePaymentRequestsControllerFindAll();
  const { data: flows } = useReminderFlowsControllerFindAll();

  const visitesArr = ((visites as unknown) as any[]) ?? [];
  const relancesArr = ((relances as unknown) as any[]) ?? [];
  const flowsArr = ((flows as unknown) as any[]) ?? [];

  const pendingCount = relancesArr.filter((r) => r.status === 'PENDING').length;
  const fulfilledCount = relancesArr.filter((r) => r.status === 'FULFILLED').length;
  const failedCount = relancesArr.filter((r) => r.status === 'DELIVERY_FAILED').length;
  const activeFlow = flowsArr.find((f) => f.isActive);

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">👋 Bienvenue sur SettleIT</h1>
        <p className="mt-1 text-muted-foreground">
          Gérez vos relances de reste à charge en quelques clics.
        </p>
      </div>

      {/* Workflow actif */}
      {activeFlow ? (
        <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
          <span className="text-xl">🔀</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-green-800">
              Workflow actif : <span className="font-bold">« {activeFlow.name} »</span>
            </p>
            <p className="text-xs text-green-700 mt-0.5">
              Ce workflow sera utilisé pour les prochaines campagnes de relance.
            </p>
          </div>
          <button
            onClick={() => navigate(`/flows/${activeFlow.id}`)}
            className="text-xs font-medium text-green-700 hover:text-green-900 underline underline-offset-2"
          >
            Modifier →
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
          <span className="text-xl">⚠️</span>
          <p className="text-sm text-amber-800 flex-1">
            Aucun workflow actif. Les campagnes de relance ne peuvent pas s'exécuter.
          </p>
          <button
            onClick={() => navigate('/flows')}
            className="text-xs font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2"
          >
            Configurer →
          </button>
        </div>
      )}

      {/* Stats */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Vue d'ensemble
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            emoji="🗓️"
            label="Visites enregistrées"
            value={visitesArr.length}
            color="border-blue-200 bg-blue-50/50"
          />
          <StatCard
            emoji="⏳"
            label="Relances en attente"
            value={pendingCount}
            color="border-amber-200 bg-amber-50/50"
          />
          <StatCard
            emoji="✅"
            label="Règlements confirmés"
            value={fulfilledCount}
            color="border-green-200 bg-green-50/50"
          />
          <StatCard
            emoji="❌"
            label="Échecs d'envoi"
            value={failedCount}
            color="border-red-200 bg-red-50/50"
          />
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <ActionCard
            emoji="🔀"
            title="Modifier le workflow"
            description="Éditez votre séquence de relances automatisées."
            onClick={() => navigate('/flows')}
          />
          <ActionCard
            emoji="🗓️"
            title="Enregistrer une visite"
            description="Déclarez un nouvel examen pour un patient."
            onClick={() => navigate('/visites')}
          />
          <ActionCard
            emoji="📤"
            title="Lancer une campagne"
            description="Envoyez des relances de paiement à vos patients."
            onClick={() => navigate('/campagne')}
          />
          <ActionCard
            emoji="💳"
            title="Voir les relances"
            description="Suivez et marquez les paiements reçus."
            onClick={() => navigate('/relances')}
          />
        </div>
      </section>
    </div>
  );
}
