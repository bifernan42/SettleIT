import { Injectable } from '@nestjs/common';
import { PaymentRequestStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentRequestsService {
  constructor(private prisma: PrismaService) {}

  findAll(status?: PaymentRequestStatus) {
    return this.prisma.paymentRequest.findMany({
      where: status ? { status } : undefined,
      include: { patientExamination: { include: { patient: true, examination: true } } },
    });
  }

  findOne(id: string) {
    return this.prisma.paymentRequest.findUniqueOrThrow({
      where: { id },
      include: { patientExamination: { include: { patient: true, examination: true } }, flowNode: true },
    });
  }

  async fulfill(id: string) {
    // Read-then-write to make this a true no-op when the request is already
    // fulfilled, rather than issuing an unnecessary UPDATE every call.
    const current = await this.prisma.paymentRequest.findUniqueOrThrow({
      where: { id },
    });

    if (current.status === PaymentRequestStatus.FULFILLED) {
      return current; // already settled — nothing to do
    }

    return this.prisma.paymentRequest.update({
      where: { id },
      data: { status: PaymentRequestStatus.FULFILLED },
    });
  }
}
