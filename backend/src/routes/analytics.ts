import { Router } from 'express';
import { PrismaClient } from '../../generated/prisma';

const router = Router();
const prisma = new PrismaClient();

// GET /analytics/top-drugs
router.get('/top-drugs', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
        }

        const topDrugs = await prisma.prescription.groupBy({
            by: ['drugCodeAtc'],
            where: {
                claim: {
                    submissionDate: {
                        gte: new Date(startDate as string),
                        lte: new Date(endDate as string),
                    },
                },
            },
            _count: {
                id: true, // count how many prescriptions per drug :)
            },
            orderBy: {
                _count: {
                    id: 'desc',
                },
            },
            take: 10, // top 10 drugs
        });

        const formattedData = topDrugs.map((drug: {
            drugCodeAtc: number;
            _count: { id: number };
        }) => ({
            drugCode: drug.drugCodeAtc,
            prescribedCount: drug._count.id,
        }));

        res.json(formattedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Top prescribed drugs aggregation failed' });
    }
});

export default router;
