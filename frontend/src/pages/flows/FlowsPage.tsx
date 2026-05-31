import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DataTable } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import PageHeader from '@/components/layout/PageHeader';
import { useForm } from 'react-hook-form';
import {
  getReminderFlowsControllerFindAllQueryKey,
  useReminderFlowsControllerCreate,
  useReminderFlowsControllerFindAll,
  useReminderFlowsControllerRemove,
} from '@/api/generated/reminder-flows/reminder-flows';

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

  const columns: ColumnDef<FlowRow>[] = [
    {
      accessorKey: 'name',
      header: 'Nom du workflow',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Statut',
      cell: ({ row }) =>
        row.original.isActive ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
            ✅ Actif
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-500">
            Inactif
          </span>
        ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/flows/${row.original.id}`)}
          >
            ✏️ Éditer
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setDeleting(row.original)}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="🔀 Workflows de relance"
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
      <DataTable columns={columns} data={rows} isLoading={isLoading} />

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
