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
      header: 'Name',
      cell: ({ row }) => `${row.original.surname}, ${row.original.name}`,
    },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'phoneNumber', header: 'Phone' },
    {
      accessorKey: 'coverageRate',
      header: 'Coverage',
      cell: ({ row }) => `${(row.original.coverageRate * 100).toFixed(0)}%`,
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
