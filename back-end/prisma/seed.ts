import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Criar usuário admin padrão
  const adminEmail = 'admin@radar.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const senhaHash = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        nomeCompleto: 'Administrador',
        email: adminEmail,
        departamento: 'TI',
        senhaHash,
        role: 'ADMIN',
        ativo: true,
      },
    });

    console.log('✅ Usuário admin criado:');
    console.log('   Email:', admin.email);
    console.log('   Senha: admin123');
    console.log('   ⚠️  ALTERE A SENHA APÓS O PRIMEIRO LOGIN!');
  } else {
    console.log('ℹ️  Usuário admin já existe');
  }

  console.log('✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
