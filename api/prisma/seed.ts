// ──────────────────────────────────────────────────────────────
// DNA Music API — Prisma Seed
// Poblar la base de datos con los datos obligatorios de la prueba
// ──────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seedeo de la base de datos...');

  // 1. Limpiar base de datos
  await prisma.estudiante.deleteMany();
  await prisma.user.deleteMany();
  await prisma.sede.deleteMany();

  // 2. Crear Sedes
  const sedeBogota = await prisma.sede.create({
    data: {
      nombre: 'Sede Bogotá',
      ciudad: 'Bogotá',
      direccion: 'Calle 100 # 15-20',
      estado: 'ACTIVA',
    },
  });

  const sedeMedellin = await prisma.sede.create({
    data: {
      nombre: 'Sede Medellín',
      ciudad: 'Medellín',
      direccion: 'Carrera 43A # 1-50',
      estado: 'ACTIVA',
    },
  });

  const sedeCali = await prisma.sede.create({
    data: {
      nombre: 'Sede Cali',
      ciudad: 'Cali',
      direccion: 'Avenida 6N # 20-30',
      estado: 'ACTIVA',
    },
  });

  console.log('✅ Sedes creadas');

  // 3. Crear Administrador Principal Original
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dnamusic.co' },
    update: {
      password: adminPassword,
    },
    create: {
      nombre: 'Administrador Principal',
      email: 'admin@dnamusic.co',
      password: adminPassword,
      rol: 'ADMIN',
    },
  });

  console.log(`✅ Administrador maestro original restaurado: ${admin.email} / Admin123!`);

  // Operador BOG
  const passwordOperador = await bcrypt.hash('Oper123!', 10);
  await prisma.user.create({
    data: {
      nombre: 'Operador Bogotá',
      email: 'operador.bog@dnamusic.co',
      password: passwordOperador,
      rol: 'OPERADOR',
      sedeId: sedeBogota.id,
    },
  });

  // Operador MED
  await prisma.user.create({
    data: {
      nombre: 'Operador Medellín',
      email: 'operador.med@dnamusic.co',
      password: passwordOperador,
      rol: 'OPERADOR',
      sedeId: sedeMedellin.id,
    },
  });

  console.log('✅ Usuarios creadas');

  // 4. Crear Estudiantes (Al menos 5)
  const estudiantesData = [
    {
      nombreCompleto: 'Juan Pérez',
      email: 'juan.perez@email.com',
      telefono: '3001234567',
      documentoIdentidad: '1000111222',
      programa: 'Producción Musical',
      estado: 'ACTIVO',
      sedeId: sedeBogota.id,
    },
    {
      nombreCompleto: 'María Gómez',
      email: 'maria.gomez@email.com',
      telefono: '3109876543',
      documentoIdentidad: '1000333444',
      programa: 'DJ Profesional',
      estado: 'ACTIVO',
      sedeId: sedeBogota.id,
    },
    {
      nombreCompleto: 'Carlos Ruiz',
      email: 'carlos.ruiz@email.com',
      telefono: '3205556677',
      documentoIdentidad: '1000555666',
      programa: 'Técnica Vocal',
      estado: 'INACTIVO',
      sedeId: sedeMedellin.id,
    },
    {
      nombreCompleto: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      telefono: '3151112233',
      documentoIdentidad: '1000777888',
      programa: 'Producción Musical',
      estado: 'ACTIVO',
      sedeId: sedeMedellin.id,
    },
    {
      nombreCompleto: 'Luis Herrera',
      email: 'luis.herrera@email.com',
      telefono: '3009998877',
      documentoIdentidad: '1000999000',
      programa: 'Instrumentos (Guitarra)',
      estado: 'RETIRADO',
      sedeId: sedeCali.id,
    },
  ];

  for (const est of estudiantesData) {
    await prisma.estudiante.create({
      data: est,
    });
  }

  console.log('✅ Estudiantes creados');
  console.log('🎉 Seed finalizado correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
