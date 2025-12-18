# SECOP API

API REST desarrollada con NestJS y Prisma para el Sistema de Compras y Contratación Pública (SECOP). Sistema completo de gestión de presupuestos, requisiciones, inventarios y traslados de activos.

## 🚀 Tecnologías

- **NestJS 11** - Framework progresivo de Node.js
- **Prisma 7** - ORM de última generación
- **MySQL 8.0 / MariaDB** - Base de datos relacional
- **TypeScript 5.7** - Superset tipado de JavaScript
- **Azure AD (MSAL)** - Autenticación con Microsoft 365
- **JWT + Passport** - Autenticación y autorización
- **Express Session** - Gestión de sesiones
- **bcrypt** - Encriptación de contraseñas
- **class-validator** - Validación de DTOs
- **ESLint + Prettier** - Linting y formateo de código
- **Docker + Docker Compose** - Containerización

## 📋 Requisitos Previos

- **Node.js** >= 20.x
- **pnpm** >= 8.x
- **MySQL/MariaDB** >= 8.x
- **Docker** (opcional)

## 🔧 Instalación

### Opción 1: Instalación Local

```bash
# Clonar repositorio
git clone <repository-url>
cd secop-api

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Generar cliente de Prisma
pnpm prisma:generate

# Ejecutar migraciones
pnpm prisma:migrate

# (Opcional) Poblar base de datos
pnpm prisma:seed
```

### Opción 2: Instalación con Docker

```bash
# Iniciar base de datos
docker-compose up -d

# La base de datos estará disponible en:
# Host: localhost
# Puerto: 3306
# Usuario: secop-user
# Contraseña: secop-password
# Base de datos: secop-database
```

## 🗄️ Base de Datos

### Modelo de Datos

El sistema incluye los siguientes modelos principales:

- **Usuario** - Gestión de usuarios y roles
- **Rol** - Roles y permisos
- **Área** - Áreas organizacionales
- **Presupuesto** - Gestión presupuestaria
- **Requisición** - Solicitudes de compra
- **Producto** - Catálogo de productos
- **Proveedor** - Gestión de proveedores
- **Inventario** - Control de inventarios
- **Traslado de Activos** - Movimiento de activos entre áreas
- **Concepto Contable** - Clasificación contable
- **Cuenta Contable** - Plan de cuentas
- **Auditoría** - Trazabilidad de cambios

### Scripts de Base de Datos

```bash
# Generar cliente de Prisma
pnpm prisma:generate

# Crear nueva migración
pnpm prisma:migrate

# Aplicar migraciones en producción
pnpm prisma:migrate:deploy

# Abrir Prisma Studio (GUI)
pnpm prisma:studio

# Poblar base de datos con datos iniciales
pnpm prisma:seed

# Resetear base de datos
pnpm prisma:reset
```

## 🏃 Ejecución

### Modo Desarrollo

```bash
# Iniciar con hot-reload
pnpm start:dev

# Iniciar con debug
pnpm start:debug
```

### Modo Producción

```bash
# Compilar proyecto
pnpm build

# Iniciar aplicación compilada
pnpm start:prod
```

### Con Docker

```bash
# Construir imagen
docker build -t secop-api .

# Ejecutar contenedor
docker run -p 3001:3001 --env-file .env secop-api
```

## 🧪 Testing

```bash
# Tests unitarios
pnpm test

# Tests en modo watch
pnpm test:watch

# Tests e2e
pnpm test:e2e

# Cobertura de código
pnpm test:cov

# Tests con debug
pnpm test:debug
```

## 📝 Scripts Disponibles

### Build & Start

- `pnpm build` - Compilar el proyecto
- `pnpm start` - Iniciar aplicación
- `pnpm start:dev` - Iniciar en modo desarrollo con watch
- `pnpm start:debug` - Iniciar con debugger
- `pnpm start:prod` - Iniciar aplicación compilada

### Calidad de Código

- `pnpm lint` - Ejecutar ESLint y auto-fix
- `pnpm lint:check` - Verificar errores sin auto-fix
- `pnpm format` - Formatear código con Prettier
- `pnpm format:check` - Verificar formato sin aplicar cambios

### Base de Datos

- `pnpm prisma:generate` - Generar cliente de Prisma
- `pnpm prisma:migrate` - Crear y aplicar migración
- `pnpm prisma:migrate:deploy` - Aplicar migraciones en producción
- `pnpm prisma:studio` - Abrir interfaz visual de BD
- `pnpm prisma:seed` - Ejecutar seed de datos
- `pnpm prisma:reset` - Resetear base de datos

### Testing

- `pnpm test` - Ejecutar tests unitarios
- `pnpm test:watch` - Tests en modo watch
- `pnpm test:cov` - Tests con cobertura
- `pnpm test:debug` - Tests con debugger
- `pnpm test:e2e` - Tests end-to-end

## 📁 Estructura del Proyecto

### 🗂️ Arquitectura General

El proyecto sigue una arquitectura modular basada en NestJS, organizada en capas con separación de responsabilidades:

```
secop-api/
├── 📂 prisma/                   # Capa de datos y persistencia
├── 📂 src/                      # Código fuente de la aplicación
├── 📂 dist/                     # Código compilado (TypeScript → JavaScript)
├── 📂 test/                     # Tests end-to-end
├── 📂 docker/                   # Configuración de Docker
├── 📂 node_modules/             # Dependencias instaladas
└── 📄 Archivos de configuración
```

---

### 📂 **Directorio `prisma/`** - Capa de Datos

Gestión de base de datos con Prisma ORM:

```
prisma/
├── schema.prisma          # Esquema de la base de datos
│                          # - 12 modelos de datos principales
│                          # - Relaciones entre entidades
│                          # - Enums: tipoDocumento, estadoPresupuesto, estadoRequisicion
│                          # - Configuración del cliente Prisma (output: src/generated/prisma)
│
├── prisma.module.ts       # Módulo NestJS para inyección de dependencias
│                          # - Exporta PrismaService para uso global
│
├── prisma.service.ts      # Servicio de conexión a base de datos
│                          # - Extiende PrismaClient con lifecycle hooks
│                          # - Gestión de conexión y desconexión automática
│                          # - Logs de conexión en modo desarrollo
│
├── seed.ts                # Script de población de datos iniciales
│                          # - Crea roles predeterminados
│                          # - Usuario administrador por defecto
│                          # - Datos de prueba para desarrollo
│
└── migrations/            # Historial de migraciones de base de datos
                           # - Control de versiones del esquema
                           # - Aplicadas automáticamente con prisma migrate
```

#### 🗄️ Modelos de Base de Datos

| Modelo                    | Descripción             | Relaciones                                                     |
| ------------------------- | ----------------------- | -------------------------------------------------------------- |
| **usuario**               | Usuarios del sistema    | → rol, areas, auditorias                                       |
| **rol**                   | Roles y permisos        | ← usuarios                                                     |
| **area**                  | Áreas organizacionales  | → usuario, presupuestos, requisiciones, inventarios, traslados |
| **presupuesto**           | Gestión presupuestaria  | → area, articulos_presupuestos                                 |
| **producto**              | Catálogo de productos   | → concepto_contable, inventarios, artículos                    |
| **concepto_contable**     | Clasificación contable  | → cuenta_contable, productos, artículos                        |
| **cuenta_contable**       | Plan de cuentas         | ← conceptos, artículos                                         |
| **articulos_presupuesto** | Items del presupuesto   | → presupuesto, cuentas, conceptos, productos                   |
| **proveedor**             | Proveedores             | ← requisiciones                                                |
| **articulo_requisicion**  | Items de requisición    | → requisicion, cuentas, conceptos, productos                   |
| **requisicion**           | Solicitudes de compra   | → area, proveedor, artículos                                   |
| **inventario**            | Control de inventarios  | → area, producto, traslados                                    |
| **traslado_activos**      | Movimiento de activos   | → inventario, area_origen, area_destino                        |
| **auditoria**             | Trazabilidad de cambios | → usuarios (createdBy, updatedBy)                              |

---

### 📂 **Directorio `src/`** - Código Fuente Principal

#### 📄 **Archivos Raíz**

```
src/
├── main.ts                # 🚀 Punto de entrada de la aplicación
│   ├── Configuración de Express Session
│   ├── Cookie Parser para JWT en cookies
│   ├── CORS con credenciales habilitadas
│   ├── Filtros globales (HttpExceptionFilter)
│   ├── Interceptores globales (LoggingInterceptor)
│   ├── ValidationPipe global (whitelist, transform)
│   └── Bootstrap de la aplicación en puerto 3001
│
└── app.module.ts          # 📦 Módulo raíz de NestJS
    ├── Importa: PrismaModule, AuthModule
    ├── Guard global: JwtAuthGuard (APP_GUARD)
    └── Protección JWT aplicada a todos los endpoints
```

---

#### 📂 **`src/auth/`** - Módulo de Autenticación

Sistema de autenticación híbrido (Azure AD + JWT):

```
auth/
├── 📄 auth.module.ts              # Configuración del módulo
│   ├── PassportModule (estrategia: jwt)
│   ├── JwtModule (secret, expiresIn: 7d)
│   └── Providers: AuthService, JwtStrategy, MsalConfigService
│
├── 📄 auth.controller.ts          # Endpoints de autenticación
│   ├── GET  /auth/login           → Redirige a Microsoft 365
│   ├── GET  /auth/callback        → Callback de Azure AD + genera JWT
│   ├── GET  /auth/logout          → Limpia sesión y cookies
│   ├── POST /auth/refresh         → Renueva token JWT
│   └── GET  /auth/me              → Obtiene usuario autenticado
│
├── 📄 auth.service.ts             # Lógica de negocio
│   ├── validateAzureUser()        → Valida token de Azure AD
│   ├── generateJwtToken()         → Genera JWT interno
│   ├── validateUser()             → Valida credenciales
│   └── createUser()               → Registra nuevos usuarios
│
├── 📄 msal.config.ts              # Configuración de Microsoft Authentication Library
│   ├── ConfidentialClientApplication
│   ├── Tenant ID, Client ID, Client Secret
│   └── Redirect URI (/auth/callback)
│
├── 📂 decorators/                 # Decoradores personalizados
│   ├── current-user.decorator.ts  → @CurrentUser() extrae usuario de request
│   └── public.decorator.ts        → @Public() marca endpoints sin autenticación
│
├── 📂 dto/                        # Data Transfer Objects
│   ├── login.dto.ts               → Validación de login (email, password)
│   ├── register.dto.ts            → Validación de registro
│   ├── create-auth.dto.ts         → Creación de usuarios
│   └── update-auth.dto.ts         → Actualización de usuarios
│
├── 📂 guards/                     # Guards de protección
│   └── jwt-auth.guard.ts          → Verifica JWT en cada request
│       ├── Permite endpoints con @Public()
│       ├── Valida token JWT en cookies/headers
│       └── Inyecta usuario en request.user
│
├── 📂 strategies/                 # Estrategias de Passport
│   └── jwt.strategy.ts            → Estrategia de validación JWT
│       ├── Extrae token de cookies (access_token)
│       ├── Valida firma con JWT_SECRET
│       └── Retorna payload decodificado
│
├── 📂 interfaces/                 # Interfaces TypeScript
│   ├── jwt-payload.interface.ts   → Estructura del payload JWT
│   └── auth-response.interface.ts → Respuesta de autenticación
│
└── 📂 entities/
    └── auth.entity.ts             → Entidad de autenticación
```

# Logger Singleton

Sistema de logging centralizado para la aplicación.

## Uso

```typescript
import { logger } from '@/common';

// Log simple
logger.log('Mensaje informativo');

// Log con contexto
logger.log('Usuario creado exitosamente', 'UserService');

// Error con stack trace
logger.error('Error al conectar', error.stack, 'DatabaseService');

// Warning
logger.warn('Advertencia: límite alcanzado', 'RateLimiter');

// Debug (solo en desarrollo)
logger.debug('Datos de depuración', 'DebugContext');

// Verbose
logger.verbose('Información detallada', 'DetailedContext');
```

## Obtener instancia específica

```typescript
import { LoggerService } from '@/common';

const loggerService = LoggerService.getInstance();
const myLogger = loggerService.getLogger('MiContexto');

myLogger.log('Mensaje desde mi contexto');
```

## Características

- **Singleton**: Una única instancia en toda la aplicación
- **Contextos**: Cada logger puede tener su propio contexto
- **Cache**: Los loggers se cachean para evitar crear múltiples instancias
- **Compatible**: Usa el Logger nativo de NestJS internamente


#### 📂 **`src/common/logger`** - Módulo de Logger

logger/
├── index.ts
├── logger.service.ts Configuracion para cada tipo de logger
└──

**Flujo de Autenticación:**

1. Usuario → `GET /auth/login`
2. Redirigir a Microsoft 365
3. Usuario ingresa credenciales corporativas
4. Azure redirige → `GET /auth/callback?code=...`
5. Validar token Azure + verificar tenant
6. Generar JWT interno (7 días)
7. Guardar JWT en cookie HttpOnly
8. Redirigir al frontend

---

#### 📂 **`src/common/`** - Recursos Compartidos

Utilidades y componentes transversales:

```
common/
├── 📂 filters/                    # Filtros de excepciones
│   └── http-exception.filter.ts   → Manejo global de errores HTTP
│       ├── Captura HttpException
│       ├── Formatea respuesta: { success, message, error, statusCode }
│       └── Logs de errores con contexto
│
├── 📂 interceptors/               # Interceptores HTTP
│   ├── logging.interceptor.ts     → Logging de requests/responses
│   │   ├── Registra método, URL, tiempo de respuesta
│   │   └── Útil para debugging y auditoría
│   │
│   └── transform.interceptor.ts   → Transformación de respuestas
│       ├── Normaliza todas las respuestas
│       └── Formato: { success, message, data }
│
├── 📂 interfaces/                 # Interfaces compartidas
│   ├── response.interface.ts      → Interface de respuesta estándar
│   └── index.ts                   → Exportaciones centralizadas
│
└── index.ts                       # Barrel export de common
```

---

#### 📂 **`src/config/`** - Configuraciones Centralizadas

```
config/
└── app.config.ts                  # ⚙️ Configuración de aplicación
    ├── port: 3001
    ├── nodeEnv: development/production
    ├── isDevelopment/isProduction
    ├── urlDatabase: DATABASE_URL
    ├── secretJwt: JWT_SECRET
    ├── expiresInJwt: 7d
    ├── refreshExpiresInJwt: 30d
    ├── sessionSecret: SESSION_SECRET
    ├── urlFrontend: FRONTEND_URL
    ├── urlBackend: BACKEND_URL
    ├── azureAdAudience: AZURE_AD_AUDIENCE
    └── azureAdTenantId: AZURE_AD_TENANTID
```

**Ventajas de configuración centralizada:**

- Variables de entorno tipadas
- Valores por defecto seguros
- Fácil acceso desde cualquier módulo
- Validación en tiempo de compilación

---

#### 📂 **`src/generated/`** - Cliente Prisma Generado

```
generated/
└── prisma/                        # Cliente Prisma generado automáticamente
    ├── client.ts                  → PrismaClient con tipos
    ├── models.ts                  → Tipos de modelos
    ├── enums.ts                   → Enums de la BD
    ├── commonInputTypes.ts        → Tipos de entrada
    ├── browser.ts                 → Cliente para navegador
    └── models/                    → Tipos individuales por modelo
        ├── usuario.ts
        ├── rol.ts
        ├── area.ts
        └── ... (14 modelos)
```

**Generación automática:**

```bash
pnpm prisma:generate
# Ejecuta: prisma generate
# Output configurado en schema.prisma → src/generated/prisma
```

---

#### 📂 **`src/types/`** - Tipos TypeScript Globales

```
types/
└── express-session.d.ts           # Extensión de tipos de Express
    └── Agrega tipado a req.session para Microsoft session
```

---

### 📂 **Directorio `test/`** - Tests End-to-End

```
test/
├── app.e2e-spec.ts                # Tests de integración
└── jest-e2e.json                  # Configuración de Jest para E2E
```

---

### 📂 **Directorio `dist/`** - Código Compilado

Generado automáticamente por TypeScript al ejecutar `pnpm build`:

```
dist/
├── prisma/                        # Prisma compilado a JS
├── src/                           # Código fuente compilado a JS
│   ├── *.js                       → Código JavaScript
│   ├── *.d.ts                     → Declaraciones de tipos
│   └── *.js.map                   → Source maps para debugging
└── tsconfig.build.tsbuildinfo     # Cache de compilación incremental
```

---

### 📂 **Directorio `docker/`** - Containerización

```
docker/
└── mysql/
    └── init/                      # Scripts de inicialización de MySQL
                                   # Ejecutados al crear el contenedor por primera vez
```

---

### 📄 **Archivos de Configuración Raíz**

#### 🔧 **Configuración de Build y Runtime**

```
📄 package.json                    # Dependencias y scripts NPM
   ├── Dependencies (26):          bcrypt, @nestjs/*, @prisma/*, etc.
   ├── DevDependencies (19):       typescript, eslint, jest, etc.
   └── Scripts:                    build, start:dev, test, prisma:*

📄 pnpm-lock.yaml                  # Lockfile de dependencias (pnpm)

📄 tsconfig.json                   # Configuración de TypeScript
   ├── module: nodenext            → ESM modules
   ├── target: ES2023              → JavaScript moderno
   ├── experimentalDecorators      → NestJS decorators
   ├── Path aliases:
   │   ├── @/* → src/*
   │   ├── @prisma/* → prisma/*
   │   └── @generated/* → src/generated/*
   └── outDir: ./dist

📄 tsconfig.build.json             # Configuración de build
   └── Excluye: node_modules, test specs

📄 nest-cli.json                   # Configuración de NestJS CLI
   ├── sourceRoot: src
   └── deleteOutDir: true          → Limpia dist antes de compilar

📄 prisma.config.ts                # Configuración de Prisma
   ├── schema: prisma/schema.prisma
   ├── migrations: prisma/migrations
   ├── seed: tsx prisma/seed.ts
   └── datasource: process.env.DATABASE_URL
```

#### 🎨 **Configuración de Calidad de Código**

```
📄 eslint.config.mjs               # Configuración de ESLint
   └── Reglas de linting para TypeScript

📄 .prettierrc                     # Configuración de Prettier
   └── Formateo automático de código

📄 .editorconfig                   # Configuración del editor
   └── Consistencia entre diferentes IDEs
```

#### 🐳 **Configuración de Docker**

```
📄 docker-compose.yml              # Orquestación de contenedores
   └── Servicio: db (MySQL 8.0)
       ├── Puerto: 3306
       ├── Volumen: db_data (persistencia)
       ├── Healthcheck: mysqladmin ping
       └── Red: secop-network

📄 Dockerfile                      # Imagen de producción
   ├── Stage 1 (builder):          Node 20 Alpine + build
   ├── Stage 2 (production):       Node 20 Alpine + runtime
   └── Multi-stage para optimizar tamaño
```

#### 📝 **Documentación**

```
📄 README.md                       # Documentación completa del proyecto
   ├── Instalación y configuración
   ├── Scripts disponibles
   ├── Estructura del proyecto
   ├── Guía de desarrollo
   └── Documentación de API
```

---

## 🔄 Flujo de Datos en la Aplicación

```
┌─────────────┐
│   Cliente   │
│  (Frontend) │
└──────┬──────┘
       │ HTTP Request (JWT Cookie)
       ▼
┌─────────────────────────────────┐
│  main.ts (Bootstrap)            │
│  - CORS, Session, Cookies       │
│  - Global Pipes, Filters        │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  JwtAuthGuard (Global)          │
│  - Valida JWT en cada request   │
│  - Excepción: endpoints @Public │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Controller (auth.controller)   │
│  - Recibe request validado      │
│  - Extrae @CurrentUser()        │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  Service (auth.service)         │
│  - Lógica de negocio            │
│  - Validaciones                 │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  PrismaService                  │
│  - Consultas a base de datos    │
│  - Relaciones entre modelos     │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  MySQL Database                 │
│  - Persistencia de datos        │
└─────────────────────────────────┘
       │
       ▼ (Response)
┌─────────────────────────────────┐
│  LoggingInterceptor             │
│  - Logging de request/response  │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  HttpExceptionFilter            │
│  - Manejo de errores            │
│  - Formato de respuesta         │
└──────┬──────────────────────────┘
       │
       ▼
   Cliente recibe respuesta
   { success, message, data }
```

---

## 📊 Tecnologías por Capa

| Capa                  | Tecnologías                        | Archivos                                   |
| --------------------- | ---------------------------------- | ------------------------------------------ |
| **Presentación**      | NestJS Controllers, DTOs           | `*.controller.ts`, `dto/*.dto.ts`          |
| **Lógica de Negocio** | NestJS Services                    | `*.service.ts`                             |
| **Seguridad**         | Passport, JWT, Azure MSAL          | `guards/`, `strategies/`, `msal.config.ts` |
| **Persistencia**      | Prisma ORM                         | `prisma/`, `src/generated/`                |
| **Base de Datos**     | MySQL 8.0 / MariaDB                | Contenedor Docker                          |
| **Validación**        | class-validator, class-transformer | DTOs con decoradores                       |
| **Cross-Cutting**     | Filters, Interceptors, Guards      | `common/filters/`, `common/interceptors/`  |

---

## 🔐 Sistema de Seguridad en Capas

1. **Azure AD (OAuth 2.0)** → Autenticación inicial con Microsoft 365
2. **JWT Guard Global** → Protección automática de todos los endpoints
3. **Cookie HttpOnly** → Token seguro contra XSS
4. **Passport JWT** → Validación de tokens
5. **Decorador @Public()** → Exclusión selectiva de endpoints públicos
6. **ValidationPipe** → Validación automática de DTOs
7. **CORS Configurado** → Solo frontend autorizado
8. **bcrypt** → Hash de contraseñas (si se usa auth local)

---

## 📦 Gestión de Dependencias

**Gestor de paquetes:** pnpm (más rápido y eficiente que npm/yarn)

**Principales dependencias:**

- `@nestjs/*` → Framework backend
- `@prisma/*` → ORM y adaptador MariaDB
- `@azure/msal-node` → Autenticación Microsoft
- `passport-jwt` → Estrategia JWT
- `bcrypt` → Encriptación
- `class-validator` → Validación de DTOs

**Scripts más usados:**

```bash
pnpm install              # Instalar dependencias
pnpm start:dev            # Desarrollo con hot-reload
pnpm build                # Compilar a JavaScript
pnpm prisma:generate      # Generar cliente Prisma
pnpm prisma:migrate       # Aplicar migraciones
pnpm test                 # Ejecutar tests
```

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos
DATABASE_URL="mysql://secop-user:secop-password@localhost:3306/secop-database"
DATABASE_NAME=secop-database
DATABASE_USER=secop-user
DATABASE_PASSWORD=secop-password
DATABASE_PORT=3306
DATABASE_ROOT_PASSWORD=root

# Aplicación
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Sesiones
SESSION_SECRET=your-session-secret-change-in-production

# Azure AD / Microsoft 365
AZURE_CLIENT_ID=your-azure-client-id
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_CLIENT_SECRET=your-azure-client-secret
BACKEND_URL=http://localhost:3001

# CORS
FRONTEND_URL=http://localhost:3000

# Zona horaria
TZ=America/Bogota
```

## 📚 Documentación de API

La API está disponible en: `http://localhost:3001`

### Endpoints de Autenticación

#### Autenticación con Azure AD / Microsoft 365 (Públicos)

- **GET** `/auth/login` - Iniciar sesión con Microsoft 365
  - Redirige a la página de login de Microsoft
  - Valida que el usuario pertenezca al tenant de Office 365 configurado

- **GET** `/auth/callback` - Callback de Azure AD
  - Procesa la respuesta de Microsoft
  - Genera JWT interno
  - Establece cookie segura de sesión

- **GET** `/auth/logout` - Cerrar sesión
  - Limpia cookies de autenticación
  - Redirige al frontend

### Autenticación

El sistema implementa **autenticación híbrida** con dos capas:

#### 1. Azure AD / Microsoft 365 (OAuth 2.0)

- Autenticación mediante Microsoft 365
- Validación de tenant organizacional
- Single Sign-On (SSO)
- Integración con @azure/msal-node

#### 2. JWT Interno (JSON Web Tokens)

- Tokens propios generados después de validar Azure AD
- Almacenados en cookies HttpOnly
- Duración configurable (por defecto 7 días)
- Protección CSRF con SameSite
- Guard global aplicado a todos los endpoints excepto los públicos

#### Flujo de Autenticación

1. Usuario accede a `/auth/login`
2. Redirigido a Microsoft 365
3. Usuario ingresa credenciales corporativas
4. Azure valida y redirige a `/auth/callback`
5. Backend valida el token de Azure y el tenant
6. Se genera JWT interno con datos del usuario
7. JWT se almacena en cookie HttpOnly
8. Usuario es redirigido al dashboard del frontend

### Respuestas de la API

Todas las respuestas siguen el formato:

```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": { ... }
}
```

## 🔒 Seguridad

- **Azure AD / OAuth 2.0** - Autenticación con Microsoft 365
- **Autenticación JWT** - Tokens seguros con expiración
- **Express Session** - Gestión de sesiones con estado
- **Bcrypt** - Hash seguro de contraseñas
- **Guards** - Protección de rutas con NestJS Guards
- **Validación** - Validación automática de DTOs con class-validator
- **CORS** - Configuración de CORS para frontend específico
- **HttpOnly Cookies** - Tokens en cookies seguras
- **Helmet** - Headers de seguridad HTTP
- **Rate Limiting** - Protección contra ataques de fuerza bruta

## 🔐 Configuración de Azure AD

### Requisitos Previos

1. Cuenta de Azure Active Directory (Microsoft 365)
2. Permisos de administrador para registrar aplicaciones

### Pasos para Configurar Azure AD

1. **Registrar aplicación en Azure Portal**
   - Navega a [Azure Portal](https://portal.azure.com)
   - Busca "Azure Active Directory" → "App registrations"
   - Click en "New registration"
   - Nombre: "SECOP API"
   - Tipo de cuenta: "Accounts in this organizational directory only"
   - Redirect URI: `http://localhost:3001/auth/callback` (desarrollo)

2. **Obtener credenciales**
   - **Client ID**: En la página Overview de tu app
   - **Tenant ID**: También en Overview
   - **Client Secret**:
     - Ve a "Certificates & secrets"
     - Click "New client secret"
     - Copia el valor (solo se muestra una vez)

3. **Configurar permisos API**
   - Ve a "API permissions"
   - Add permission → Microsoft Graph → Delegated permissions
   - Agregar:
     - `openid`
     - `profile`
     - `email`
     - `User.Read`
   - Click "Grant admin consent"

4. **Actualizar variables de entorno**

   ```env
   AZURE_CLIENT_ID=tu-client-id-aqui
   AZURE_TENANT_ID=tu-tenant-id-aqui
   AZURE_CLIENT_SECRET=tu-client-secret-aqui
   BACKEND_URL=http://localhost:3001
   FRONTEND_URL=http://localhost:3000
   ```

5. **Para producción**
   - Actualizar Redirect URI en Azure Portal
   - Cambiar `BACKEND_URL` a tu dominio de producción
   - Asegurar que `NODE_ENV=production`

## 🏗️ Arquitectura

### Patrones Implementados

- **Clean Architecture** - Separación de capas
- **SOLID Principles** - Código mantenible y escalable
- **Dependency Injection** - Gestión de dependencias con NestJS
- **Repository Pattern** - Abstracción de acceso a datos con Prisma
- **DTO Pattern** - Validación y transformación de datos
- **Guards & Interceptors** - Cross-cutting concerns

### Configuración de TypeScript

- **Module Resolution**: NodeNext (ESM)
- **Decorators**: Habilitados para NestJS
- **Strict Mode**: Parcial (null checks habilitados)
- **Path Aliases**:
  - `@/*` → `src/*`
  - `@prisma/*` → `prisma/*`
  - `@generated/*` → `src/generated/*`

## 🐳 Docker

### Desarrollo con Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v
```

### Producción con Docker

```bash
# Construir imagen
docker build -t secop-api:latest .

# Ejecutar contenedor
docker run -d \
  -p 3001:3001 \
  --env-file .env \
  --name secop-api \
  secop-api:latest
```

## 🛠️ Desarrollo

### Extensiones Recomendadas para VSCode

- ESLint
- Prettier
- Prisma
- TypeScript
- Docker
- GitLens

### Configuración del Editor

El proyecto incluye:

- **EditorConfig** - Consistencia de estilo entre editores
- **ESLint** - Linting automático
- **Prettier** - Formateo automático al guardar

## 📊 Estado del Proyecto

- ✅ Autenticación y autorización
- ✅ Gestión de usuarios y roles
- ✅ Estructura modular escalable
- ✅ Prisma con modelos completos
- ✅ Docker y Docker Compose
- ✅ Validación de DTOs
- ✅ Manejo de errores global
- ✅ Logging interceptor
- ⏳ Módulos de negocio (presupuestos, requisiciones, etc.)
- ⏳ Tests unitarios y e2e
- ⏳ Documentación con Swagger/OpenAPI
