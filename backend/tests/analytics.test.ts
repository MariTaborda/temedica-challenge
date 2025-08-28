import request from 'supertest';
import express from 'express';
import analyticsRouter from '../src/routes/analytics';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/analytics', analyticsRouter);

let testPrescriptionIds: Array<number>;
let testClaimId: number;
let testPatientId: number;

beforeAll(async () => {
  const patient = await prisma.patient.create({ data: { yearOfBirth: 1780, sex: 'MALE' } });
  testPatientId = patient.id;

  const claim = await prisma.claim.create({
    data: {
      patientId: patient.id,
      submissionDate: new Date('2023-01-01'),
      reimbursementDate: new Date('2023-01-02'),
      totalCost: 100,
    },
  });
  testClaimId = claim.id;

  const prescriptions = await Promise.all([
    prisma.prescription.create({
      data: { claimId: claim.id, drugCodeAtc: 123, quantity: 1, lineCost: 10 },
    }),
    prisma.prescription.create({
      data: { claimId: claim.id, drugCodeAtc: 456, quantity: 2, lineCost: 20 },
    }),
  ]);
  testPrescriptionIds = prescriptions.map((_) => _.id);
});

afterAll(async () => {
  await prisma.prescription.deleteMany({ where: { id: { in: testPrescriptionIds } } });
  await prisma.claim.delete({ where: { id: testClaimId } });
  await prisma.patient.delete({ where: { id: testPatientId } });
  await prisma.$disconnect();
});

describe('Analytics API', () => {
  it('GET /analytics/top-drugs requires startDate and endDate', async () => {
    const res = await request(app).get('/analytics/top-drugs');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('GET /analytics/top-drugs returns top drugs', async () => {
    const res = await request(app).get(
      '/analytics/top-drugs?startDate=2023-01-01&endDate=2023-12-31'
    );
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('drugCode');
    expect(res.body[0]).toHaveProperty('prescribedCount');
  });
});
