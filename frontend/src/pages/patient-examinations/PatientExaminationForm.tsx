import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePatientsControllerFindAll } from '@/api/generated/patients/patients';
import { useExaminationsControllerFindAll } from '@/api/generated/examinations/examinations';

type FormValues = { patientId: string; examinationId: string; date: string };

interface Props {
  defaultValues?: Partial<FormValues>;
  onSubmit: (v: FormValues) => void;
  loading?: boolean;
}

export default function PatientExaminationForm({ defaultValues, onSubmit, loading }: Props) {
  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({ defaultValues });
  useEffect(() => { reset(defaultValues); }, [defaultValues, reset]);

  const { data: patients } = usePatientsControllerFindAll();
  const { data: examinations } = useExaminationsControllerFindAll();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
      <div className="grid gap-1.5">
        <Label>Patient</Label>
        <Select
          onValueChange={(v) => setValue('patientId', v ?? '')}
          defaultValue={defaultValues?.patientId ?? ''}
        >
          <SelectTrigger><SelectValue placeholder="Select a patient" /></SelectTrigger>
          <SelectContent>
            {((patients as unknown as any[]) ?? []).map((p: any) => (
              <SelectItem key={p.id} value={p.id}>{p.surname}, {p.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" {...register('patientId', { required: true })} />
      </div>
      <div className="grid gap-1.5">
        <Label>Examination</Label>
        <Select
          onValueChange={(v) => setValue('examinationId', v ?? '')}
          defaultValue={defaultValues?.examinationId ?? ''}
        >
          <SelectTrigger><SelectValue placeholder="Select an examination" /></SelectTrigger>
          <SelectContent>
            {((examinations as unknown as any[]) ?? []).map((e: any) => (
              <SelectItem key={e.id} value={e.id}>{e.id.slice(0, 8)} — €{e.baseCost.toFixed(2)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" {...register('examinationId', { required: true })} />
      </div>
      <div className="grid gap-1.5">
        <Label>Date</Label>
        <Input type="date" {...register('date', { required: true })} />
      </div>
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? 'Saving…' : 'Save'}
      </Button>
    </form>
  );
}
