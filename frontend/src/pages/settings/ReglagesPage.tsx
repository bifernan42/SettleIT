import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import {
  getExaminationsControllerFindAllQueryKey,
  useExaminationsControllerCreate,
  useExaminationsControllerFindAll,
  useExaminationsControllerRemove,
  useExaminationsControllerUpdate,
} from '@/api/generated/examinations/examinations';
import ExaminationForm from '../examinations/ExaminationForm';
import { buildColumns, type ExaminationRow } from '../examinations/columns';

export default function ReglagesPage() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: getExaminationsControllerFindAllQueryKey() });

  const { data, isLoading } = useExaminationsControllerFindAll();
  const create = useExaminationsControllerCreate({ mutation: { onSuccess: invalidate } });
  const update = useExaminationsControllerUpdate({ mutation: { onSuccess: invalidate } });
  const remove = useExaminationsControllerRemove({ mutation: { onSuccess: invalidate } });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExaminationRow | null>(null);
  const [deleting, setDeleting] = useState<ExaminationRow | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (row: ExaminationRow) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleSubmit = (values: { baseCost: number }) => {
    if (editing) {
      update.mutate({ id: editing.id, data: values }, { onSuccess: () => setFormOpen(false) });
    } else {
      create.mutate({ data: values }, { onSuccess: () => setFormOpen(false) });
    }
  };

  const rows = (data as ExaminationRow[] | undefined) ?? [];

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">⚙️ Réglages</h1>
        <p className="text-muted-foreground mt-1">
          Configuration générale de l'application.
        </p>
      </div>

      {/* Section examens */}
      <section className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50/50">
          <div>
            <h2 className="font-semibold text-base">Types d'examens</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gérez les examens disponibles et leur coût de base (hors remboursement).
            </p>
          </div>
          <Button size="sm" onClick={openCreate}>
            + Ajouter
          </Button>
        </div>
        <div className="p-4">
          <DataTable columns={buildColumns(openEdit, setDeleting)} data={rows} isLoading={isLoading} />
        </div>
      </section>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'examen" : 'Nouvel examen'}</DialogTitle>
          </DialogHeader>
          <ExaminationForm
            defaultValues={editing ?? undefined}
            onSubmit={handleSubmit}
            loading={create.isPending || update.isPending}
          />
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
        title="Supprimer cet examen ?"
        description="Cette action est irréversible. Les visites associées à cet examen ne seront pas supprimées."
      />
    </div>
  );
}
