import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import PageHeader from '@/components/layout/PageHeader';
import {
  getExaminationsControllerFindAllQueryKey,
  useExaminationsControllerCreate,
  useExaminationsControllerFindAll,
  useExaminationsControllerRemove,
  useExaminationsControllerUpdate,
} from '@/api/generated/examinations/examinations';
import ExaminationForm from './ExaminationForm';
import { buildColumns, type ExaminationRow } from './columns';

export default function ExaminationsPage() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: getExaminationsControllerFindAllQueryKey() });

  const { data, isLoading } = useExaminationsControllerFindAll();
  const create = useExaminationsControllerCreate({ mutation: { onSuccess: invalidate } });
  const update = useExaminationsControllerUpdate({ mutation: { onSuccess: invalidate } });
  const remove = useExaminationsControllerRemove({ mutation: { onSuccess: invalidate } });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ExaminationRow | null>(null);
  const [deleting, setDeleting] = useState<ExaminationRow | null>(null);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (row: ExaminationRow) => { setEditing(row); setFormOpen(true); };

  const handleSubmit = (values: { baseCost: number }) => {
    if (editing) {
      update.mutate({ id: editing.id, data: values }, { onSuccess: () => setFormOpen(false) });
    } else {
      create.mutate({ data: values }, { onSuccess: () => setFormOpen(false) });
    }
  };

  const rows = (data as ExaminationRow[] | undefined) ?? [];

  return (
    <>
      <PageHeader
        title="Examinations"
        action={<Button onClick={openCreate}>New examination</Button>}
      />
      <DataTable columns={buildColumns(openEdit, setDeleting)} data={rows} isLoading={isLoading} />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit examination' : 'New examination'}</DialogTitle>
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
        onConfirm={() => deleting && remove.mutate({ id: deleting.id }, { onSuccess: () => setDeleting(null) })}
        loading={remove.isPending}
      />
    </>
  );
}
