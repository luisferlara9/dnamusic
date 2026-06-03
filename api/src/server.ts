// ──────────────────────────────────────────────────────────────
// DNA Music API — Server Entry Point
// Inicializa la base de datos y levanta el servidor
// ──────────────────────────────────────────────────────────────

import app from './app';
import { config } from './config';
import prisma from './lib/prisma';

const startServer = async () => {
  try {
    // Verificar conexión a la BD antes de levantar el server
    await prisma.$connect();
    console.log('✅ Conexión a la base de datos establecida');

    app.listen(config.port, () => {
      console.log(`🚀 Servidor ejecutándose en: http://localhost:${config.port}`);
      console.log(`🌍 Ambiente: ${config.nodeEnv}`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejo de cierres limpios
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('🛑 Conexión a la base de datos cerrada (SIGINT)');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  console.log('🛑 Conexión a la base de datos cerrada (SIGTERM)');
  process.exit(0);
});

startServer();
