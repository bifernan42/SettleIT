import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let upsert: jest.Mock;

  beforeEach(async () => {
    upsert = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: { reminderPolicy: { upsert } } },
      ],
    }).compile();
    service = module.get(SettingsService);
  });

  it('getPolicy upserts the singleton with defaults', async () => {
    upsert.mockResolvedValue({ id: 'singleton', minDelayDays: 7, maxVisitAgeDays: 730 });
    await service.getPolicy();
    expect(upsert).toHaveBeenCalledWith({
      where: { id: 'singleton' },
      update: {},
      create: { id: 'singleton' },
    });
  });

  it('updatePolicy upserts the singleton with the new values', async () => {
    upsert.mockResolvedValue({ id: 'singleton', minDelayDays: 14, maxVisitAgeDays: 365 });
    await service.updatePolicy({ minDelayDays: 14, maxVisitAgeDays: 365 });
    expect(upsert).toHaveBeenCalledWith({
      where: { id: 'singleton' },
      update: { minDelayDays: 14, maxVisitAgeDays: 365 },
      create: { id: 'singleton', minDelayDays: 14, maxVisitAgeDays: 365 },
    });
  });
});
