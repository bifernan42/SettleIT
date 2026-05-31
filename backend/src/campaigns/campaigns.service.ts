import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface PatientEligibility {
  patientId: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  lastVisitDate: string | null;
  outOfPocketDue: number;
  eligible: boolean;
  reason?: string;
}

@Injectable()
export class CampaignsService {
  constructor(
    private prisma: PrismaService,
    private settings: SettingsService,
  ) {}

  // Read-only eligibility computation. No PaymentRequests are created here —
  // the campaign launch is simulated client-side. We only tell the UI which
  // patients the business rules would currently allow to be contacted.
  async eligibility(now: Date = new Date()): Promise<PatientEligibility[]> {
    const policy = await this.settings.getPolicy();

    const patients = await this.prisma.patient.findMany({
      include: {
        examinations: {
          include: { examination: true, paymentRequests: true },
        },
      },
    });

    return patients
      .filter((p) => p.examinations.length > 0)
      .map((p) => {
        const visits = [...p.examinations].sort(
          (a, b) => b.date.getTime() - a.date.getTime(),
        );
        const lastVisit = visits[0];
        const lastVisitAgeDays =
          (now.getTime() - lastVisit.date.getTime()) / DAY_MS;

        const outOfPocketDue = p.examinations.reduce(
          (sum, pe) =>
            sum + pe.examination.baseCost * (1 - p.coverageRate),
          0,
        );

        const mostRecentRequestDate = p.examinations
          .flatMap((pe) => pe.paymentRequests)
          .reduce<Date | null>((latest, pr) => {
            if (!latest || pr.date.getTime() > latest.getTime()) return pr.date;
            return latest;
          }, null);

        const recontactAgeDays = mostRecentRequestDate
          ? (now.getTime() - mostRecentRequestDate.getTime()) / DAY_MS
          : Infinity;

        let eligible = true;
        let reason: string | undefined;

        if (lastVisitAgeDays > policy.maxVisitAgeDays) {
          eligible = false;
          reason = 'Visite trop ancienne';
        } else if (recontactAgeDays < policy.minDelayDays) {
          eligible = false;
          reason = 'Contacté récemment';
        }

        return {
          patientId: p.id,
          name: p.name,
          surname: p.surname,
          email: p.email,
          phoneNumber: p.phoneNumber,
          lastVisitDate: lastVisit.date.toISOString(),
          outOfPocketDue,
          eligible,
          reason,
        };
      });
  }
}
