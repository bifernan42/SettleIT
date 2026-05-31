import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { FlowNodeType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { ReminderFlowsService } from './reminder-flows.service';

describe('ReminderFlowsService — DELAY validation', () => {
  let service: ReminderFlowsService;
  let create: jest.Mock;
  let getPolicy: jest.Mock;

  beforeEach(async () => {
    create = jest.fn().mockResolvedValue({ id: 'node-1' });
    getPolicy = jest.fn().mockResolvedValue({ minDelayDays: 7, maxVisitAgeDays: 730 });
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReminderFlowsService,
        { provide: PrismaService, useValue: { flowNode: { create } } },
        { provide: SettingsService, useValue: { getPolicy } },
      ],
    }).compile();
    service = module.get(ReminderFlowsService);
  });

  it('rejects a DELAY node below the policy minimum', async () => {
    await expect(
      service.createNode('flow-1', {
        type: FlowNodeType.DELAY,
        settings: { delayDays: 3 },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('accepts a DELAY node at or above the policy minimum', async () => {
    await service.createNode('flow-1', {
      type: FlowNodeType.DELAY,
      settings: { delayDays: 7 },
    });
    expect(create).toHaveBeenCalled();
  });

  it('does not validate delay for non-DELAY nodes', async () => {
    await service.createNode('flow-1', {
      type: FlowNodeType.ACTION,
      settings: { delayDays: 1 },
    });
    expect(getPolicy).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalled();
  });
});
