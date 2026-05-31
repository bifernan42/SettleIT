import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

export type PatientExaminationRow = {
  id: string;
  date: string;
  outOfPocketCost: number;
  patient: { id: string; name: string; surname: string };
  examination: { id: string; baseCost: number };
};

export function buildColumns(
  onEdit: (row: PatientExaminationRow) => void,
  onDelete: (row: PatientExaminationRow) => void,
): ColumnDef<PatientExaminationRow>[] {
  return [
    {
      header: 'Patient',
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.patient.surname} {row.original.patient.name}
        </span>
      ),
    },
    {
      header: 'Examen',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.examination.baseCost.toFixed(2)} € base
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) =>
        new Date(row.original.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
    },
    {
      accessorKey: 'outOfPocketCost',
      header: 'Reste à charge',
      cell: ({ row }) => (
        <span className="font-semibold text-amber-700">
          {row.original.outOfPocketCost.toFixed(2)} €
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>
            Modifier
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>
            Supprimer
          </Button>
        </div>
      ),
    },
  ];
}
