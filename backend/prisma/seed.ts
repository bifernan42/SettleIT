import { PrismaClient } from '@prisma/client';
import {
  createEmailToSmsFallbackFlow,
  createExpensiveExamination,
  createFailedPaymentScenario,
  createFulfilledPaymentScenario,
  createFullContactPatient,
  createNoEmailPatient,
  createNoPhonePatient,
  createPendingPaymentScenario,
  createSmsOnlyFlow,
  createStandardExamination,
} from './scenario-fixtures';

const prisma = new PrismaClient();

async function main() {
  const patientNoEmail = await createNoEmailPatient(prisma);
  const patientNoPhone = await createNoPhonePatient(prisma);
  const patientFull = await createFullContactPatient(prisma);

  const examExpensive = await createExpensiveExamination(prisma);
  const examStandard = await createStandardExamination(prisma);

  await createEmailToSmsFallbackFlow(prisma);
  await createSmsOnlyFlow(prisma);

  await createFulfilledPaymentScenario(prisma, patientFull, examStandard);
  await createPendingPaymentScenario(prisma, patientNoEmail, examExpensive);
  await createFailedPaymentScenario(prisma, patientNoPhone, examExpensive);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
