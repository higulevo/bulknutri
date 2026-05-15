import { Router } from 'express';
import prisma from '../utils/prisma.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const today    = new Date(); today.setHours(0,  0,  0,   0);
    const todayEnd = new Date(); todayEnd.setHours(23, 59, 59, 999);

    // Últimos 7 dias: busca vendas e agrupa em JS (evita BigInt do SQLite $queryRaw)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      todaySalesRaw,
      recentSales,
      totalRevenueAgg,
      pendingRevenueAgg,
      last7DaysRaw,
      lowStockVariants,
      outOfStockVariants,
      lowStockProducts,
      outOfStockProducts,
      availableProducts,
      topVariantItems,
      topProductItems,
    ] = await Promise.all([
      prisma.product.count({ where: { active: true } }),

      prisma.sale.findMany({
        where: { createdAt: { gte: today, lte: todayEnd } },
        select: { total: true },
      }),

      prisma.sale.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true } },
          items: {
            include: {
              variant: { include: { product: true } },
              product: true,
            },
          },
        },
      }),

      prisma.sale.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAGO' } }),
      prisma.sale.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PENDENTE' } }),

      prisma.sale.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { total: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),

      prisma.variant.count({ where: { active: true, stock: { gt: 0, lte: 5 } } }),
      prisma.variant.count({ where: { active: true, stock: 0 } }),
      prisma.product.count({ where: { active: true, hasVariants: false, stock: { gt: 0, lte: 5 } } }),
      prisma.product.count({ where: { active: true, hasVariants: false, stock: 0 } }),

      prisma.product.count({
        where: {
          active: true,
          OR: [
            { hasVariants: false, stock: { gt: 0 } },
            { hasVariants: true, variants: { some: { active: true, stock: { gt: 0 } } } },
          ],
        },
      }),

      prisma.saleItem.groupBy({
        by: ['variantId'], _sum: { quantity: true },
        where: { variantId: { not: null } },
        orderBy: { _sum: { quantity: 'desc' } }, take: 5,
      }),
      prisma.saleItem.groupBy({
        by: ['productId'], _sum: { quantity: true },
        where: { productId: { not: null } },
        orderBy: { _sum: { quantity: 'desc' } }, take: 5,
      }),
    ]);

    // Agrupa vendas dos últimos 7 dias por dia em JS puro (sem BigInt)
    const dayMap = {};
    for (const sale of last7DaysRaw) {
      const day = sale.createdAt.toISOString().slice(0, 10);
      if (!dayMap[day]) dayMap[day] = { day, total: 0, count: 0 };
      dayMap[day].total += sale.total;
      dayMap[day].count += 1;
    }
    const last7Days = Object.values(dayMap).sort((a, b) => a.day.localeCompare(b.day));

    // Top vendidos: busca detalhes das variantes/produtos
    const topSellingVariants = await Promise.all(
      topVariantItems
        .filter(i => i.variantId)
        .map(async i => {
          const variant = await prisma.variant.findUnique({
            where: { id: i.variantId },
            include: { product: true },
          });
          return { variantId: i.variantId, _sum: { quantity: i._sum.quantity ?? 0 }, variant };
        })
    );
    const topSellingProducts = await Promise.all(
      topProductItems
        .filter(i => i.productId)
        .map(async i => {
          const product = await prisma.product.findUnique({ where: { id: i.productId } });
          return { productId: i.productId, _sum: { quantity: i._sum.quantity ?? 0 }, product };
        })
    );

    const topSelling = [...topSellingVariants, ...topSellingProducts]
      .sort((a, b) => (b._sum.quantity ?? 0) - (a._sum.quantity ?? 0))
      .slice(0, 5);

    res.json({
      products: {
        total:      totalProducts,
        available:  availableProducts,
        lowStock:   lowStockVariants + lowStockProducts,
        outOfStock: outOfStockVariants + outOfStockProducts,
      },
      revenue: {
        total:   totalRevenueAgg._sum.total   ?? 0,
        pending: pendingRevenueAgg._sum.total ?? 0,
      },
      todaySales: {
        count: todaySalesRaw.length,
        total: todaySalesRaw.reduce((s, x) => s + x.total, 0),
      },
      recentSales,
      topSelling,
      last7Days,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
