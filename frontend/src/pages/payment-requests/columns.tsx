import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';

export type PaymentRequestRow = {
  id: string;
  date: string;
  status: 'PENDING' | 'FULFILLED' | 'DELIVERY_FAILED';
  patientExamination: {
    patient: { name: string; surname: string };
    examination: { baseCost: number };
  };
};

export function buildColumns(
  onFulfill: (row: PaymentRequestRow) => void,
): ColumnDef<PaymentRequestRow>[] {
  return [
    {
      header: 'Patient',
      cell: ({ row }) => {
        const p = row.original.patientExamination.patient;
        return (
          <span className="font-medium">
            {p.surname} {p.name}
          </span>
        );
      },
    },
    {
      header: 'Montant',
      cell: ({ row }) => (
        <span className="font-semibold text-amber-700">
          {row.original.patientExamination.examination.baseCost.toFixed(2)} €
        </span>
      ),
    },
    {
      accessorKey: 'date',
      header: "Date d'envoi",
      cell: ({ row }) =>
        new Date(row.original.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }),
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            size="sm"
            variant="outline"
            disabled={row.original.status !== 'PENDING'}
            onClick={() => onFulfill(row.original)}
          >
            ✅ Marquer réglé
          </Button>
        </div>
      ),
    },
  ];
}
