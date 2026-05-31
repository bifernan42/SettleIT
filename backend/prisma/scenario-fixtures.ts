import { faker } from '@faker-js/faker';
import {
  EdgeConditionType,
  FlowNodeType,
  PaymentRequestStatus,
  Prisma,
  PrismaClient,
} from '@prisma/client';

faker.seed(42);

type Patient = Awaited<ReturnType<PrismaClient['patient']['upsert']>>;
type Examination = Awaited<ReturnType<PrismaClient['examination']['upsert']>>;

const ids = {
  patients: {
    noEmail: 'seed-patient-no-email',
    noPhone: 'seed-patient-no-phone',
    fullContact: 'seed-patient-full-contact',
  },
  examinations: {
    expensive: 'seed-examination-expensive',
    standard: 'seed-examination-standard',
  },
  flows: {
    emailToSmsFallback: 'seed-flow-email-to-sms-fallback',
    smsOnly: 'seed-flow-sms-only',
  },
  nodes: {
    emailTrigger: 'seed-node-email-fallback-trigger',
    emailAction: 'seed-node-email-fallback-email-action',
    emailWait: 'seed-node-email-fallback-wait',
    emailCondition: 'seed-node-email-fallback-condition',
    smsFallbackAction: 'seed-node-email-fallback-sms-action',
    emailEnd: 'seed-node-email-fallback-end',
    smsTrigger: 'seed-node-sms-only-trigger',
    smsAction: 'seed-node-sms-only-action',
    smsEnd: 'seed-node-sms-only-end',
  },
  edges: {
    emailTriggerToEmailAction: 'seed-edge-email-trigger-to-email-action',
    emailActionToWait: 'seed-edge-email-action-to-wait',
    waitToCondition: 'seed-edge-wait-to-condition',
    conditionToEnd: 'seed-edge-condition-to-end',
    conditionToSmsFallback: 'seed-edge-condition-to-sms-fallback',
    smsFallbackToEnd: 'seed-edge-sms-fallback-to-end',
    smsTriggerToSmsAction: 'seed-edge-sms-trigger-to-sms-action',
    smsActionToSmsEnd: 'seed-edge-sms-action-to-sms-end',
  },
  patientExaminations: {
    fulfilled: 'seed-patient-examination-fulfilled',
    pending: 'seed-patient-examination-pending',
    failed: 'seed-patient-examination-failed',
  },
  paymentRequests: {
    fulfilled: 'seed-payment-request-fulfilled',
    pending: 'seed-payment-request-pending',
    failed: 'seed-payment-request-failed-delivery',
  },
} as const;

function patientData(overrides: Partial<Prisma.PatientUncheckedCreateInput>) {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    name: firstName,
    surname: lastName,
    phoneNumber: faker.phone.number({ style: 'international' }),
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    address: `${faker.location.streetAddress()}, ${faker.location.zipCode()} ${faker.location.city()}`,
    coverageRate: 0.7,
    ...overrides,
  };
}

export async function createNoEmailPatient(prisma: PrismaClient) {
  const data = patientData({
    id: ids.patients.noEmail,
    email: '',
    coverageRate: 0.55,
  });

  return prisma.patient.upsert({
    where: { id: ids.patients.noEmail },
    update: data,
    create: data,
  });
}

export async function createNoPhonePatient(prisma: PrismaClient) {
  const data = patientData({
    id: ids.patients.noPhone,
    phoneNumber: '',
    coverageRate: 0.8,
  });

  return prisma.patient.upsert({
    where: { id: ids.patients.noPhone },
    update: data,
    create: data,
  });
}

export async function createFullContactPatient(prisma: PrismaClient) {
  const data = patientData({
    id: ids.patients.fullContact,
    coverageRate: 0.7,
  });

  return prisma.patient.upsert({
    where: { id: ids.patients.fullContact },
    update: data,
    create: data,
  });
}

export async function createExpensiveExamination(prisma: PrismaClient) {
  const data = {
    id: ids.examinations.expensive,
    baseCost: 950,
  };

  return prisma.examination.upsert({
    where: { id: ids.examinations.expensive },
    update: data,
    create: data,
  });
}

export async function createStandardExamination(prisma: PrismaClient) {
  const data = {
    id: ids.examinations.standard,
    baseCost: 150,
  };

  return prisma.examination.upsert({
    where: { id: ids.examinations.standard },
    update: data,
    create: data,
  });
}

async function upsertFlowNode(
  prisma: PrismaClient,
  data: Prisma.FlowNodeUncheckedCreateInput,
) {
  return prisma.flowNode.upsert({
    where: { id: data.id },
    update: data,
    create: data,
  });
}

async function upsertFlowEdge(
  prisma: PrismaClient,
  data: Prisma.FlowEdgeUncheckedCreateInput,
) {
  return prisma.flowEdge.upsert({
    where: { id: data.id },
    update: data,
    create: data,
  });
}

export async function createEmailToSmsFallbackFlow(prisma: PrismaClient) {
  const flow = await prisma.reminderFlow.upsert({
    where: { id: ids.flows.emailToSmsFallback },
    update: { name: 'Email puis SMS si absence de reponse', isActive: true },
    create: {
      id: ids.flows.emailToSmsFallback,
      name: 'Email puis SMS si absence de reponse',
      isActive: true, // this is the default active flow in the seed
    },
  });

  await upsertFlowNode(prisma, {
    id: ids.nodes.emailTrigger,
    flowId: flow.id,
    type: FlowNodeType.TRIGGER,
    settings: {
      event: 'payment_request_created',
      description:
        'Declenche la relance initiale pour une demande de paiement.',
    },
  });
  await upsertFlowNode(prisma, {
    id: ids.nodes.emailAction,
    flowId: flow.id,
    type: FlowNodeType.ACTION,
    settings: {
      channel: 'email',
      templateId: 'payment-reminder-email-initial',
      subject: 'Votre reglement est disponible',
    },
  });
  await upsertFlowNode(prisma, {
    id: ids.nodes.emailWait,
    flowId: flow.id,
    type: FlowNodeType.DELAY,
    settings: {
      durationDays: 3,
      reason:
        'Laisser au patient le temps de payer apres reception de l email.',
    },
  });
  await upsertFlowNode(prisma, {
    id: ids.nodes.emailCondition,
    flowId: flow.id,
    type: FlowNodeType.CONDITION,
    settings: {
      expression: 'paymentRequest.status === "FULFILLED"',
      trueBranch: 'stop',
      falseBranch: 'send_sms_fallback',
    },
  });
  await upsertFlowNode(prisma, {
    id: ids.nodes.smsFallbackAction,
    flowId: flow.id,
    type: FlowNodeType.ACTION,
    settings: {
      channel: 'sms',
      templateId: 'payment-reminder-sms-fallback',
      priority: 'high',
    },
  });
  await upsertFlowNode(prisma, {
    id: ids.nodes.emailEnd,
    flowId: flow.id,
    type: FlowNodeType.END,
    settings: {
      outcome: 'flow_completed',
    },
  });

  await upsertFlowEdge(prisma, {
    id: ids.edges.emailTriggerToEmailAction,
    sourceNodeId: ids.nodes.emailTrigger,
    targetNodeId: ids.nodes.emailAction,
    conditionType: EdgeConditionType.DEFAULT,
  });
  await upsertFlowEdge(prisma, {
    id: ids.edges.emailActionToWait,
    sourceNodeId: ids.nodes.emailAction,
    targetNodeId: ids.nodes.emailWait,
    conditionType: EdgeConditionType.DEFAULT,
  });
  await upsertFlowEdge(prisma, {
    id: ids.edges.waitToCondition,
    sourceNodeId: ids.nodes.emailWait,
    targetNodeId: ids.nodes.emailCondition,
    conditionType: EdgeConditionType.DEFAULT,
  });
  await upsertFlowEdge(prisma, {
    id: ids.edges.conditionToEnd,
    sourceNodeId: ids.nodes.emailCondition,
    targetNodeId: ids.nodes.emailEnd,
    conditionType: EdgeConditionType.TRUE_BRANCH,
  });
  await upsertFlowEdge(prisma, {
    id: ids.edges.conditionToSmsFallback,
    sourceNodeId: ids.nodes.emailCondition,
    targetNodeId: ids.nodes.smsFallbackAction,
    conditionType: EdgeConditionType.FALSE_BRANCH,
  });
  await upsertFlowEdge(prisma, {
    id: ids.edges.smsFallbackToEnd,
    sourceNodeId: ids.nodes.smsFallbackAction,
    targetNodeId: ids.nodes.emailEnd,
    conditionType: EdgeConditionType.DEFAULT,
  });

  return prisma.reminderFlow.findUniqueOrThrow({
    where: { id: flow.id },
    include: { nodes: { include: { outgoingEdges: true } } },
  });
}

export async function createSmsOnlyFlow(prisma: PrismaClient) {
  const flow = await prisma.reminderFlow.upsert({
    where: { id: ids.flows.smsOnly },
    update: { name: 'Relance SMS uniquement' },
    create: {
      id: ids.flows.smsOnly,
      name: 'Relance SMS uniquement',
    },
  });

  await upsertFlowNode(prisma, {
    id: ids.nodes.smsTrigger,
    flowId: flow.id,
    type: FlowNodeType.TRIGGER,
    settings: {
      event: 'payment_request_created',
      audience: 'patients_without_email',
    },
  });
  await upsertFlowNode(prisma, {
    id: ids.nodes.smsAction,
    flowId: flow.id,
    type: FlowNodeType.ACTION,
    settings: {
      channel: 'sms',
      templateId: 'payment-reminder-sms-only',
      priority: 'normal',
    },
  });
  await upsertFlowNode(prisma, {
    id: ids.nodes.smsEnd,
    flowId: flow.id,
    type: FlowNodeType.END,
    settings: {
      outcome: 'sms_flow_completed',
    },
  });

  await upsertFlowEdge(prisma, {
    id: ids.edges.smsTriggerToSmsAction,
    sourceNodeId: ids.nodes.smsTrigger,
    targetNodeId: ids.nodes.smsAction,
    conditionType: EdgeConditionType.DEFAULT,
  });
  await upsertFlowEdge(prisma, {
    id: ids.edges.smsActionToSmsEnd,
    sourceNodeId: ids.nodes.smsAction,
    targetNodeId: ids.nodes.smsEnd,
    conditionType: EdgeConditionType.DEFAULT,
  });

  return prisma.reminderFlow.findUniqueOrThrow({
    where: { id: flow.id },
    include: { nodes: { include: { outgoingEdges: true } } },
  });
}

// ─── Bulk demo dataset ────────────────────────────────────────────────────────

// Reference "today" used to spread visit/reminder dates around. Kept in sync
// with the demo clock (late May 2026) so eligibility rules produce a realistic
// mix: some visits older than 2 years (excluded), some reminders within the
// cooldown window (excluded), and many eligible patients.
const REFERENCE = new Date('2026-05-31T12:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;

function daysAgo(days: number) {
  return new Date(REFERENCE.getTime() - days * DAY_MS);
}

const BULK_EXAM_COSTS = [80, 150, 220, 350, 480, 620, 950];

/**
 * A large, deterministic demo dataset: varied patients, several examination
 * types, visits spread across ~2.5 years (some intentionally older than the
 * 730-day eligibility ceiling), and payment requests across all three statuses
 * (including a few recent enough to trip the re-contact cooldown).
 *
 * Everything is upserted on stable `seed-bulk-*` ids so re-running the seed is
 * idempotent.
 */
export async function createBulkDemoData(prisma: PrismaClient) {
  const exams: Examination[] = [];
  for (let i = 0; i < BULK_EXAM_COSTS.length; i++) {
    const id = `seed-bulk-examination-${i}`;
    const data = { id, baseCost: BULK_EXAM_COSTS[i] };
    exams.push(
      await prisma.examination.upsert({
        where: { id },
        update: data,
        create: data,
      }),
    );
  }

  const PATIENT_COUNT = 18;
  const statuses = [
    PaymentRequestStatus.PENDING,
    PaymentRequestStatus.FULFILLED,
    PaymentRequestStatus.DELIVERY_FAILED,
  ];

  for (let i = 0; i < PATIENT_COUNT; i++) {
    const patientId = `seed-bulk-patient-${i}`;
    const coverageRate = [0.5, 0.6, 0.65, 0.7, 0.8, 0.9][i % 6];
    const patientPayload = patientData({ id: patientId, coverageRate });
    const patient = await prisma.patient.upsert({
      where: { id: patientId },
      update: patientPayload,
      create: patientPayload,
    });

    // Visit age: patients 0-2 are >2 years old (excluded by age), the rest
    // spread from a few days to ~18 months ago.
    const visitAgeDays = i < 3 ? 760 + i * 40 : ((i * 37) % 540) + 5;
    const exam = exams[i % exams.length];
    const peId = `seed-bulk-pe-${i}`;
    const patientExamination = await upsertPatientExamination(
      prisma,
      peId,
      patient,
      exam,
      daysAgo(visitAgeDays),
    );

    // Every other patient has a reminder on record. Patients 3 and 4 were
    // contacted within the last few days → excluded by the cooldown rule.
    if (i % 2 === 0 || i === 3 || i === 4) {
      const reminderAgeDays = i === 3 ? 2 : i === 4 ? 5 : ((i * 53) % 400) + 10;
      const status = statuses[i % statuses.length];
      const prId = `seed-bulk-pr-${i}`;
      const channelNode =
        i % 2 === 0 ? ids.nodes.emailAction : ids.nodes.smsAction;
      await prisma.paymentRequest.upsert({
        where: { id: prId },
        update: {
          patientExaminationId: patientExamination.id,
          flowNodeId: channelNode,
          date: daysAgo(reminderAgeDays),
          status,
        },
        create: {
          id: prId,
          patientExaminationId: patientExamination.id,
          flowNodeId: channelNode,
          date: daysAgo(reminderAgeDays),
          status,
        },
      });
    }
  }
}

async function upsertPatientExamination(
  prisma: PrismaClient,
  id: string,
  patient: Patient,
  examination: Examination,
  date: Date,
) {
  return prisma.patientExamination.upsert({
    where: { id },
    update: {
      patientId: patient.id,
      examinationId: examination.id,
      date,
    },
    create: {
      id,
      patientId: patient.id,
      examinationId: examination.id,
      date,
    },
  });
}

/**
 * Scenario A — reminder sent, payment confirmed.
 *
 * An email reminder was dispatched (emailAction node). The patient paid
 * via an external channel (bank transfer, front desk, etc.). SettleIT is
 * notified by marking the PaymentRequest FULFILLED through
 * PATCH /payment-requests/:id/fulfill.
 *
 * SettleIT does NOT process the payment itself — it only records that
 * the debt has been settled externally.
 */
export async function createReminderSentAndSettledScenario(
  prisma: PrismaClient,
  patient: Patient,
  examination: Examination,
) {
  const patientExamination = await upsertPatientExamination(
    prisma,
    ids.patientExaminations.fulfilled,
    patient,
    examination,
    new Date('2026-05-20T09:30:00.000Z'),
  );

  return prisma.paymentRequest.upsert({
    where: { id: ids.paymentRequests.fulfilled },
    update: {
      patientExaminationId: patientExamination.id,
      flowNodeId: ids.nodes.emailAction,
      date: new Date('2026-05-20T10:00:00.000Z'),
      status: PaymentRequestStatus.FULFILLED,
    },
    create: {
      id: ids.paymentRequests.fulfilled,
      patientExaminationId: patientExamination.id,
      flowNodeId: ids.nodes.emailAction,
      date: new Date('2026-05-20T10:00:00.000Z'),
      status: PaymentRequestStatus.FULFILLED,
    },
  });
}

/**
 * Scenario B — reminder sent, awaiting payment.
 *
 * An SMS reminder was dispatched (smsAction node) and reached the patient.
 * No external payment confirmation has arrived yet. The flow engine will
 * re-check this request's status once the configured DELAY elapses.
 */
export async function createReminderSentAwaitingPaymentScenario(
  prisma: PrismaClient,
  patient: Patient,
  examination: Examination,
) {
  const patientExamination = await upsertPatientExamination(
    prisma,
    ids.patientExaminations.pending,
    patient,
    examination,
    new Date('2026-05-24T14:15:00.000Z'),
  );

  return prisma.paymentRequest.upsert({
    where: { id: ids.paymentRequests.pending },
    update: {
      patientExaminationId: patientExamination.id,
      flowNodeId: ids.nodes.smsAction,
      date: new Date('2026-05-24T15:00:00.000Z'),
      status: PaymentRequestStatus.PENDING,
    },
    create: {
      id: ids.paymentRequests.pending,
      patientExaminationId: patientExamination.id,
      flowNodeId: ids.nodes.smsAction,
      date: new Date('2026-05-24T15:00:00.000Z'),
      status: PaymentRequestStatus.PENDING,
    },
  });
}

/**
 * Scenario C — reminder delivery failed.
 *
 * The SMS fallback (smsFallbackAction node) could not reach the patient —
 * invalid number, carrier rejection, etc. The status is DELIVERY_FAILED,
 * which is distinct from PENDING: the reminder was never received, so the
 * patient cannot be expected to pay from this notification. A human review
 * or an alternate contact strategy is required.
 *
 * This is NOT a failed payment. SettleIT never processes payments.
 */
export async function createDeliveryFailedReminderScenario(
  prisma: PrismaClient,
  patient: Patient,
  examination: Examination,
) {
  const patientExamination = await upsertPatientExamination(
    prisma,
    ids.patientExaminations.failed,
    patient,
    examination,
    new Date('2026-05-18T08:45:00.000Z'),
  );

  return prisma.paymentRequest.upsert({
    where: { id: ids.paymentRequests.failed },
    update: {
      patientExaminationId: patientExamination.id,
      flowNodeId: ids.nodes.smsFallbackAction,
      date: new Date('2026-05-18T09:15:00.000Z'),
      status: PaymentRequestStatus.DELIVERY_FAILED,
    },
    create: {
      id: ids.paymentRequests.failed,
      patientExaminationId: patientExamination.id,
      flowNodeId: ids.nodes.smsFallbackAction,
      date: new Date('2026-05-18T09:15:00.000Z'),
      status: PaymentRequestStatus.DELIVERY_FAILED,
    },
  });
}
