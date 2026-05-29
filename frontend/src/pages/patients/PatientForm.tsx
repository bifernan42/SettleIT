import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PatientRow } from './columns';

type FormValues = Omit<PatientRow, 'id'>;

interface PatientFormProps {
  defaultValues?: Partial<FormValues>;
  onSubmit: (values: FormValues) => void;
  loading?: boolean;
}

export default function PatientForm({ defaultValues, onSubmit, loading }: PatientFormProps) {
  const { register, handleSubmit, reset } = useForm<FormValues>({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1.5">
          <Label>First name</Label>
          <Input {...register('name', { required: true })} />
        </div>
        <div className="grid gap-1.5">
          <Label>Last name</Label>
          <Input {...register('surname', { required: true })} />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label>Email</Label>
        <Input type="email" {...register('email')} />
      </div>
      <div className="grid gap-1.5">
        <Label>Phone</Label>
        <Input {...register('phoneNumber')} />
      </div>
      <div className="grid gap-1.5">
        <Label>Address</Label>
        <Input {...register('address')} />
      </div>
      <div className="grid gap-1.5">
        <Label>Coverage rate (0–1)</Label>
        <Input
          type="number"
          step="0.01"
          min={0}
          max={1}
          {...register('coverageRate', { required: true, valueAsNumber: true })}
        />
      </div>
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? 'Saving…' : 'Save'}
      </Button>
    </form>
  );
}
