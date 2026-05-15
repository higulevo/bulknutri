import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json(cats);
});

router.post('/', async (req, res) => {
  const { name } = req.body;
  try {
    const cat = await prisma.category.create({ data: { name } });
    res.json(cat);
  } catch {
    res.status(400).json({ error: 'Categoria já existe' });
  }
});

router.delete('/:id', async (req, res) => {
  await prisma.category.delete({ where: { id: Number(req.params.id) } });
  res.json({ ok: true });
});

export default router;
