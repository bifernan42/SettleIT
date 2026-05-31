import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FormValues = { baseCost: number };

interface Props {
  defaultValues?: Partial<FormValues>;
  onSubmit: (v: FormValues) => void;
  loading?: boolean;
}

export default function ExaminationForm({ defaultValues, onSubmit, loading }: Props) {
  const { register, handleSubmit, reset } = useForm<FormValues>({ defaultValues });
  useEffect(() => { reset(defaultValues); }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-2">
      <div className="grid gap-1.5">
        <Label>Coût de base (€)</Label>
        <Input
          type="number"
          step="0.01"
          min={0}
          placeholder="150.00"
          {...register('baseCost', { required: true, valueAsNumber: true })}
        />
        <p className="text-xs text-muted-foreground">
          Montant avant application du taux de remboursement patient.
        </p>
      </div>
      <Button type="submit" disabled={loading} className="mt-2">
        {loading ? 'Enregistrement…' : 'Enregistrer'}
      </Button>
    </form>
  );
}
