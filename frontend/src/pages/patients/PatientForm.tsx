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
          <Label>Prénom</Label>
          <Input {...register('name', { required: true })} />
        </div>
        <div className="grid gap-1.5">
          <Label>Nom</Label>
          <Input {...register('surname', { required: true })} />
        </div>
      </div>
      <div className="grid gap-1.5">
        <Label>Email</Label>
        <Input type="email" {...register('email')} placeholder="patient@exemple.fr" />
      </div>
      <div className="grid gap-1.5">
        <Label>Téléphone</Label>
        <Input {...register('phoneNumber')} placeholder="+33 6 12 34 56 78" />
      </div>
      <div className="grid gap-1.5">
        <Label>Adresse</Label>
        <Input {...register('address')} placeholder="12 rue de la Paix, 75001 Paris" />
      </div>
      <div className="grid gap-1.5">
        <Label>Taux de remboursement (0 à 1)</Label>
        <Input
          type="number"
          step="0.01"
          min={0}
          max={1}
          placeholder="0.70"
          {...register('coverageRate', { required: true, valueAsNumber: true })}
        />
        <p className="text-xs text-muted-foreground">
          Ex : 0.70 = 70 % pris en charge. Le reste à charge est calculé automatiquement.
        </p>
      </div>
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? 'Enregistrement…' : 'Enregistrer'}
      </Button>
    </form>
  );
}
