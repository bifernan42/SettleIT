import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';

export type ExaminationRow = { id: string; baseCost: number };

export function buildColumns(
  onEdit: (row: ExaminationRow) => void,
  onDelete: (row: ExaminationRow) => void,
): ColumnDef<ExaminationRow>[] {
  return [
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.id.slice(0, 8)}</span>
      ),
    },
    {
      accessorKey: 'baseCost',
      header: 'Base cost',
      cell: ({ row }) => `€${row.original.baseCost.toFixed(2)}`,
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
