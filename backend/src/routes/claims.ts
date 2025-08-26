import { Router } from 'express';
import { Prisma, PrismaClient } from '../../generated/prisma';

const router = Router();
const prisma = new PrismaClient();

// POST /claims
router.post('/', async (req, res) => {
    try {
        const { patientId, submissionDate, reimbursementDate, totalCost } = req.body;
        const claim = await prisma.claim.create({
            data: {
                patientId,
                submissionDate: new Date(submissionDate),
                reimbursementDate: new Date(reimbursementDate),
                totalCost,
            },
        });
        res.json(claim);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Claim creation has failed" });
    }
});

// GET /claims/total-cost-per-patient
router.get('/total-cost-per-patient', async (req, res) => {
    try {
        const totalCosts = await prisma.claim.groupBy({
            by: ['patientId'],
            _sum: {
                totalCost: true,
            },
            orderBy: {
                patientId: 'asc',
            },
        });

        const formatted = totalCosts.map(cost => ({
            patientId: cost.patientId,
            totalCost: cost._sum.totalCost ?? 0,
        }));

        res.json(formatted);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to calculate total claim costs per patient' });
    }
});

// GET /claims/average-prescriptions
router.get('/average-prescriptions', async (req, res) => {
    try {
        const totalPrescriptions = await prisma.prescription.count();
        const totalClaims = await prisma.claim.count();

        const average = totalClaims > 0 ? totalPrescriptions / totalClaims : 0;

        res.json({ averagePrescriptionsPerClaim: average });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to calculate average prescriptions per claim' });
    }
});


// GET /claims/:id
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        const claim = await prisma.claim.findUnique({
            where: { id },
            include: {
                patient: true,
                prescriptions: true,
                diagnoses: true,
            },
        });

        if (!claim) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        res.json(claim);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Claim retrieval has failed' });
    }
});

// GET /claims
router.get('/', async (req, res) => {
    try {
        const patientId = req.query.patientId ? Number(req.query.patientId) : undefined;

        const claims = await prisma.claim.findMany({
            where: patientId ? { patientId } : {},
            include: {
                patient: true,
                prescriptions: true,
                diagnoses: true,
            },
        });

        if (claims.length === 0) {
            return res.status(404).json({ error: 'Claims not found' });
        }

        res.json(claims);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Claims retrieval has failed' });
    }
});

// PUT /claims/:id
router.put('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const { submissionDate, reimbursementDate, totalCost } = req.body;

    try {
        const updatedClaim = await prisma.claim.update({
            where: { id },
            data: {
                ...(submissionDate && { submissionDate: new Date(submissionDate) }),
                ...(reimbursementDate && { reimbursementDate: new Date(reimbursementDate) }),
                ...(totalCost !== undefined && { totalCost }),
            },
        });

        res.json(updatedClaim);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return res.status(404).json({ error: 'Claim not found' });
        }
        console.error(error);
        res.status(500).json({ error: 'Claim update has failed' });
    }
});

// DELETE /claims/:id
router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        await prisma.claimDiagnosis.deleteMany({ where: { claimId: id } });
        await prisma.prescription.deleteMany({ where: { claimId: id } });
        const deletedClaim = await prisma.claim.delete({ where: { id } });

        res.json({ message: 'Claim deleted', claim: deletedClaim });
    } catch (error: any) {
        console.error(error);

        if (error.code === 'P2025') { // We can't delete the record because it doesn't exist
            return res.status(404).json({ error: 'Claim not found' });
        }

        res.status(500).json({ error: 'Claim deletion has failed' });
    }
});

export default router;
