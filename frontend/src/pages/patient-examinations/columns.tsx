import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

export type PatientExaminationRow = {
  id: string;
  date: string;
  outOfPocketCost: number;
  patient: { name: string; surname: string };
  examination: { id: string; baseCost: number };
};

export function buildColumns(
  onEdit: (row: PatientExaminationRow) => void,
  onDelete: (row: PatientExaminationRow) => void,
): ColumnDef<PatientExaminationRow>[] {
  return [
    {
      header: 'Patient',
      cell: ({ row }) => `${row.original.patient.surname}, ${row.original.patient.name}`,
    },
    {
      header: 'Examination',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.examination.id.slice(0, 8)}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
    },
    {
      accessorKey: 'outOfPocketCost',
      header: 'Out-of-pocket',
      cell: ({ row }) => (
        <span className="font-medium">€{row.original.outOfPocketCost.toFixed(2)}</span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => onEdit(row.original)}>Edit</Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(row.original)}>Delete</Button>
        </div>
      ),
    },
  ];
}
