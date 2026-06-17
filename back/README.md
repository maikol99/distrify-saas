# Distrify - Backend API

![NestJS](https://img.shields.io/badge/NestJS-v10.0.0-E0234E?style=flat-square&logo=nestjs)
![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat-square&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-6.8.0-47A248?style=flat-square&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.1.3-3178C6?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

Sistema de gestión empresarial (ERP) construido con NestJS que permite administrar negocios de manera eficiente. Gestiona clientes, productos, ventas, compras, caja, reportes y mucho más desde una plataforma centralizada.

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
  - [Clonar el Repositorio](#1-clonar-el-repositorio)
  - [Instalar Dependencias](#2-instalar-dependencias)
  - [Configurar Variables de Entorno](#3-configurar-variables-de-entorno)
  - [Configurar Base de Datos](#4-configurar-base-de-datos)
- [Ejecutar la Aplicación](#ejecutar-la-aplicación)
  - [Desarrollo](#desarrollo)
  - [Producción](#producción)
  - [Docker](#docker-opcional)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Arquitectura](#arquitectura)
  - [Módulos](#módulos)
  - [Base de Datos](#base-de-datos)
  - [Autenticación](#autenticación)
- [API Endpoints](#api-endpoints)
  - [Autenticación](#autenticación-1)
  - [Productos](#productos)
  - [Ventas](#ventas)
  - [Clientes](#clientes)
  - [Proveedores](#proveedores)
  - [Caja](#caja)
  - [Reportes](#reportes)
- [Integraciones](#integraciones)
  - [Mercado Pago](#mercado-pago)
  - [Cloudinary](#cloudinary)
  - [Servicios de Email](#servicios-de-email)
  - [IA (OpenAI, Gemini, Groq)](#ia-openai-gemini-groq)
  - [Google One Tap](#google-one-tap)
- [Seguridad](#seguridad)
- [Testing](#testing)
- [Scripts Disponibles](#scripts-disponibles)
- [Despliegue](#despliegue)
  - [Railway](#railway)
  - [Render](#render)
  - [Heroku](#heroku)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## Descripción

Distrify es un sistema de gestión empresarial (ERP) backend construido con NestJS y MongoDB. Proporciona una API RESTful completa para la gestión de:

- **Gestión de Usuarios**: Autenticación, autorización y gestión de permisos
- **Productos**: Catálogo de productos con categorías, precios y stock
- **Ventas**: Registro y seguimiento de ventas con múltiples métodos de pago
- **Compras**: Gestión de compras a proveedores
- **Clientes**: Base de datos de clientes con historial
- **Proveedores**: Gestión de proveedores y pagos
- **Caja**: Control de caja con apertura y cierre
- **Reportes**: Generación de reportes y estadísticas
- **Asistente IA**: Asistente virtual potenciado por IA
- **Pagos Online**: Integración con Mercado Pago
- **Notificaciones**: Sistema de notificaciones

## Características

- **Arquitectura Modular**: Cada funcionalidad está encapsulada en módulos independientes
- **Autenticación JWT**: Sistema de autenticación robusto con JSON Web Tokens
- **Autorización por Roles**: Control de acceso basado en roles (RBAC)
- **Arquitectura Multitenant**: Aislamiento de datos por negocio
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Validación de Datos**: Validación robusta con class-validator
- **API RESTful**: Endpoints bien estructurados y documentados
- **Soporte para Imágenes**: Upload y gestión de imágenes con Cloudinary
- **Pagos Online**: Integración completa con Mercado Pago
- **IA Integrada**: Asistente virtual con soporte para múltiples proveedores (OpenAI, Gemini, Groq)
- **Notificaciones**: Sistema de notificaciones integrado
- **Reportes**: Generación de reportes en tiempo real
- **Prueba Gratuita**: 7 días de prueba sin tarjeta de crédito

---

## Requisitos Previos

| Software    | Versión Mínima | Descripción                               |
| ----------- | -------------- | ----------------------------------------- |
| **Node.js** | v18.0.0+       | Entorno de ejecución de JavaScript        |
| **npm**     | v9.0.0+        | Gestor de paquetes (incluido con Node.js) |
| **MongoDB** | v6.0+          | Base de datos NoSQL                       |
| **Git**     | v2.0+          | Control de versiones (opcional)           |

### Opcional

- **Docker** (v20.0+): Para ejecutar la aplicación en contenedores
- **MongoDB Compass**: GUI para gestionar la base de datos

---

## Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/distrify-back.git
cd distrify-back
```

### 2. Instalar Dependencias

```bash
npm install
```

> **Nota**: Este paso puede tardar varios minutos dependiendo de tu conexión a internet.

### 3. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus propias credenciales:

```env
# ============================================
# BASE DE DATOS
# ============================================
MONGO_DB_URI=tumongodburi

# ============================================
# AUTENTICACIÓN JWT
# ============================================
JWT_SECRET=tu-super-secreto-muy-largo-y-seguro-minimo-256-bits
JWT_EXPIRES_IN=8h
JWT_ISSUER=distrify
JWT_AUDIENCE=distrify-users
BCRYPT_SALT_ROUNDS=12

# ============================================
# CLOUDINARY (Gestión de Imágenes)
# ============================================
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_CLOUD_NAME=tu_cloud_name

# ============================================
# SERVICIOS DE EMAIL (Resend)
# ============================================
# Crear cuenta en https://resend.com/
# Dev: usar EMAIL_FROM=onboarding@resend.dev (sin verificar dominio)
# Prod: verificar tu propio dominio en Resend
EMAIL_FROM=noreply@tudominio.com
EMAIL_FROM_NAME=Distrify
RESEND_API_KEY=re_tu_api_key

# ============================================
# GOOGLE ONE TAP (Login con Google)
# ============================================
GOOGLE_CLIENT_ID=tu-google-client-id.apps.googleusercontent.com

# ============================================
# INTELIGENCIA ARTIFICIAL
# ============================================
# OpenAI
OPEN_AI_API_KEY=sk-...

# Google Gemini
GEMINI_API_KEY=tu-gemini-api-key

# Groq
GROQ_API_KEY=gsk_...

# ============================================
# MERCADO PAGO (Pagos Online)
# ============================================
MERCADOPAGO_ACCESS_TOKEN=tu-access-token-mercado-pago
MERCADOPAGO_PUBLIC_KEY=tu-public-key-mercado-pago
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret

# ============================================
# APLICACIÓN
# ============================================
PORT=3000
BASE_URL=https://tu-dominio.com
NODE_ENV=development
```

### 4. Configurar Base de Datos

#### Opción A: MongoDB Atlas (Nube)

1. Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea un cluster gratuito
3. Configura un usuario y contraseña para la base de datos
4. Obtén la URI de conexión
5. Actualiza `MONGO_DB_URI` en tu `.env`

#### Opción B: MongoDB Local

1. Instala MongoDB Community Server desde [mongodb.com](https://www.mongodb.com/try/download/community)
2. Inicia el servicio:

   ```bash
   # Windows
   net start MongoDB

   # Linux/Mac
   sudo systemctl start mongod
   ```

3. Configura la URI: `MONGO_DB_URI=mongodb://localhost:27017/distrify`

---

## Ejecutar la Aplicación

### Desarrollo

Inicia el servidor con hot-reload:

```bash
npm run start:dev
```

La aplicación estará disponible en: `http://localhost:3000`

### Producción

1. **Build**:

   ```bash
   npm run build
   ```

2. **Iniciar**:
   ```bash
   npm run start:prod
   ```

### Docker (Opcional)

#### Construir imagen

```bash
docker build -t distrify-back .
```

#### Ejecutar contenedor

```bash
docker run -p 3000:3000 --env-file .env distrify-back
```

#### Docker Compose (con MongoDB)

Crea un archivo `docker-compose.yml`:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - mongodb

  mongodb:
    image: mongo:6
    ports:
      - '27017:27017'
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

Ejecuta:

```bash
docker-compose up -d
```

---

## Estructura del Proyecto

```
distrify-back/
├── src/
│   ├── main.ts                    # Punto de entrada de la aplicación
│   ├── app.module.ts              # Módulo principal
│   │
│   ├── modules/                   # Módulos de la aplicación
│   │   ├── admin/                 # Gestión administrativa
│   │   ├── assistant/             # Asistente IA
│   │   ├── auth/                  # Autenticación y autorización
│   │   ├── buys/                  # Gestión de compras
│   │   ├── caja/                  # Control de caja
│   │   ├── categories/            # Categorías de productos
│   │   ├── client-payments/       # Pagos de clientes
│   │   ├── clients/               # Gestión de clientes
│   │   ├── emails/                # Servicio de emails
│   │   ├── inputs/                # Entradas/ingresos
│   │   ├── mercado-pago/          # Integración Mercado Pago
│   │   ├── notifications/        # Sistema de notificaciones
│   │   ├── outputs/               # Salidas/egresos
│   │   ├── pedidos/               # Pedidos
│   │   ├── permissions/           # Permisos
│   │   ├── plan-limits/           # Límites de plan
│   │   ├── products/              # Gestión de productos
│   │   ├── reports/               # Generación de reportes
│   │   ├── returns/               # Devoluciones
│   │   ├── sales/                 # Gestión de ventas
│   │   ├── shops/                 # Gestión de negocios
│   │   ├── supplier-payments/     # Pagos a proveedores
│   │   ├── suppliers/             # Gestión de proveedores
│   │   ├── turns/                 # Turnos
│   │   └── users/                 # Gestión de usuarios
│   │
│   ├── guards/                    # Guards de autenticación y autorización
│   │   ├── jwt-auth.guard.ts      # Guard JWT
│   │   ├── shop-guard.guard.ts    # Guard multitenant
│   │   ├── admin.guard.ts        # Guard de administrador
│   │   ├── roles.guard.ts        # Guard de roles
│   │   └── plan.guard.ts         # Guard de plan
│   │
│   ├── decorators/               # Decoradores personalizados
│   │   ├── public.decorator.ts   # Marcar rutas como públicas
│   │   └── plan.decorator.ts     # Decorador para límites de plan
│   │
│   └── utils/                     # Utilidades
│
├── uploads/                       # Archivos subidos (imágenes, etc.)
├── dist/                          # Archivos compilados (generado)
├── test/                          # Pruebas E2E
│
├── .env                           # Variables de entorno (crear)
├── .env.example                   # Ejemplo de variables de entorno
├── .gitignore                     # Archivos ignorados por git
├── .prettierrc                    # Configuración de Prettier
├── .eslintrc.js                   # Configuración de ESLint
│
├── package.json
├── tsconfig.json                  # Configuración de TypeScript
├── tsconfig.build.json            # Configuración de build
├── nest-cli.json                  # Configuración de NestJS CLI
└── README.md
```

---

## Arquitectura

### Módulos

El proyecto sigue una **arquitectura modular** basada en NestJS:

| Módulo            | Descripción    | Principales funcionalidades                                                |
| ----------------- | -------------- | -------------------------------------------------------------------------- |
| **auth**          | Autenticación  | Login, registro, verificación email, recuperación contraseña, Google OAuth |
| **users**         | Usuarios       | CRUD usuarios, roles, permisos                                             |
| **shops**         | Negocios       | Gestión multitenant, configuración de negocio                              |
| **products**      | Productos      | CRUD productos, stock, precios, imágenes                                   |
| **categories**    | Categorías     | Categorización de productos                                                |
| **sales**         | Ventas         | Registro de ventas, métodos de pago                                        |
| **buys**          | Compras        | Gestión de compras a proveedores                                           |
| **clients**       | Clientes       | Base de datos de clientes, historial                                       |
| **suppliers**     | Proveedores    | Gestión de proveedores                                                     |
| **caja**          | Caja           | Apertura, cierre, movimientos de caja                                      |
| **reports**       | Reportes       | Estadísticas, gráficos, exportación                                        |
| **mercado-pago**  | Mercado Pago   | Pagos online, webhooks, suscripciones                                      |
| **emails**        | Emails         | Envío de emails transaccionales                                            |
| **notifications** | Notificaciones | Sistema de notificaciones                                                  |
| **assistant**     | Asistente IA   | Chatbot con IA                                                             |
| **plan-limits**   | Planes         | Límites según plan (trial, premium)                                        |
| **admin**         | Admin          | Panel administrativo                                                       |

### Base de Datos

El proyecto utiliza **MongoDB** con **Mongoose** como ODM:

- **Arquitectura Multitenant**: Cada negocio (shop) tiene sus propios datos aislados
- **Relaciones**: Uso de referencias de MongoDB (`ObjectId`) para relaciones entre entidades
- **Índices**: Índices definidos para optimizar consultas frecuentes
- **Schemas**: Schemas tipados con TypeScript para cada colección

#### Modelos Principales

- `Users`: Usuarios del sistema
- `Shops`: Negocios/Tiendas
- `Products`: Productos
- `Categories`: Categorías
- `Sales`: Ventas
- `Buys`: Compras
- `Clients`: Clientes
- `Suppliers`: Proveedores
- `Caja`: Movimientos de caja

### Autenticación

El sistema de autenticación incluye:

1. **JWT (JSON Web Tokens)**
   - Tokens de acceso con expiración configurable
   - Tokens de verificación de email
   - Tokens de recuperación de contraseña

2. **Estrategias**
   - Local (email + contraseña)
   - Google OAuth (One Tap)
   - JWT Bearer Token

3. **Guards**
   - `JwtAuthGuard`: Protege rutas que requieren autenticación
   - `ShopGuard`: Implementa aislamiento multitenant
   - `AdminGuard`: Restringe acceso a administradores
   - `RolesGuard`: Control de acceso por roles
   - `PlanGuard`: Verificación de límites de plan

4. **Decoradores**
   - `@Public()`: Marca rutas como públicas (sin auth)
   - `@Plan(planName)`: Verifica plan del usuario

---

## API Endpoints

### Autenticación

| Método | Endpoint                    | Descripción                       | Auth |
| ------ | --------------------------- | --------------------------------- | ---- |
| POST   | `/auth/register`            | Registrar nuevo usuario           | No   |
| POST   | `/auth/login`               | Iniciar sesión                    | No   |
| POST   | `/auth/google`              | Login con Google                  | No   |
| POST   | `/auth/verify-email`        | Verificar email                   | No   |
| POST   | `/auth/resend-verification` | Reenviar código verificación      | No   |
| POST   | `/auth/forgot-password`     | Solicitar recuperación contraseña | No   |
| POST   | `/auth/reset-password`      | Restablecer contraseña            | No   |
| POST   | `/auth/refresh-token`       | Renovar token                     | Sí   |
| GET    | `/auth/profile`             | Obtener perfil                    | Sí   |

### Productos

| Método | Endpoint                 | Descripción         | Auth |
| ------ | ------------------------ | ------------------- | ---- |
| GET    | `/products`              | Listar productos    | Sí   |
| GET    | `/products/:id`          | Obtener producto    | Sí   |
| POST   | `/products`              | Crear producto      | Sí   |
| PATCH  | `/products/:id`          | Actualizar producto | Sí   |
| DELETE | `/products/:id`          | Eliminar producto   | Sí   |
| GET    | `/products/search`       | Buscar productos    | Sí   |
| POST   | `/products/upload-image` | Subir imagen        | Sí   |

### Ventas

| Método | Endpoint       | Descripción            | Auth |
| ------ | -------------- | ---------------------- | ---- |
| GET    | `/sales`       | Listar ventas          | Sí   |
| GET    | `/sales/:id`   | Obtener venta          | Sí   |
| POST   | `/sales`       | Crear venta            | Sí   |
| PATCH  | `/sales/:id`   | Actualizar venta       | Sí   |
| DELETE | `/sales/:id`   | Eliminar venta         | Sí   |
| GET    | `/sales/stats` | Estadísticas de ventas | Sí   |

### Clientes

| Método | Endpoint               | Descripción           | Auth |
| ------ | ---------------------- | --------------------- | ---- |
| GET    | `/clients`             | Listar clientes       | Sí   |
| GET    | `/clients/:id`         | Obtener cliente       | Sí   |
| POST   | `/clients`             | Crear cliente         | Sí   |
| PATCH  | `/clients/:id`         | Actualizar cliente    | Sí   |
| DELETE | `/clients/:id`         | Eliminar cliente      | Sí   |
| GET    | `/clients/:id/history` | Historial del cliente | Sí   |

### Proveedores

| Método | Endpoint         | Descripción          | Auth |
| ------ | ---------------- | -------------------- | ---- |
| GET    | `/suppliers`     | Listar proveedores   | Sí   |
| GET    | `/suppliers/:id` | Obtener proveedor    | Sí   |
| POST   | `/suppliers`     | Crear proveedor      | Sí   |
| PATCH  | `/suppliers/:id` | Actualizar proveedor | Sí   |
| DELETE | `/suppliers/:id` | Eliminar proveedor   | Sí   |

### Caja

| Método | Endpoint         | Descripción              | Auth |
| ------ | ---------------- | ------------------------ | ---- |
| GET    | `/caja`          | Estado actual de caja    | Sí   |
| POST   | `/caja/open`     | Apertura de caja         | Sí   |
| POST   | `/caja/close`    | Cierre de caja           | Sí   |
| POST   | `/caja/movement` | Registrar movimiento     | Sí   |
| GET    | `/caja/history`  | Historial de movimientos | Sí   |

### Reportes

| Método | Endpoint             | Descripción          | Auth |
| ------ | -------------------- | -------------------- | ---- |
| GET    | `/reports/sales`     | Reporte de ventas    | Sí   |
| GET    | `/reports/products`  | Reporte de productos | Sí   |
| GET    | `/reports/clients`   | Reporte de clientes  | Sí   |
| GET    | `/reports/financial` | Reporte financiero   | Sí   |
| GET    | `/reports/dashboard` | Dashboard general    | Sí   |

### Otros Endpoints

| Módulo             | Endpoints                                      |
| ------------------ | ---------------------------------------------- |
| **Compras**        | `/buys/*` - Gestión de compras                 |
| **Categorías**     | `/categories/*` - CRUD categorías              |
| **Negocios**       | `/shops/*` - Configuración de negocio          |
| **Usuarios**       | `/users/*` - Gestión de usuarios               |
| **Mercado Pago**   | `/mercado-pago/*` - Pagos online               |
| **Asistente**      | `/assistant/*` - Chatbot IA                    |
| **Notificaciones** | `/notifications/*` - Sistema de notificaciones |

> **Nota**: Todos los endpoints requieren autenticación excepto los marcados explícitamente.

---

## Integraciones

### Mercado Pago

Integración completa para pagos online:

```env
MERCADOPAGO_ACCESS_TOKEN=tu-access-token
MERCADOPAGO_PUBLIC_KEY=tu-public-key
MERCADOPAGO_WEBHOOK_SECRET=tu-webhook-secret
```

**Funcionalidades**:

- Pagos con tarjeta de crédito/débito
- Pagos en efectivo
- Transferencias bancarias
- Webhooks para confirmación de pagos
- Devoluciones

### Cloudinary

Gestión de imágenes y archivos:

```env
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

**Funcionalidades**:

- Upload de imágenes de productos
- Transformación de imágenes (resize, crop)
- CDN para distribución de contenido
- Optimización automática

### Servicios de Email

Múltiples proveedores disponibles:

**Gmail (Gmail App Password)**:

```env
GMAIL_APP_PASS=xxxx xxxx xxxx xxxx
```

**Mailgun**:

```env
MAILGUN_API_KEY=tu-api-key
MAILGUN_DOMAIN=tu-dominio.mailgun.org
```

**Resend**:

```env
RESEND_API_KEY=re_tu_api_key
```

**Usos**:

- Verificación de email al registrarse
- Recuperación de contraseña
- Notificaciones de ventas
- Alertas de stock bajo

### IA (OpenAI, Gemini, Groq)

Asistente virtual potenciado por IA:

```env
OPEN_AI_API_KEY=sk-...
GEMINI_API_KEY=tu-gemini-api-key
GROQ_API_KEY=gsk_...
```

**Funcionalidades**:

- Chatbot de atención al cliente
- Generación de descripciones de productos
- Análisis de ventas
- Recomendaciones inteligentes

### Google One Tap

Login con Google:

```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
```

---

## Seguridad

### Medidas Implementadas

1. **Rate Limiting**
   - Límite de 50 requests por minuto por IP
   - Configurable en `app.module.ts`

2. **Validación de Entrada**
   - Todos los DTOs validan datos de entrada
   - Sanitización de inputs

3. **Hash de Contraseñas**
   - Bcrypt con 12 rounds de sal

4. **Tokens Seguros**
   - JWT con expiración
   - Tokens de verificación de email
   - Tokens de recuperación de contraseña

5. **CORS**
   - Configuración de orígenes permitidos
   - Headers permitidos configurados

6. **Aislamiento Multitenant**
   - ShopGuard implementa separación de datos por negocio

7. **Actualizaciones de Seguridad**
   - Dependencias actualizadas regularmente

### Recomendaciones de Seguridad

1. **Nunca expongas el `.env`**
   - Agregar `.env` a `.gitignore`
   - Usar secrets en producción (Railway, Render, etc.)

2. **Usa HTTPS en producción**
   - Configura SSL/TLS

3. **Monitorea logs**
   - Revisa logs de autenticación fallida

4. **Backups regulares**
   - Configura backups automáticos de MongoDB

---

## Testing

### Ejecutar Tests Unitarios

```bash
npm run test
```

### Ejecutar Tests con Watch

```bash
npm run test:watch
```

### Coverage de Tests

```bash
npm run test:cov
```

### Tests E2E

```bash
npm run test:e2e
```

---

## Scripts Disponibles

| Script                | Descripción                               |
| --------------------- | ----------------------------------------- |
| `npm run build`       | Compila el proyecto                       |
| `npm run start`       | Inicia la aplicación                      |
| `npm run start:dev`   | Inicia con hot-reload                     |
| `npm run start:debug` | Inicia en modo debug                      |
| `npm run start:prod`  | Inicia en producción                      |
| `npm run lint`        | Ejecuta linter                            |
| `npm run lint:fix`    | Corrige errores de linter automáticamente |
| `npm run format`      | Formatea código con Prettier              |
| `npm run test`        | Ejecuta tests                             |
| `npm run test:watch`  | Tests en modo watch                       |
| `npm run test:cov`    | Coverage de tests                         |
| `npm run test:e2e`    | Tests E2E                                 |

---

## Despliegue

### Railway

1. **Crear cuenta** en [Railway](https://railway.app)

2. **Deploy desde GitHub**:
   - Conectar repositorio
   - Railway detectará NestJS automáticamente

3. **Configurar variables de entorno**:
   - Añadir todas las variables del `.env`
   - Usar Railway Secrets para datos sensibles

4. **Desplegar**:
   - Railway construirá y desplegará automáticamente

### Render

1. **Crear cuenta** en [Render](https://render.com)

2. **Crear Web Service**:
   - Conectar repositorio GitHub
   - Build command: `npm run build`
   - Start command: `npm run start:prod`

3. **Configurar variables de entorno**

### Heroku

1. **Crear Procfile**:

   ```
   web: npm run start:prod
   ```

2. **Desplegar**:

   ```bash
   heroku login
   heroku create tu-app
   heroku push main
   ```

3. **Configurar variables**:
   ```bash
   heroku config:set MONGO_DB_URI=tu-uri
   ```

---

## Contribución

¡Contribuciones son bienvenidas! Por favor sigue estos pasos:

1. **Fork** el repositorio
2. **Clone** tu fork:
   ```bash
   git clone https://github.com/tu-usuario/distrify-back.git
   ```
3. **Crea una rama** para tu feature:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```
4. **Commit** tus cambios:
   ```bash
   git commit -m 'Agregar nueva funcionalidad'
   ```
5. **Push** a la rama:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
6. **Abre un Pull Request**

### Normas de Contribución

- Sigue el estilo de código del proyecto
- Ejecuta `npm run lint:fix` antes de commit
- Añade tests para nuevas funcionalidades
- Actualiza la documentación si es necesario
- Commits descriptivos y en inglés (o español consistente)

---

## Uso Comercial y White-Label

Este proyecto es open source y puede ser usado, modificado y comercializado libremente, incluyendo aplicar tu propia marca (white-label). La única condición es mantener visible, sin ocultar ni deshabilitar, el crédito de atribución descrito en la [Licencia](#licencia) en cualquier interfaz desplegada — sin importar el branding que apliques.

## Licencia

Este proyecto está bajo la licencia **MIT con una cláusula adicional de atribución obligatoria**. Ver el archivo [LICENSE](../LICENSE) para el texto completo.

En resumen:

- Podés usar, copiar, modificar, fusionar, publicar, distribuir, sublicenciar y/o vender copias del software (MIT estándar).
- Cualquier despliegue con interfaz visible para usuarios finales debe mostrar siempre, en el pie de página, el crédito **"Powered by Distrify — cuyocode.com.ar"** enlazando a [https://cuyocode.com.ar](https://cuyocode.com.ar), sin poder ocultarlo, deshabilitarlo ni hacerlo menos visible que el resto del contenido del footer. Esto aplica incluso a usos privados o internos.

---

## Recursos Adicionales

- [Documentación de NestJS](https://docs.nestjs.com/)
- [Documentación de MongoDB](https://docs.mongodb.com/)
- [Documentación de Mongoose](https://mongoosejs.com/docs/)
- [Documentación de JWT](https://jwt.io/)
- [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
- [Cloudinary Docs](https://cloudinary.com/documentation)

---

## Soporte

Si tienes problemas o preguntas:

- Abre un [Issue](https://github.com/tu-usuario/distrify-back/issues)
- Consulta la [Wiki](https://github.com/tu-usuario/distrify-back/wiki)

---

## Roadmap

- [ ] Migración a GraphQL
- [ ] WebSocket para tiempo real
- [ ] App móvil (React Native)
- [ ] Panel de administración completo
- [ ] Integración con más pasarelas de pago
- [ ] Exportación a PDF/Excel
- [ ] Dashboard con gráficos avanzados
- [ ] Sistema de subastas

---

<p align="center">
  Desarrollado con ❤️ usando NestJS
</p>
