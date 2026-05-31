import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getPatientsControllerFindAllQueryKey,
  usePatientsControllerCreate,
  usePatientsControllerFindAll,
} from '@/api/generated/patients/patients';
import { useExaminationsControllerFindAll } from '@/api/generated/examinations/examinations';
import PatientForm from '../patients/PatientForm';
import type { PatientRow } from '../patients/columns';

type FormValues = { patientId: string; examinationId: string; date: string };

interface Props {
  defaultValues?: Partial<FormValues>;
  onSubmit: (v: FormValues) => void;
  loading?: boolean;
}

export default function PatientExaminationForm({ defaultValues, onSubmit, loading }: Props) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({ defaultValues });
  useEffect(() => { reset(defaultValues); }, [defaultValues, reset]);

  const { data: patients } = usePatientsControllerFindAll();
  const { data: examinations } = useExaminationsControllerFindAll();
  const createPatient = usePatientsControllerCreate();

  const [newPatientOpen, setNewPatientOpen] = useState(false);

  const patientsList = (patients as unknown as PatientRow[]) ?? [];
  const examinationsList = (examinations as unknown as { id: string; baseCost: number }[]) ?? [];

  const selectedPatientId = watch('patientId');
  const selectedExamId = watch('examinationId');

  const handleCreatePatient = (values: Omit<PatientRow, 'id'>) => {
    createPatient.mutate(
      { data: values },
      {
        onSuccess: (newPatient: any) => {
          qc.invalidateQueries({ queryKey: getPatientsControllerFindAllQueryKey() });
          setValue('patientId', newPatient.id);
          setNewPatientOpen(false);
        },
      },
    );
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
        {/* Patient */}
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between">
            <Label>Patient</Label>
            <button
              type="button"
              onClick={() => setNewPatientOpen(true)}
              className="text-xs text-primary hover:underline font-medium"
            >
              + Nouveau patient
            </button>
          </div>
          <Select
            value={selectedPatientId ?? ''}
            onValueChange={(v) => setValue('patientId', v ?? '')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un patient" />
            </SelectTrigger>
            <SelectContent>
              {patientsList.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.surname} {p.name}
                  {p.email ? ` — ${p.email}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" {...register('patientId', { required: true })} />
        </div>

        {/* Examen */}
        <div className="grid gap-1.5">
          <Label>Type d'examen</Label>
          <Select
            value={selectedExamId ?? ''}
            onValueChange={(v) => setValue('examinationId', v ?? '')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un examen" />
            </SelectTrigger>
            <SelectContent>
              {examinationsList.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  Examen — {e.baseCost.toFixed(2)} €
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" {...register('examinationId', { required: true })} />
        </div>

        {/* Date */}
        <div className="grid gap-1.5">
          <Label>Date de la visite</Label>
          <Input type="date" {...register('date', { required: true })} />
        </div>

        <Button type="submit" disabled={loading} className="mt-2">
          {loading ? 'Enregistrement…' : 'Enregistrer'}
        </Button>
      </form>

      {/* Dialog création de patient à la volée */}
      <Dialog open={newPatientOpen} onOpenChange={setNewPatientOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau patient</DialogTitle>
          </DialogHeader>
          <PatientForm
            onSubmit={handleCreatePatient}
            loading={createPatient.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
