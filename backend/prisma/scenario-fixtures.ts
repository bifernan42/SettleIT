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
    update: { name: 'Email puis SMS si absence de reponse' },
    create: {
      id: ids.flows.emailToSmsFallback,
      name: 'Email puis SMS si absence de reponse',
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

export async function createFulfilledPaymentScenario(
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

export async function createPendingPaymentScenario(
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

export async function createFailedPaymentScenario(
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
      status: PaymentRequestStatus.PENDING,
    },
    create: {
      id: ids.paymentRequests.failed,
      patientExaminationId: patientExamination.id,
      flowNodeId: ids.nodes.smsFallbackAction,
      date: new Date('2026-05-18T09:15:00.000Z'),
      status: PaymentRequestStatus.PENDING,
    },
  });
}
