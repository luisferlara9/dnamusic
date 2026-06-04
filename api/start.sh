#!/bin/sh

# Terminar en caso de error
set -e

echo "=== Sincronización de Base de Datos con Prisma ==="

max_attempts=10
attempt=1

while [ $attempt -le $max_attempts ]; do
  echo "Intento $attempt/$max_attempts: Intentando conectar y aplicar esquema de base de datos..."
  
  # Intentamos correr prisma db push. Si tiene éxito, salimos del bucle.
  if npx prisma db push --accept-data-loss; then
    echo "Base de datos sincronizada correctamente con Prisma."
    break
  fi
  
  # Si falló y alcanzamos el límite de intentos, salimos con error
  if [ $attempt -eq $max_attempts ]; then
    echo "Error: No se pudo conectar a la base de datos tras $max_attempts intentos."
    exit 1
  fi
  
  echo "La base de datos no está lista todavía. Reintentando en 3 segundos..."
  attempt=$((attempt + 1))
  sleep 3
done

# Verificar si se debe ejecutar el seed
# Nota: el seed del proyecto crea los usuarios iniciales (Admin/Operadores) si no existen
if [ "$RUN_SEED" = "true" ]; then
  echo "Ejecutando seed de la base de datos..."
  npm run seed
fi

echo "=== Iniciando Servidor Backend DNA Music ==="
exec npm start
