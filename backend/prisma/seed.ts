import { PrismaClient } from '@prisma/client';
import {
  createDeliveryFailedReminderScenario,
  createEmailToSmsFallbackFlow,
  createExpensiveExamination,
  createFullContactPatient,
  createNoEmailPatient,
  createNoPhonePatient,
  createReminderSentAndSettledScenario,
  createReminderSentAwaitingPaymentScenario,
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

  // Scenario A: email reminder sent → patient settled externally → FULFILLED
  await createReminderSentAndSettledScenario(prisma, patientFull, examStandard);
  // Scenario B: SMS reminder sent → still awaiting external payment → PENDING
  await createReminderSentAwaitingPaymentScenario(prisma, patientNoEmail, examExpensive);
  // Scenario C: SMS fallback could not reach patient → DELIVERY_FAILED
  await createDeliveryFailedReminderScenario(prisma, patientNoPhone, examExpensive);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
