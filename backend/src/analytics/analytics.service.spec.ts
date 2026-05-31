import { Test, TestingModule } from '@nestjs/testing';
import { PaymentRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AnalyticsService } from './analytics.service';

function request(over: {
  status: PaymentRequestStatus;
  flowId: string;
  flowName: string;
  channel: string;
  baseCost?: number;
  coverageRate?: number;
}) {
  return {
    status: over.status,
    flowNode: {
      settings: { channel: over.channel },
      flow: { id: over.flowId, name: over.flowName },
    },
    patientExamination: {
      patient: { coverageRate: over.coverageRate ?? 0.5 },
      examination: { baseCost: over.baseCost ?? 100 },
    },
  };
}

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let findMany: jest.Mock;

  beforeEach(async () => {
    findMany = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: { paymentRequest: { findMany } } },
      ],
    }).compile();
    service = module.get(AnalyticsService);
  });

  it('aggregates recovered money and fulfillment rate per flow and channel', async () => {
    findMany.mockResolvedValue([
      request({ status: PaymentRequestStatus.FULFILLED, flowId: 'f1', flowName: 'A', channel: 'email' }),
      request({ status: PaymentRequestStatus.PENDING, flowId: 'f1', flowName: 'A', channel: 'email' }),
      request({ status: PaymentRequestStatus.DELIVERY_FAILED, flowId: 'f2', flowName: 'B', channel: 'sms' }),
    ]);

    const s = await service.summary();

    expect(s.totals.recovered).toBeCloseTo(50);
    expect(s.totals.due).toBeCloseTo(50);
    expect(s.totals.fulfillmentRate).toBeCloseTo(0.5); // 1 fulfilled of 2 delivered

    const f1 = s.byFlow.find((f) => f.flowId === 'f1')!;
    expect(f1.recovered).toBeCloseTo(50);
    expect(f1.fulfillmentRate).toBeCloseTo(0.5);

    const email = s.byChannel.find((c) => c.channel === 'EMAIL')!;
    expect(email.fulfilled).toBe(1);
    expect(email.deliveryFailureRate).toBe(0);

    const sms = s.byChannel.find((c) => c.channel === 'SMS')!;
    expect(sms.deliveryFailureRate).toBe(1);
  });
});
