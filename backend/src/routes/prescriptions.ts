import { Router } from 'express';
import { Prisma, PrismaClient } from '../../generated/prisma';

const router = Router();
const prisma = new PrismaClient();

// POST /prescriptions
router.post('/', async (req, res) => {
  try {
    const { claimId, drugCodeAtc, quantity, lineCost } = req.body;
    const prescription = await prisma.prescription.create({
      data: {
        claimId,
        drugCodeAtc,
        quantity,
        lineCost,
      },
    });
    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Prescription creation has failed' });
  }
});

// GET /prescriptions/:id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        claim: true,
      },
    });

    if (!prescription) {
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.json(prescription);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Prescription retrieval has failed' });
  }
});

// GET /prescriptions
router.get('/', async (req, res) => {
  try {
    const claimId = req.query.claimId ? Number(req.query.claimId) : undefined;

    const prescriptions = await prisma.prescription.findMany({
      where: claimId ? { claimId } : {},
      include: {
        claim: true,
      },
    });

    if (prescriptions.length === 0) {
      return res.status(404).json({ error: 'Prescriptions not found' });
    }

    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Prescriptions retrieval has failed' });
  }
});

// PUT /prescriptions/:id
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { drugCodeAtc, quantity, lineCost } = req.body;

  try {
    const updatedPrescription = await prisma.prescription.update({
      where: { id },
      data: {
        ...(drugCodeAtc !== undefined && { drugCodeAtc }),
        ...(quantity !== undefined && { quantity }),
        ...(lineCost !== undefined && { lineCost }),
      },
    });

    res.json(updatedPrescription);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ error: 'Prescription not found' });
    }
    console.error(error);
    res.status(500).json({ error: 'Prescription update has failed' });
  }
});

// DELETE /prescriptions/:id
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const deletedPrescription = await prisma.prescription.delete({
      where: { id },
    });

    res.json({ message: 'Prescription deleted', prescription: deletedPrescription });
  } catch (error: any) {
    console.error(error);

    if (error.code === 'P2025') {
      // Prisma was not able to delete the record because it doesn't exist
      return res.status(404).json({ error: 'Prescription not found' });
    }

    res.status(500).json({ error: 'Prescription deletion has failed' });
  }
});

export default router;
