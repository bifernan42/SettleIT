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
      header: 'Identifiant',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">{row.original.id.slice(0, 12)}</span>
      ),
    },
    {
      accessorKey: 'baseCost',
      header: 'Coût de base',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.baseCost.toFixed(2)} €</span>
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
