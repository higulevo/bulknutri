import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authMiddleware } from '../middleware/auth.js';
import { upload } from '../utils/cloudinary.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const { search, categoryId, active = 'true' } = req.query;
  const where = { active: active === 'true' };
  if (categoryId) where.categoryId = Number(categoryId);
  if (search) where.OR = [
    { name: { contains: search, mode: 'insensitive' } },
    { brand: { contains: search, mode: 'insensitive' } },
  ];
  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      variants: { where: { active: true }, orderBy: { name: 'asc' } },
    },
    orderBy: { name: 'asc' },
  });
  res.json(products);
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { name, brand, description, costPrice, salePrice, categoryId, hasVariants, stock, minStock } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        brand:       brand       || null,
        description: description || null,
        image:       req.file    ? req.file.path : null,
        costPrice:   parseFloat(costPrice)  || 0,
        salePrice:   parseFloat(salePrice)  || 0,
        hasVariants: hasVariants === 'true'  || hasVariants === true,
        stock:       parseInt(stock)        || 0,
        minStock:    parseInt(minStock)     || 5,
        categoryId:  categoryId ? Number(categoryId) : null,
      },
      include: { category: true, variants: true },
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, brand, description, costPrice, salePrice, categoryId, hasVariants, stock, minStock } = req.body;
    const data = {
      name,
      brand:       brand       || null,
      description: description || null,
      costPrice:   parseFloat(costPrice)  || 0,
      salePrice:   parseFloat(salePrice)  || 0,
      hasVariants: hasVariants === 'true'  || hasVariants === true,
      stock:       parseInt(stock)        || 0,
      minStock:    parseInt(minStock)     || 5,
      categoryId:  categoryId ? Number(categoryId) : null,
    };
    if (req.file) data.image = req.file.path;
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data,
      include: { category: true, variants: true },
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  await prisma.product.update({ where: { id: Number(req.params.id) }, data: { active: false } });
  res.json({ ok: true });
});

router.post('/:id/entry', async (req, res) => {
  try {
    const { quantity, note } = req.body;
    const qty       = parseInt(quantity);
    const productId = Number(req.params.id);
    const product   = await prisma.product.update({
      where: { id: productId },
      data:  { stock: { increment: qty } },
    });
    await prisma.movement.create({
      data: { productId, userId: req.user.id, type: 'ENTRADA', quantity: qty, note: note || null },
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
