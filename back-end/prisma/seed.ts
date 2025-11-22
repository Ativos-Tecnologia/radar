import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

type TribunalSeed = {
  nome: string;
  sigla: string;
  tipo: 'TJ' | 'TRT' | 'TRF';
  uf: string;
  regiao?: number;
  ativo?: boolean;
};

const tribunaisSeed: TribunalSeed[] = [
  // TRFs
  { nome: 'Tribunal Regional Federal da 1ª Região', sigla: 'TRF1', tipo: 'TRF', uf: 'DF', regiao: 1 },
  { nome: 'Tribunal Regional Federal da 2ª Região', sigla: 'TRF2', tipo: 'TRF', uf: 'RJ', regiao: 2 },
  { nome: 'Tribunal Regional Federal da 3ª Região', sigla: 'TRF3', tipo: 'TRF', uf: 'SP', regiao: 3 },
  { nome: 'Tribunal Regional Federal da 4ª Região', sigla: 'TRF4', tipo: 'TRF', uf: 'RS', regiao: 4 },
  { nome: 'Tribunal Regional Federal da 5ª Região', sigla: 'TRF5', tipo: 'TRF', uf: 'PE', regiao: 5 },
  { nome: 'Tribunal Regional Federal da 6ª Região', sigla: 'TRF6', tipo: 'TRF', uf: 'MG', regiao: 6 },
  // TJs
  { nome: 'Tribunal de Justiça do Estado do Acre', sigla: 'TJAC', tipo: 'TJ', uf: 'AC' },
  { nome: 'Tribunal de Justiça do Estado de Alagoas', sigla: 'TJAL', tipo: 'TJ', uf: 'AL' },
  { nome: 'Tribunal de Justiça do Estado do Amazonas', sigla: 'TJAM', tipo: 'TJ', uf: 'AM' },
  { nome: 'Tribunal de Justiça do Estado da Bahia', sigla: 'TJBA', tipo: 'TJ', uf: 'BA' },
  { nome: 'Tribunal de Justiça do Estado do Ceará', sigla: 'TJCE', tipo: 'TJ', uf: 'CE' },
  { nome: 'Tribunal de Justiça do Distrito Federal e dos Territórios', sigla: 'TJDFT', tipo: 'TJ', uf: 'DF' },
  { nome: 'Tribunal de Justiça do Estado do Espírito Santo', sigla: 'TJES', tipo: 'TJ', uf: 'ES' },
  { nome: 'Tribunal de Justiça do Estado de Goiás', sigla: 'TJGO', tipo: 'TJ', uf: 'GO' },
  { nome: 'Tribunal de Justiça do Estado do Maranhão', sigla: 'TJMA', tipo: 'TJ', uf: 'MA' },
  { nome: 'Tribunal de Justiça do Estado de Mato Grosso', sigla: 'TJMT', tipo: 'TJ', uf: 'MT' },
  { nome: 'Tribunal de Justiça do Estado de Mato Grosso do Sul', sigla: 'TJMS', tipo: 'TJ', uf: 'MS' },
  { nome: 'Tribunal de Justiça do Estado de Minas Gerais', sigla: 'TJMG', tipo: 'TJ', uf: 'MG' },
  { nome: 'Tribunal de Justiça do Estado do Pará', sigla: 'TJPA', tipo: 'TJ', uf: 'PA' },
  { nome: 'Tribunal de Justiça do Estado da Paraíba', sigla: 'TJPB', tipo: 'TJ', uf: 'PB' },
  { nome: 'Tribunal de Justiça do Estado do Paraná', sigla: 'TJPR', tipo: 'TJ', uf: 'PR' },
  { nome: 'Tribunal de Justiça do Estado de Pernambuco', sigla: 'TJPE', tipo: 'TJ', uf: 'PE' },
  { nome: 'Tribunal de Justiça do Estado do Piauí', sigla: 'TJPI', tipo: 'TJ', uf: 'PI' },
  { nome: 'Tribunal de Justiça do Estado do Rio de Janeiro', sigla: 'TJRJ', tipo: 'TJ', uf: 'RJ' },
  { nome: 'Tribunal de Justiça do Estado do Rio Grande do Norte', sigla: 'TJRN', tipo: 'TJ', uf: 'RN' },
  { nome: 'Tribunal de Justiça do Estado do Rio Grande do Sul', sigla: 'TJRS', tipo: 'TJ', uf: 'RS' },
  { nome: 'Tribunal de Justiça do Estado de Rondônia', sigla: 'TJRO', tipo: 'TJ', uf: 'RO' },
  { nome: 'Tribunal de Justiça do Estado de Roraima', sigla: 'TJRR', tipo: 'TJ', uf: 'RR' },
  { nome: 'Tribunal de Justiça do Estado de Santa Catarina', sigla: 'TJSC', tipo: 'TJ', uf: 'SC' },
  { nome: 'Tribunal de Justiça do Estado de São Paulo', sigla: 'TJSP', tipo: 'TJ', uf: 'SP' },
  { nome: 'Tribunal de Justiça do Estado de Sergipe', sigla: 'TJSE', tipo: 'TJ', uf: 'SE' },
  { nome: 'Tribunal de Justiça do Estado do Tocantins', sigla: 'TJTO', tipo: 'TJ', uf: 'TO' },
  // TRTs
  { nome: 'Tribunal Regional do Trabalho da 1ª Região', sigla: 'TRT1', tipo: 'TRT', uf: 'RJ', regiao: 1 },
  { nome: 'Tribunal Regional do Trabalho da 2ª Região', sigla: 'TRT2', tipo: 'TRT', uf: 'SP', regiao: 2 },
  { nome: 'Tribunal Regional do Trabalho da 3ª Região', sigla: 'TRT3', tipo: 'TRT', uf: 'MG', regiao: 3 },
  { nome: 'Tribunal Regional do Trabalho da 4ª Região', sigla: 'TRT4', tipo: 'TRT', uf: 'RS', regiao: 4 },
  { nome: 'Tribunal Regional do Trabalho da 5ª Região', sigla: 'TRT5', tipo: 'TRT', uf: 'BA', regiao: 5 },
  { nome: 'Tribunal Regional do Trabalho da 6ª Região', sigla: 'TRT6', tipo: 'TRT', uf: 'PE', regiao: 6 },
  { nome: 'Tribunal Regional do Trabalho da 7ª Região', sigla: 'TRT7', tipo: 'TRT', uf: 'CE', regiao: 7 },
  { nome: 'Tribunal Regional do Trabalho da 8ª Região', sigla: 'TRT8', tipo: 'TRT', uf: 'PA', regiao: 8 },
  { nome: 'Tribunal Regional do Trabalho da 9ª Região', sigla: 'TRT9', tipo: 'TRT', uf: 'PR', regiao: 9 },
  { nome: 'Tribunal Regional do Trabalho da 10ª Região', sigla: 'TRT10', tipo: 'TRT', uf: 'DF', regiao: 10 },
  { nome: 'Tribunal Regional do Trabalho da 11ª Região', sigla: 'TRT11', tipo: 'TRT', uf: 'AM', regiao: 11 },
  { nome: 'Tribunal Regional do Trabalho da 12ª Região', sigla: 'TRT12', tipo: 'TRT', uf: 'SC', regiao: 12 },
  { nome: 'Tribunal Regional do Trabalho da 13ª Região', sigla: 'TRT13', tipo: 'TRT', uf: 'PB', regiao: 13 },
  { nome: 'Tribunal Regional do Trabalho da 14ª Região', sigla: 'TRT14', tipo: 'TRT', uf: 'RO', regiao: 14 },
  { nome: 'Tribunal Regional do Trabalho da 15ª Região', sigla: 'TRT15', tipo: 'TRT', uf: 'SP', regiao: 15 },
  { nome: 'Tribunal Regional do Trabalho da 16ª Região', sigla: 'TRT16', tipo: 'TRT', uf: 'MA', regiao: 16 },
  { nome: 'Tribunal Regional do Trabalho da 17ª Região', sigla: 'TRT17', tipo: 'TRT', uf: 'ES', regiao: 17 },
  { nome: 'Tribunal Regional do Trabalho da 18ª Região', sigla: 'TRT18', tipo: 'TRT', uf: 'GO', regiao: 18 },
  { nome: 'Tribunal Regional do Trabalho da 19ª Região', sigla: 'TRT19', tipo: 'TRT', uf: 'AL', regiao: 19 },
  { nome: 'Tribunal Regional do Trabalho da 20ª Região', sigla: 'TRT20', tipo: 'TRT', uf: 'SE', regiao: 20 },
  { nome: 'Tribunal Regional do Trabalho da 21ª Região', sigla: 'TRT21', tipo: 'TRT', uf: 'RN', regiao: 21 },
  { nome: 'Tribunal Regional do Trabalho da 22ª Região', sigla: 'TRT22', tipo: 'TRT', uf: 'PI', regiao: 22 },
  { nome: 'Tribunal Regional do Trabalho da 23ª Região', sigla: 'TRT23', tipo: 'TRT', uf: 'MT', regiao: 23 },
  { nome: 'Tribunal Regional do Trabalho da 24ª Região', sigla: 'TRT24', tipo: 'TRT', uf: 'MS', regiao: 24 },
];

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

  for (const tribunal of tribunaisSeed) {
    await prisma.tribunal.upsert({
      where: { sigla: tribunal.sigla },
      update: tribunal,
      create: { ...tribunal, ativo: tribunal.ativo ?? true },
    });
  }

  console.log(`✅ Tribunais sincronizados (${tribunaisSeed.length})`);

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
