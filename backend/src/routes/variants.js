import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const { productId, name, sku, price, stock, minStock } = req.body;
    const variant = await prisma.variant.create({
      data: {
        productId: Number(productId), name,
        sku: sku || null,
        price: price ? parseFloat(price) : null,
        stock: parseInt(stock) || 0,
        minStock: parseInt(minStock) || 5,
      },
    });
    res.json(variant);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, sku, price, stock, minStock, active } = req.body;
    const variant = await prisma.variant.update({
      where: { id: Number(req.params.id) },
      data: {
        name, sku,
        price: price !== undefined ? (price ? parseFloat(price) : null) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
        minStock: minStock !== undefined ? parseInt(minStock) : undefined,
        active: active !== undefined ? (active === 'true' || active === true) : undefined,
      },
    });
    res.json(variant);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  await prisma.variant.update({ where: { id: Number(req.params.id) }, data: { active: false } });
  res.json({ ok: true });
});

// Entrada de estoque por variante
router.post('/:id/entry', async (req, res) => {
  try {
    const { quantity, note } = req.body;
    const qty = parseInt(quantity);
    const variantId = Number(req.params.id);
    const variant = await prisma.variant.update({ where: { id: variantId }, data: { stock: { increment: qty } } });
    await prisma.movement.create({
      data: { variantId, userId: req.user.id, type: 'ENTRADA', quantity: qty, note },
    });
    res.json(variant);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
