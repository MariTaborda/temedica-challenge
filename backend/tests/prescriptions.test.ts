import request from 'supertest';
import express from 'express';
import prescriptionsRouter from '../src/routes/prescriptions';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/prescriptions', prescriptionsRouter);

let testPrescriptionId: number;
let testClaimId: number;
let testPatientId: number;

beforeAll(async () => {
  const patient = await prisma.patient.create({ data: { yearOfBirth: 1890, sex: 'FEMALE' } });
  testPatientId = patient.id;

  const submissionDate = new Date();
  const reimbursementDate = new Date(submissionDate.getTime() + 1); // 1 ms after submissionDate

  const claim = await prisma.claim.create({
    data: {
      patientId: patient.id,
      submissionDate,
      reimbursementDate,
      totalCost: 100,
    },
  });
  testClaimId = claim.id;

  const prescription = await prisma.prescription.create({
    data: {
      claimId: testClaimId,
      drugCodeAtc: 123,
      quantity: 2,
      lineCost: 50,
    },
  });
  testPrescriptionId = prescription.id;
});

afterAll(async () => {
  await prisma.prescription.delete({ where: { id: testPrescriptionId } });
  await prisma.claim.delete({ where: { id: testClaimId } });
  await prisma.patient.delete({ where: { id: testPatientId } });
  await prisma.$disconnect();
});

describe('Prescriptions API', () => {
  it('GET /prescriptions should return prescriptions', async () => {
    const res = await request(app).get('/prescriptions');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /prescriptions/:id should return a prescription', async () => {
    const res = await request(app).get(`/prescriptions/${testPrescriptionId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', testPrescriptionId);
  });

  it('POST /prescriptions creates a prescription', async () => {
    const res = await request(app)
      .post('/prescriptions')
      .send({ claimId: testClaimId, drugCodeAtc: 999, quantity: 1, lineCost: 20 });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');

    // Clean up
    await prisma.prescription.delete({ where: { id: res.body.id } });
  });

  it('DELETE /prescriptions/:id deletes a prescription', async () => {
    const prescription = await prisma.prescription.create({
      data: { claimId: testClaimId, drugCodeAtc: 555, quantity: 1, lineCost: 10 },
    });
    const res = await request(app).delete(`/prescriptions/${prescription.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Prescription deleted');
  });
});
