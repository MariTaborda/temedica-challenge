import { PrismaClient, Gender } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  // Clean tables first
  await prisma.claimDiagnosis.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.patient.deleteMany();

  // ---- Patients ----
  const maria = await prisma.patient.create({ data: { yearOfBirth: 1999, sex: Gender.FEMALE } });
  const alex = await prisma.patient.create({ data: { yearOfBirth: 1975, sex: Gender.MALE } });
  const max = await prisma.patient.create({ data: { yearOfBirth: 1989, sex: Gender.MALE } });
  const diana = await prisma.patient.create({ data: { yearOfBirth: 1982, sex: Gender.FEMALE } });
  const peter = await prisma.patient.create({ data: { yearOfBirth: 1995, sex: Gender.MALE } });
  const elena = await prisma.patient.create({ data: { yearOfBirth: 1968, sex: Gender.FEMALE } });

  // ---- Claims ----
  const mariaClaim1 = await prisma.claim.create({
    data: {
      patientId: maria.id,
      submissionDate: new Date('2023-01-10'),
      reimbursementDate: new Date('2023-01-25'),
      totalCost: 450,
    },
  });
  const mariaClaim2 = await prisma.claim.create({
    data: {
      patientId: maria.id,
      submissionDate: new Date('2023-03-15'),
      reimbursementDate: new Date('2023-03-30'),
      totalCost: 300,
    },
  });
  const alexClaim1 = await prisma.claim.create({
    data: {
      patientId: alex.id,
      submissionDate: new Date('2023-02-05'),
      reimbursementDate: new Date('2023-02-20'),
      totalCost: 500,
    },
  });
  const maxClaim1 = await prisma.claim.create({
    data: {
      patientId: max.id,
      submissionDate: new Date('2023-04-01'),
      reimbursementDate: new Date('2023-04-18'),
      totalCost: 200,
    },
  });
  const dianaClaim1 = await prisma.claim.create({
    data: {
      patientId: diana.id,
      submissionDate: new Date('2023-01-20'),
      reimbursementDate: new Date('2023-02-05'),
      totalCost: 720,
    },
  });
  const peterClaim1 = await prisma.claim.create({
    data: {
      patientId: peter.id,
      submissionDate: new Date('2023-03-10'),
      reimbursementDate: new Date('2023-03-25'),
      totalCost: 410,
    },
  });
  const elenaClaim1 = await prisma.claim.create({
    data: {
      patientId: elena.id,
      submissionDate: new Date('2023-04-05'),
      reimbursementDate: new Date('2023-04-20'),
      totalCost: 250,
    },
  });

  // ---- Prescriptions ----
  await prisma.prescription.createMany({
    data: [
      { claimId: mariaClaim1.id, drugCodeAtc: 1001, quantity: 2, lineCost: 50 },
      { claimId: mariaClaim1.id, drugCodeAtc: 1002, quantity: 1, lineCost: 30 },
      { claimId: mariaClaim2.id, drugCodeAtc: 1003, quantity: 3, lineCost: 90 },
      { claimId: alexClaim1.id, drugCodeAtc: 1001, quantity: 5, lineCost: 200 },
      { claimId: alexClaim1.id, drugCodeAtc: 1004, quantity: 2, lineCost: 70 },
      { claimId: maxClaim1.id, drugCodeAtc: 1001, quantity: 4, lineCost: 100 },
      { claimId: maxClaim1.id, drugCodeAtc: 1005, quantity: 1, lineCost: 20 },
      { claimId: maxClaim1.id, drugCodeAtc: 1002, quantity: 2, lineCost: 40 },
      { claimId: dianaClaim1.id, drugCodeAtc: 1002, quantity: 3, lineCost: 60 },
      { claimId: dianaClaim1.id, drugCodeAtc: 1006, quantity: 1, lineCost: 30 },
      { claimId: peterClaim1.id, drugCodeAtc: 1003, quantity: 2, lineCost: 45 },
      { claimId: peterClaim1.id, drugCodeAtc: 1007, quantity: 1, lineCost: 25 },
      { claimId: elenaClaim1.id, drugCodeAtc: 1004, quantity: 2, lineCost: 50 },
      { claimId: elenaClaim1.id, drugCodeAtc: 1008, quantity: 1, lineCost: 35 },
    ],
  });

  // ---- Diagnoses ----
  await prisma.claimDiagnosis.createMany({
    data: [
      { claimId: mariaClaim1.id, icd10Code: 200 },
      { claimId: mariaClaim2.id, icd10Code: 201 },
      { claimId: alexClaim1.id, icd10Code: 202 },
      { claimId: maxClaim1.id, icd10Code: 203 },
      { claimId: dianaClaim1.id, icd10Code: 204 },
      { claimId: peterClaim1.id, icd10Code: 205 },
      { claimId: elenaClaim1.id, icd10Code: 206 },
    ],
  });

  console.log('Seed was completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
