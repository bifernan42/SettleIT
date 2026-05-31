import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { CampaignsService } from './campaigns.service';

const DAY_MS = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-05-31T12:00:00.000Z');

function daysAgo(days: number) {
  return new Date(NOW.getTime() - days * DAY_MS);
}

function patient(over: {
  id: string;
  visitDays: number;
  reminderDays?: number;
}) {
  return {
    id: over.id,
    name: 'A',
    surname: 'B',
    email: 'a@b.c',
    phoneNumber: '123',
    coverageRate: 0.5,
    examinations: [
      {
        date: daysAgo(over.visitDays),
        examination: { baseCost: 100 },
        paymentRequests:
          over.reminderDays !== undefined
            ? [{ date: daysAgo(over.reminderDays) }]
            : [],
      },
    ],
  };
}

describe('CampaignsService — eligibility', () => {
  let service: CampaignsService;
  let findMany: jest.Mock;

  beforeEach(async () => {
    findMany = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        { provide: PrismaService, useValue: { patient: { findMany } } },
        {
          provide: SettingsService,
          useValue: {
            getPolicy: jest
              .fn()
              .mockResolvedValue({ minDelayDays: 7, maxVisitAgeDays: 730 }),
          },
        },
      ],
    }).compile();
    service = module.get(CampaignsService);
  });

  it('excludes a patient whose visit is older than maxVisitAgeDays', async () => {
    findMany.mockResolvedValue([patient({ id: 'old', visitDays: 800 })]);
    const [r] = await service.eligibility(NOW);
    expect(r.eligible).toBe(false);
    expect(r.reason).toBe('Visite trop ancienne');
  });

  it('excludes a patient contacted within the cooldown window', async () => {
    findMany.mockResolvedValue([
      patient({ id: 'recent', visitDays: 30, reminderDays: 2 }),
    ]);
    const [r] = await service.eligibility(NOW);
    expect(r.eligible).toBe(false);
    expect(r.reason).toBe('Contacté récemment');
  });

  it('marks a clean patient eligible and computes out-of-pocket due', async () => {
    findMany.mockResolvedValue([
      patient({ id: 'ok', visitDays: 30, reminderDays: 90 }),
    ]);
    const [r] = await service.eligibility(NOW);
    expect(r.eligible).toBe(true);
    expect(r.reason).toBeUndefined();
    expect(r.outOfPocketDue).toBeCloseTo(50); // 100 * (1 - 0.5)
  });
});
