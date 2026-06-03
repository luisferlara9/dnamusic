# DNA Music — Sistema de Gestión de Estudiantes

> Prueba técnica para Desarrollador Backend Jr.

## 1. Cómo correr el proyecto localmente

1. Clona este repositorio:
   ```bash
   git clone <url-del-repo>
   cd dnamusic
   ```

2. Inicia la base de datos utilizando Docker Compose (en la raíz del proyecto):
   ```bash
   docker compose up -d
   ```
   *(Esto levantará un contenedor de PostgreSQL en el puerto `5432` con usuario `postgres`, contraseña `123456` y base de datos `dnamusic`)*

3. Instala dependencias y prepara el **Backend**:
   ```bash
   cd api
   npm install
   cp .env.example .env
   npx prisma generate
   npx prisma db push
   npm run seed
   npm run dev
   ```
   > El servidor backend correrá en `http://localhost:3000`

4. Instala dependencias y arranca el **Frontend** (en otra terminal):
   ```bash
   cd ..
   cd web
   npm install
   npm run dev
   ```
   > El cliente frontend correrá en `http://localhost:5173`

## 2. URLs de despliegue

- **Backend API:** [Pendiente]
- **Frontend App:** [Pendiente]

## 3. Credenciales de prueba

La base de datos se inicializa con los siguientes usuarios de prueba:

| Rol | Email | Contraseña | Acceso |
|---|---|---|---|
| **ADMIN** | `admin@dnamusic.co` | `Admin123!` | Todo el sistema |
| **OPERADOR** | `operador.bog@dnamusic.co` | `Oper123!` | Solo sede Bogotá |
| **OPERADOR** | `operador.med@dnamusic.co` | `Oper123!` | Solo sede Medellín |

## 4. Decisiones técnicas

- **Backend:** Express + TypeScript. Express por ser el estándar más ligero y robusto. TypeScript para type safety de extremo a extremo.
- **Base de Datos:** PostgreSQL + Prisma. Se migró el motor de datos a PostgreSQL (el motor preferido de producción de la prueba) y se suministró un archivo `docker-compose.yml` para simplificar la inicialización del motor de base de datos en local con un solo comando.
- **Arquitectura:** Estructura modular (rutas, controladores, middlewares, schemas, lib) para separar responsabilidades.
- **Frontend:** React (Vite) + TypeScript. Framework moderno, rápido, con separación de componentes y diseño cyberpunk neón.

## 5. Decisiones de seguridad (Implementadas)

1. **Protección contra fuerza bruta:** `express-rate-limit` con reglas estrictas (5 intentos por 15 min) específicas para el endpoint `/api/auth/login`.
2. **Rate Limiting Global:** Protección contra abuso de la API general (100 req/15min).
3. **Hashing Seguro:** Se utiliza `bcryptjs` con un saltRounds de 10.
4. **Mensajes Genéricos:** El login retorna "Credenciales inválidas" siempre, evitando *email enumeration*.
5. **Security Headers:** Implementado `Helmet` para configurar cabeceras HTTP seguras contra XSS y Clickjacking.
6. **CORS Restringido:** Configurado para permitir acceso solo desde el origen del frontend declarado.
7. **Validación de Inputs:** Utilizado `Zod` para asegurar que todo request body tenga el esquema esperado, previniendo inyección de datos maliciosos o payloads gigantes (limitado además a 10MB con el middleware de express).

*Dejado fuera por tiempo:* Refresh tokens, rotación de claves, bloqueo de IP automático en base de datos.

## 6. Qué haría diferente con más tiempo

1. Movería la autenticación JWT de headers a **Cookies HttpOnly** para mitigar completamente los ataques XSS.
2. Implementaría **Tests** unitarios y de integración con Jest/Supertest.
3. Añadiría **Logs Estructurados** (Winston/Pino) para tener mejor trazabilidad en producción.
4. Crearía un flujo completo de refresh tokens para extender las sesiones de manera segura.

## 7. Diagrama de la base de datos

```mermaid
erDiagram
    USER {
        Int id PK
        String nombre
        String email UK
        String password
        String rol "ADMIN | OPERADOR"
        Int sedeId FK "nullable"
    }
    SEDE {
        Int id PK
        String nombre
        String ciudad
        String direccion
        String estado "ACTIVA | INACTIVA"
    }
    ESTUDIANTE {
        Int id PK
        String nombreCompleto
        String email UK
        String telefono
        String documentoIdentidad UK
        Int sedeId FK
        String programa
        String estado "ACTIVO | INACTIVO | RETIRADO"
        DateTime fechaInscripcion
    }

    USER }|--o| SEDE : "pertenece a (si OPERADOR)"
    ESTUDIANTE }|--|| SEDE : "inscrito en"
```

## 8. Comandos Git utilizados

```bash
# Iniciar proyecto
git init
git add .
git commit -m "chore: inicializar estructura base del proyecto"

# Crear nueva rama
git checkout -b feature/auth

# Commits con conventional commits
git add .
git commit -m "feat: implementar registro y login con JWT"
git commit -m "feat: agregar rate limiting contra fuerza bruta"

# Subir cambios
git push -u origin feature/auth
```

## 9. Despliegue de Producción con Docker Compose

Para desplegar la aplicación completa (Base de datos PostgreSQL, Backend Express API y Frontend React SPA servido por Nginx) en un servidor de producción utilizando Docker Compose, sigue estos pasos:

1. **Preparar variables de entorno:**
   Copia la plantilla de producción en la raíz del proyecto para crear el archivo `.env`:
   ```bash
   cp .env.prod.example .env
   ```

2. **Configurar el archivo `.env`:**
   Edita el archivo `.env` configurando los siguientes parámetros críticos para producción:
   - `VITE_API_URL`: **Muy Importante**. Establécelo como la URL pública del API a la que se conectará el navegador del cliente (ej. `http://<IP_PÚBLICA_SERVIDOR>:3000` o `https://api.dnamusic.co`). *Nota: Durante la fase de construcción de la imagen de frontend, Vite embeberá esta URL en los bundles de JS*.
   - `CORS_ORIGIN`: El origen del cliente (ej. `http://<IP_PÚBLICA_SERVIDOR>` o `https://dnamusic.co`).
   - `DB_PASSWORD`: Una contraseña fuerte para la base de datos PostgreSQL.
   - `RUN_SEED`: `true` para sembrar los datos iniciales de prueba (Admin/Operadores) en la primera corrida.

3. **Iniciar los servicios con Docker Compose:**
   Ejecuta el comando de construcción e inicio:
   ```bash
   docker compose up -d --build
   ```

4. **Verificación:**
   - El **Frontend** estará disponible en el puerto expuesto de HTTP (puerto `80` por defecto en `.env`), servido eficientemente por **Nginx**.
   - El **Backend** estará disponible en el puerto `3000` (o el configurado en `BACKEND_PORT`).
   - La base de datos ejecutará automáticamente el script `start.sh` del backend para sincronizar el esquema de Prisma y ejecutar el seed de datos.
   - Los datos de PostgreSQL se persisten en el volumen `pgdata`, y las imágenes de perfil subidas se persisten en el volumen local `./api/uploads`.

