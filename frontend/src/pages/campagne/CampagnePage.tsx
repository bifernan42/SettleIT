import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/layout/PageHeader';
import { usePatientsControllerFindAll } from '@/api/generated/patients/patients';
import { useReminderFlowsControllerFindAll } from '@/api/generated/reminder-flows/reminder-flows';

type Patient = { id: string; name: string; surname: string; email: string; phoneNumber: string };
type Flow = { id: string; name: string; isActive: boolean };

const selectClass =
  'w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring';

export default function CampagnePage() {
  const { data: patientsData } = usePatientsControllerFindAll();
  const { data: flowsData } = useReminderFlowsControllerFindAll();

  const patients = (patientsData as Patient[] | undefined) ?? [];
  const flows = (flowsData as Flow[] | undefined) ?? [];

  const [selectedFlowId, setSelectedFlowId] = useState('');
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());

  // Pré-sélectionner le workflow actif
  useEffect(() => {
    const active = flows.find((f) => f.isActive);
    if (active && !selectedFlowId) setSelectedFlowId(active.id);
  }, [flows, selectedFlowId]);

  const togglePatient = (id: string) => {
    setSelectedPatients((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedPatients.size === patients.length) {
      setSelectedPatients(new Set());
    } else {
      setSelectedPatients(new Set(patients.map((p) => p.id)));
    }
  };

  const handleLaunch = () => {
    const flow = flows.find((f) => f.id === selectedFlowId);
    toast.success(
      `Campagne lancée ! ${selectedPatients.size} patient(s) seront contactés via le workflow « ${flow?.name} ».`,
      { duration: 5000 },
    );
    setSelectedPatients(new Set());
  };

  const canLaunch = selectedFlowId && selectedPatients.size > 0;

  return (
    <>
      <PageHeader title="📤 Lancer une campagne de relance" />

      <div className="max-w-3xl space-y-8">
        {/* Étape 1 — Workflow */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
              1
            </span>
            <h2 className="font-semibold text-base">Choisir un workflow de relance</h2>
          </div>

          <select
            className={selectClass}
            value={selectedFlowId}
            onChange={(e) => setSelectedFlowId(e.target.value)}
          >
            <option value="">— Sélectionner un workflow —</option>
            {flows.map((f) => (
              <option key={f.id} value={f.id}>
                {f.isActive ? '✅ ' : ''}
                {f.name}
              </option>
            ))}
          </select>

          {flows.length === 0 && (
            <p className="mt-2 text-sm text-amber-600">
              ⚠️ Aucun workflow disponible. Créez-en un dans la section Workflows.
            </p>
          )}
        </section>

        {/* Étape 2 — Patients */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                2
              </span>
              <h2 className="font-semibold text-base">Sélectionner les patients</h2>
            </div>
            <button
              onClick={toggleAll}
              className="text-xs text-primary hover:underline font-medium"
            >
              {selectedPatients.size === patients.length ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
          </div>

          {patients.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun patient enregistré.</p>
          ) : (
            <div className="divide-y rounded-lg border overflow-hidden">
              {patients.map((p) => {
                const checked = selectedPatients.has(p.id);
                return (
                  <label
                    key={p.id}
                    className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${
                      checked ? 'bg-primary/5' : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded accent-primary"
                      checked={checked}
                      onChange={() => togglePatient(p.id)}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {p.surname} {p.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.email || "Pas d'email"} · {p.phoneNumber || "Pas de téléphone"}
                      </p>
                    </div>
                    {checked && (
                      <span className="text-xs text-primary font-medium">Sélectionné ✓</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}

          {selectedPatients.size > 0 && (
            <p className="mt-3 text-sm text-muted-foreground">
              {selectedPatients.size} patient(s) sélectionné(s)
            </p>
          )}
        </section>

        {/* Bouton lancer */}
        <div className="flex items-center gap-4">
          <Button
            size="lg"
            disabled={!canLaunch}
            onClick={handleLaunch}
            className="px-8"
          >
            📤 Lancer la campagne
          </Button>
          {!selectedFlowId && (
            <p className="text-sm text-muted-foreground">Sélectionnez un workflow.</p>
          )}
          {selectedFlowId && selectedPatients.size === 0 && (
            <p className="text-sm text-muted-foreground">Sélectionnez au moins un patient.</p>
          )}
        </div>
      </div>
    </>
  );
}
