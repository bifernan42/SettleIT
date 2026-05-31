import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import PageHeader from '@/components/layout/PageHeader';
import {
  getPatientsControllerFindAllQueryKey,
  usePatientsControllerCreate,
  usePatientsControllerFindAll,
  usePatientsControllerRemove,
  usePatientsControllerUpdate,
} from '@/api/generated/patients/patients';
import PatientForm from './PatientForm';
import { buildColumns, type PatientRow } from './columns';

export default function PatientsPage() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: getPatientsControllerFindAllQueryKey() });

  const { data, isLoading } = usePatientsControllerFindAll();
  const create = usePatientsControllerCreate({ mutation: { onSuccess: invalidate } });
  const update = usePatientsControllerUpdate({ mutation: { onSuccess: invalidate } });
  const remove = usePatientsControllerRemove({ mutation: { onSuccess: invalidate } });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PatientRow | null>(null);
  const [deleting, setDeleting] = useState<PatientRow | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (row: PatientRow) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleSubmit = (values: Omit<PatientRow, 'id'>) => {
    if (editing) {
      update.mutate({ id: editing.id, data: values }, { onSuccess: () => setFormOpen(false) });
    } else {
      create.mutate({ data: values }, { onSuccess: () => setFormOpen(false) });
    }
  };

  const columns = buildColumns(openEdit, (row) => setDeleting(row));
  const rows = (data as PatientRow[] | undefined) ?? [];

  return (
    <>
      <PageHeader
        title="👥 Patients"
        action={<Button onClick={openCreate}>+ Nouveau patient</Button>}
      />
      <DataTable columns={columns} data={rows} isLoading={isLoading} />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le patient' : 'Nouveau patient'}</DialogTitle>
          </DialogHeader>
          <PatientForm
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
        title="Supprimer ce patient ?"
        description="Cette action est irréversible. Les visites associées à ce patient seront également supprimées."
      />
    </>
  );
}
