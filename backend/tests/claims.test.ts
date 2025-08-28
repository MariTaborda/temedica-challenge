import request from 'supertest';
import express from 'express';
import claimsRouter from '../src/routes/claims';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/claims', claimsRouter);

let testClaimId: number;
let testPatientId: number;

beforeAll(async () => {
  const patient = await prisma.patient.create({
    data: { yearOfBirth: 1990, sex: 'FEMALE' },
  });
  testPatientId = patient.id; // Save patient ID

  const submissionDate = new Date();
  const reimbursementDate = new Date(submissionDate.getTime() + 1);

  const claim = await prisma.claim.create({
    data: {
      patientId: patient.id,
      submissionDate,
      reimbursementDate,
      totalCost: 100,
    },
  });

  testClaimId = claim.id; // Save claim ID for later tests
});

afterAll(async () => {
  await prisma.claim.delete({ where: { id: testClaimId } });
  await prisma.patient.delete({ where: { id: testPatientId } });

  await prisma.$disconnect();
});

describe('Claims API', () => {
  it('GET /claims should return claims', async () => {
    const res = await request(app).get('/claims');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /claims/:id should return a claim', async () => {
    const res = await request(app).get(`/claims/${testClaimId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', testClaimId);
  });

  it('GET /claims/total-cost-per-patient returns aggregated total', async () => {
    const res = await request(app).get('/claims/total-cost-per-patient');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('totalCost');
  });

  it('GET /claims/average-prescriptions returns average', async () => {
    const res = await request(app).get('/claims/average-prescriptions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('averagePrescriptionsPerClaim');
  });

  it('POST /claims creates a new claim', async () => {
    const submissionDate = new Date();
    const reimbursementDate = new Date(submissionDate.getTime() + 1);

    const res = await request(app).post('/claims').send({
      patientId: testPatientId,
      submissionDate: submissionDate.toISOString(),
      reimbursementDate: reimbursementDate.toISOString(),
      totalCost: 150,
    });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');

    // Clean up
    await prisma.claim.delete({ where: { id: res.body.id } });
  });

  it('DELETE /claims/:id deletes a claim', async () => {
    const submissionDate = new Date();
    const reimbursementDate = new Date(submissionDate.getTime() + 1);

    const claim = await prisma.claim.create({
      data: {
        patientId: testPatientId,
        submissionDate,
        reimbursementDate,
        totalCost: 100,
      },
    });

    const res = await request(app).delete(`/claims/${claim.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Claim deleted');
  });
});
