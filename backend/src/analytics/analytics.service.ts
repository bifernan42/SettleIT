import { Injectable } from '@nestjs/common';
import { PaymentRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface FlowPerformance {
  flowId: string;
  flowName: string;
  total: number;
  fulfilled: number;
  pending: number;
  failed: number;
  recovered: number;
  due: number;
  fulfillmentRate: number; // 0–1, share of delivered reminders that were settled
}

export interface ChannelPerformance {
  channel: string;
  total: number;
  fulfilled: number;
  failed: number;
  recovered: number;
  fulfillmentRate: number;
  deliveryFailureRate: number; // 0–1, share of dispatches that never reached the patient
}

export interface AnalyticsSummary {
  totals: { recovered: number; due: number; fulfillmentRate: number };
  byFlow: FlowPerformance[];
  byChannel: ChannelPerformance[];
}

// Map the various settings shapes (seed uses { channel: 'email' }, the flow
// editor uses { actionType: 'EMAIL' }) onto a single canonical channel label.
function normalizeChannel(settings: unknown): string {
  const s = (settings ?? {}) as Record<string, unknown>;
  const raw = (s.actionType ?? s.channel) as string | undefined;
  if (!raw) return 'AUTRE';
  const upper = raw.toUpperCase();
  if (['EMAIL', 'SMS', 'WHATSAPP', 'COURRIER'].includes(upper)) return upper;
  return upper;
}

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async summary(): Promise<AnalyticsSummary> {
    const requests = await this.prisma.paymentRequest.findMany({
      include: {
        flowNode: { include: { flow: true } },
        patientExamination: {
          include: { patient: true, examination: true },
        },
      },
    });

    const outOfPocket = (r: (typeof requests)[number]) =>
      r.patientExamination.examination.baseCost *
      (1 - r.patientExamination.patient.coverageRate);

    const flowMap = new Map<string, FlowPerformance>();
    const channelMap = new Map<string, ChannelPerformance>();

    let totalRecovered = 0;
    let totalDue = 0;
    let totalFulfilled = 0;
    let totalDelivered = 0; // PENDING + FULFILLED (i.e. not DELIVERY_FAILED)

    for (const r of requests) {
      const amount = outOfPocket(r);
      const isFulfilled = r.status === PaymentRequestStatus.FULFILLED;
      const isFailed = r.status === PaymentRequestStatus.DELIVERY_FAILED;
      const isPending = r.status === PaymentRequestStatus.PENDING;

      // ── per flow ──
      const flow = r.flowNode.flow;
      const f =
        flowMap.get(flow.id) ??
        flowMap
          .set(flow.id, {
            flowId: flow.id,
            flowName: flow.name,
            total: 0,
            fulfilled: 0,
            pending: 0,
            failed: 0,
            recovered: 0,
            due: 0,
            fulfillmentRate: 0,
          })
          .get(flow.id)!;
      f.total++;
      if (isFulfilled) {
        f.fulfilled++;
        f.recovered += amount;
      }
      if (isPending) {
        f.pending++;
        f.due += amount;
      }
      if (isFailed) f.failed++;

      // ── per channel ──
      const channel = normalizeChannel(r.flowNode.settings);
      const c =
        channelMap.get(channel) ??
        channelMap
          .set(channel, {
            channel,
            total: 0,
            fulfilled: 0,
            failed: 0,
            recovered: 0,
            fulfillmentRate: 0,
            deliveryFailureRate: 0,
          })
          .get(channel)!;
      c.total++;
      if (isFulfilled) {
        c.fulfilled++;
        c.recovered += amount;
      }
      if (isFailed) c.failed++;

      // ── totals ──
      if (isFulfilled) {
        totalRecovered += amount;
        totalFulfilled++;
      }
      if (isPending) totalDue += amount;
      if (!isFailed) totalDelivered++;
    }

    const byFlow = [...flowMap.values()].map((f) => {
      const delivered = f.fulfilled + f.pending;
      f.fulfillmentRate = delivered ? f.fulfilled / delivered : 0;
      return f;
    });
    byFlow.sort((a, b) => b.recovered - a.recovered);

    const byChannel = [...channelMap.values()].map((c) => {
      const delivered = c.total - c.failed;
      c.fulfillmentRate = delivered ? c.fulfilled / delivered : 0;
      c.deliveryFailureRate = c.total ? c.failed / c.total : 0;
      return c;
    });
    byChannel.sort((a, b) => b.recovered - a.recovered);

    return {
      totals: {
        recovered: totalRecovered,
        due: totalDue,
        fulfillmentRate: totalDelivered ? totalFulfilled / totalDelivered : 0,
      },
      byFlow,
      byChannel,
    };
  }
}
