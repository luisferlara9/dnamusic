#!/bin/bash

# Terminar en caso de error
set -e

echo "=== Sincronización de Base de Datos con Prisma ==="

# Bucle de reintentos por si la DB no está lista de inmediato
max_attempts=10
attempt=1

until npx prisma db push --accept-data-loss || [ $attempt -eq $max_attempts ]; do
  echo "Intento $attempt/$max_attempts: Base de datos no disponible, esperando 3 segundos..."
  attempt=$((attempt + 1))
  sleep 3
done

if [ $attempt -eq $max_attempts ]; do
  echo "Error: No se pudo conectar a la base de datos tras $max_attempts intentos."
  exit 1
fi

echo "Base de datos sincronizada correctamente con Prisma."

# Verificar si se debe ejecutar el seed (puedes ejecutarlo manualmente o dejarlo automático)
# Nota: el seed del proyecto crea los usuarios iniciales (Admin/Operadores) si no existen
if [ "$RUN_SEED" = "true" ]; then
  echo "Ejecutando seed de la base de datos..."
  npm run seed
fi

echo "=== Iniciando Servidor Backend DNA Music ==="
exec npm start
