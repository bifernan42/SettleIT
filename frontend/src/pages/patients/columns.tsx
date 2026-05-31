import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

export type PatientRow = {
  id: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  address: string;
  coverageRate: number;
};

export function buildColumns(
  onEdit: (row: PatientRow) => void,
  onDelete: (row: PatientRow) => void,
): ColumnDef<PatientRow>[] {
  return [
    {
      header: 'Nom',
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.surname} {row.original.name}
        </span>
      ),
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phoneNumber', header: 'Téléphone' },
    {
      accessorKey: 'coverageRate',
      header: 'Remboursement',
      cell: ({ row }) => `${(row.original.coverageRate * 100).toFixed(0)} %`,
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
