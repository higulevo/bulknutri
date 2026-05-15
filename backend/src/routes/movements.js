import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { type, page = 1, limit = 30 } = req.query;
  const where = {};
  if (type) where.type = type;

  const skip = (Number(page) - 1) * Number(limit);
  const [movements, total] = await Promise.all([
    prisma.movement.findMany({
      where,
      include: {
        variant: { include: { product: true } },
        product: true,
        user: { select: { name: true } },
        sale: { select: { id: true, customerName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.movement.count({ where }),
  ]);
  res.json({ movements, total, pages: Math.ceil(total / Number(limit)) });
});

router.delete('/:id/revert', async (req, res) => {
  try {
    const movement = await prisma.movement.findUnique({ where: { id: Number(req.params.id) } });
    if (!movement) return res.status(404).json({ error: 'Movimentação não encontrada' });
    if (movement.saleId) return res.status(400).json({ error: 'Use exclusão de venda para estornar vendas' });

    if (movement.variantId) {
      await prisma.variant.update({ where: { id: movement.variantId }, data: { stock: { decrement: movement.quantity } } });
      await prisma.movement.create({
        data: { variantId: movement.variantId, userId: req.user.id, type: 'AJUSTE', quantity: -movement.quantity, note: `Reversão da movimentação #${movement.id}` },
      });
    } else if (movement.productId) {
      await prisma.product.update({ where: { id: movement.productId }, data: { stock: { decrement: movement.quantity } } });
      await prisma.movement.create({
        data: { productId: movement.productId, userId: req.user.id, type: 'AJUSTE', quantity: -movement.quantity, note: `Reversão da movimentação #${movement.id}` },
      });
    }

    await prisma.movement.delete({ where: { id: movement.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.movement.delete({ where: { id: Number(req.params.id) } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
