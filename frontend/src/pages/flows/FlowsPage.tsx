import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import PageHeader from '@/components/layout/PageHeader';
import { useForm } from 'react-hook-form';
import {
  getReminderFlowsControllerFindAllQueryKey,
  useReminderFlowsControllerCreate,
  useReminderFlowsControllerFindAll,
  useReminderFlowsControllerRemove,
} from '@/api/generated/reminder-flows/reminder-flows';
import { FlowMiniPreview } from './FlowMiniPreview';

type FlowRow = { id: string; name: string; isActive: boolean };

export default function FlowsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: getReminderFlowsControllerFindAllQueryKey() });

  const { data, isLoading } = useReminderFlowsControllerFindAll();
  const create = useReminderFlowsControllerCreate({ mutation: { onSuccess: invalidate } });
  const remove = useReminderFlowsControllerRemove({ mutation: { onSuccess: invalidate } });

  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<FlowRow | null>(null);
  const { register, handleSubmit, reset } = useForm<{ name: string }>();

  const rows = (data as FlowRow[] | undefined) ?? [];

  return (
    <>
      <PageHeader
        title="Workflows de relance"
        action={
          <Button
            onClick={() => {
              reset();
              setFormOpen(true);
            }}
          >
            + Nouveau workflow
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-card shadow-sm overflow-hidden animate-pulse">
              <div className="h-44 bg-muted/40" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-3 w-16 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-muted-foreground text-sm">Aucun workflow créé.</p>
          <Button className="mt-4" onClick={() => { reset(); setFormOpen(true); }}>
            + Créer un workflow
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rows.map((flow) => (
            <div
              key={flow.id}
              className="rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <FlowMiniPreview flowId={flow.id} />

              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div>
                  <p className="font-semibold text-sm">{flow.name}</p>
                  {flow.isActive ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800 mt-1">
                      ● Actif
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground mt-1">
                      Inactif
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => navigate(`/flows/${flow.id}`)}>
                    Éditer
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleting(flow)}>
                    Supprimer
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau workflow de relance</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit((v) =>
              create.mutate({ data: v }, { onSuccess: () => setFormOpen(false) }),
            )}
            className="grid gap-4 py-2"
          >
            <div className="grid gap-1.5">
              <Label>Nom</Label>
              <Input
                {...register('name', { required: true })}
                placeholder="Ex : Email → SMS → Courrier"
              />
            </div>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? 'Création…' : 'Créer'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        onConfirm={() =>
          deleting &&
          remove.mutate({ id: deleting.id }, { onSuccess: () => setDeleting(null) })
        }
        loading={remove.isPending}
        title="Supprimer ce workflow ?"
        description="Cette action est irréversible. Le workflow sera définitivement supprimé."
      />
    </>
  );
}
