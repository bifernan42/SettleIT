import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DataTable } from '@/components/shared/DataTable';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import PageHeader from '@/components/layout/PageHeader';
import {
  getPatientExaminationsControllerFindAllQueryKey,
  usePatientExaminationsControllerCreate,
  usePatientExaminationsControllerFindAll,
  usePatientExaminationsControllerRemove,
  usePatientExaminationsControllerUpdate,
} from '@/api/generated/patient-examinations/patient-examinations';
import PatientExaminationForm from './PatientExaminationForm';
import { buildColumns, type PatientExaminationRow } from './columns';

export default function PatientExaminationsPage() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: getPatientExaminationsControllerFindAllQueryKey() });

  const { data, isLoading } = usePatientExaminationsControllerFindAll();
  const create = usePatientExaminationsControllerCreate({ mutation: { onSuccess: invalidate } });
  const update = usePatientExaminationsControllerUpdate({ mutation: { onSuccess: invalidate } });
  const remove = usePatientExaminationsControllerRemove({ mutation: { onSuccess: invalidate } });

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PatientExaminationRow | null>(null);
  const [deleting, setDeleting] = useState<PatientExaminationRow | null>(null);

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (row: PatientExaminationRow) => { setEditing(row); setFormOpen(true); };

  const handleSubmit = (values: { patientId: string; examinationId: string; date: string }) => {
    const payload = { ...values, date: new Date(values.date).toISOString() };
    if (editing) {
      update.mutate({ id: editing.id, data: payload }, { onSuccess: () => setFormOpen(false) });
    } else {
      create.mutate({ data: payload }, { onSuccess: () => setFormOpen(false) });
    }
  };

  const rows = (data as PatientExaminationRow[] | undefined) ?? [];

  return (
    <>
      <PageHeader
        title="Patient visits"
        action={<Button onClick={openCreate}>Register visit</Button>}
      />
      <DataTable columns={buildColumns(openEdit, setDeleting)} data={rows} isLoading={isLoading} />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit visit' : 'Register visit'}</DialogTitle>
          </DialogHeader>
          <PatientExaminationForm
            defaultValues={editing ? {
              patientId: editing.patient as unknown as string,
              examinationId: editing.examination as unknown as string,
              date: editing.date.slice(0, 10),
            } : undefined}
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
