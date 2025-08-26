import request from 'supertest';
import express from 'express';
import analyticsRouter from '../src/routes/analytics';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use('/analytics', analyticsRouter);

beforeAll(async () => {
    await prisma.prescription.deleteMany({});
    await prisma.claim.deleteMany({});
    await prisma.patient.deleteMany({});

    const patient = await prisma.patient.create({ data: { yearOfBirth: 1990, sex: 'FEMALE' } });
    const claim = await prisma.claim.create({
        data: { patientId: patient.id, submissionDate: new Date('2023-01-01'), reimbursementDate: new Date(), totalCost: 100 },
    });

    await prisma.prescription.createMany({
        data: [
            { claimId: claim.id, drugCodeAtc: 1, quantity: 2, lineCost: 50 },
            { claimId: claim.id, drugCodeAtc: 2, quantity: 1, lineCost: 30 },
        ],
    });
});

afterAll(async () => {
    await prisma.prescription.deleteMany({});
    await prisma.claim.deleteMany({});
    await prisma.patient.deleteMany({});
    await prisma.$disconnect();
});

describe('Analytics API', () => {
    it('GET /analytics/top-drugs requires startDate and endDate', async () => {
        const res = await request(app).get('/analytics/top-drugs');
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('GET /analytics/top-drugs returns top drugs', async () => {
        const res = await request(app).get('/analytics/top-drugs?startDate=2023-01-01&endDate=2023-12-31');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('drugCode');
        expect(res.body[0]).toHaveProperty('prescribedCount');
    });
});
