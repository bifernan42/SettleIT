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

  fulfill(id: string) {
    return this.prisma.paymentRequest.update({
      where: { id },
      data: { status: PaymentRequestStatus.FULFILLED },
    });
  }
}
