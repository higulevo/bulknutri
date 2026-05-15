import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { status, method, search, page = 1, limit = 20 } = req.query;
  const where = {};
  if (status) where.paymentStatus = status;
  if (method) where.paymentMethod = method;
  if (search) where.customerName = { contains: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        user: { select: { name: true } },
        items: {
          include: {
            variant: { include: { product: true } },
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.sale.count({ where }),
  ]);
  res.json({ sales, total, pages: Math.ceil(total / Number(limit)) });
});

router.get('/pending', async (req, res) => {
  const sales = await prisma.sale.findMany({
    where: { paymentStatus: 'PENDENTE' },
    include: {
      user: { select: { name: true } },
      items: {
        include: {
          variant: { include: { product: true } },
          product: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  const totalPending = sales.reduce((s, x) => s + x.total, 0);
  res.json({ sales, totalPending });
});

router.post('/', async (req, res) => {
  try {
    const { customerName, customerPhone, paymentMethod, paymentStatus, note, items, discount = 0 } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ error: 'Nenhum item na venda' });

    // Valida estoque de cada item
    for (const item of items) {
      if (item.variantId) {
        const variant = await prisma.variant.findUnique({ where: { id: item.variantId } });
        if (!variant) return res.status(400).json({ error: 'Variante não encontrada' });
        if (variant.stock < item.quantity) return res.status(400).json({ error: `Estoque insuficiente: ${variant.name}` });
      } else if (item.productId) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) return res.status(400).json({ error: 'Produto não encontrado' });
        if (product.stock < item.quantity) return res.status(400).json({ error: `Estoque insuficiente: ${product.name}` });
      }
    }

    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const discountAmt = Math.min(Math.max(Number(discount) || 0, 0), subtotal);
    const total = subtotal - discountAmt;

    const sale = await prisma.sale.create({
      data: {
        userId: req.user.id,
        customerName: customerName || null,
        customerPhone: customerPhone || null,
        paymentMethod,
        paymentStatus: paymentStatus || (paymentMethod === 'FIADO' ? 'PENDENTE' : 'PAGO'),
        note: note || null,
        discount: discountAmt,
        total,
        paidAt: paymentMethod !== 'FIADO' ? new Date() : null,
        items: {
          create: items.map(i => ({
            variantId: i.variantId || null,
            productId: i.productId || null,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            total: i.unitPrice * i.quantity,
          })),
        },
      },
      include: {
        items: { include: { variant: { include: { product: true } }, product: true } },
        user: { select: { name: true } },
      },
    });

    // Baixa estoque
    for (const item of items) {
      if (item.variantId) {
        await prisma.variant.update({ where: { id: item.variantId }, data: { stock: { decrement: item.quantity } } });
        await prisma.movement.create({
          data: { variantId: item.variantId, userId: req.user.id, type: 'VENDA', quantity: -item.quantity, saleId: sale.id, note: `Venda #${sale.id}` },
        });
      } else if (item.productId) {
        await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        await prisma.movement.create({
          data: { productId: item.productId, userId: req.user.id, type: 'VENDA', quantity: -item.quantity, saleId: sale.id, note: `Venda #${sale.id}` },
        });
      }
    }

    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/pay', async (req, res) => {
  try {
    const sale = await prisma.sale.update({
      where: { id: Number(req.params.id) },
      data: { paymentStatus: 'PAGO', paidAt: new Date() },
    });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: Number(req.params.id) },
      include: { items: true },
    });
    if (!sale) return res.status(404).json({ error: 'Venda não encontrada' });

    // Restaura estoque
    for (const item of sale.items) {
      if (item.variantId) {
        await prisma.variant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } });
      } else if (item.productId) {
        await prisma.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
      }
    }

    await prisma.movement.deleteMany({ where: { saleId: sale.id } });
    await prisma.saleItem.deleteMany({ where: { saleId: sale.id } });
    await prisma.sale.delete({ where: { id: sale.id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
