import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Slider } from '@/components/ui/slider';
import {
  getSettingsControllerGetPolicyQueryKey,
  useSettingsControllerGetPolicy,
  useSettingsControllerUpdatePolicy,
} from '@/api/generated/settings/settings';

type Policy = { minDelayDays: number; maxVisitAgeDays: number };

export default function PolicyRules() {
  const qc = useQueryClient();
  const { data } = useSettingsControllerGetPolicy();
  const update = useSettingsControllerUpdatePolicy({
    mutation: {
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: getSettingsControllerGetPolicyQueryKey() }),
    },
  });

  const policy = data as unknown as Policy | undefined;

  const [minDelayDays, setMinDelayDays] = useState(7);
  const [maxVisitAgeYears, setMaxVisitAgeYears] = useState(2);

  useEffect(() => {
    if (policy) {
      setMinDelayDays(policy.minDelayDays);
      setMaxVisitAgeYears(Math.round(policy.maxVisitAgeDays / 365));
    }
  }, [policy?.minDelayDays, policy?.maxVisitAgeDays]);

  const commit = (patch: Partial<Policy>) => update.mutate({ data: patch });

  return (
    <section className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b bg-gray-50/50">
        <h2 className="font-semibold text-base">Règles de relance</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Ces règles encadrent automatiquement les relances envoyées aux patients.
        </p>
      </div>
      <div className="p-6 space-y-8">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Délai minimum entre deux relances
            </label>
            <span className="text-sm font-semibold text-primary">
              {minDelayDays} jour{minDelayDays > 1 ? 's' : ''}
            </span>
          </div>
          <Slider
            min={1}
            max={30}
            value={minDelayDays}
            onValueChange={setMinDelayDays}
            onValueCommit={(v) => commit({ minDelayDays: v })}
          />
          <p className="text-xs text-muted-foreground">
            Sert aussi de délai d'attente avant de re-contacter un patient déjà relancé.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              Âge maximum d'une visite relançable
            </label>
            <span className="text-sm font-semibold text-primary">
              {maxVisitAgeYears} an{maxVisitAgeYears > 1 ? 's' : ''}
            </span>
          </div>
          <Slider
            min={1}
            max={5}
            value={maxVisitAgeYears}
            onValueChange={setMaxVisitAgeYears}
            onValueCommit={(v) => commit({ maxVisitAgeDays: v * 365 })}
          />
          <p className="text-xs text-muted-foreground">
            Au-delà, un patient ne peut plus être contacté pour cette visite.
          </p>
        </div>
      </div>
    </section>
  );
}
