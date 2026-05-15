import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  await prisma.movement.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.variant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const users = [
    { username: 'higor',    password: 'higor123',    name: 'Higor'    },
    { username: 'fernando', password: 'fernando123', name: 'Fernando' },
    { username: 'gabriel',  password: 'gabriel123',  name: 'Gabriel'  },
  ];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    await prisma.user.create({ data: { username: u.username, password: hash, name: u.name } });
  }

  console.log('✅ Seed concluído!');
  console.log('👤 higor / higor123');
  console.log('👤 fernando / fernando123');
  console.log('👤 gabriel / gabriel123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
