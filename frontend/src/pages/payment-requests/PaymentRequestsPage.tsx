import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/shared/DataTable';
import PageHeader from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import {
  getPaymentRequestsControllerFindAllQueryKey,
  usePaymentRequestsControllerFindAll,
  usePaymentRequestsControllerFulfill,
} from '@/api/generated/payment-requests/payment-requests';
import { buildColumns, type PaymentRequestRow } from './columns';

const STATUS_TABS = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Fulfilled', value: 'FULFILLED' },
  { label: 'Failed', value: 'DELIVERY_FAILED' },
] as const;

type StatusFilter = (typeof STATUS_TABS)[number]['value'];

export default function PaymentRequestsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(undefined);

  const { data, isLoading } = usePaymentRequestsControllerFindAll(
    statusFilter ? { status: statusFilter as any } : undefined,
  );

  const fulfill = usePaymentRequestsControllerFulfill({
    mutation: {
      onSuccess: () =>
        qc.invalidateQueries({ queryKey: getPaymentRequestsControllerFindAllQueryKey() }),
    },
  });

  const rows = (data as PaymentRequestRow[] | undefined) ?? [];

  return (
    <>
      <PageHeader title="Payment requests" />

      <div className="flex gap-2 mb-4">
        {STATUS_TABS.map(({ label, value }) => (
          <Button
            key={label}
            size="sm"
            variant={statusFilter === value ? 'default' : 'outline'}
            onClick={() => setStatusFilter(value)}
          >
            {label}
          </Button>
        ))}
      </div>

      <DataTable
        columns={buildColumns((row) => fulfill.mutate({ id: row.id }))}
        data={rows}
        isLoading={isLoading}
      />
    </>
  );
}
