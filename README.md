# ⚽ Quiniela Mundial 2026

Sistema de quinielas para la Copa Mundial FIFA 2026™  
Desarrollado con **Next.js 14 + React + PostgreSQL**

---

## 🗂️ Estructura del Proyecto

```
src/
├── app/
│   ├── admin/
│   │   ├── equipos/     → CRUD de equipos
│   │   ├── fases/       → CRUD de fases (Grupos, Octavos, etc.)
│   │   ├── partidos/    → CRUD de partidos + ingresar resultados
│   │   └── usuarios/    → CRUD de usuarios
│   ├── api/             → API Routes (backend)
│   │   ├── equipos/
│   │   ├── fases/
│   │   ├── partidos/
│   │   ├── quinielas/
│   │   ├── usuarios/
│   │   └── reportes/
│   ├── quinielas/       → Ingresar predicciones
│   ├── reportes/
│   │   ├── calendario/  → Calendario de partidos
│   │   ├── posiciones/  → Tabla de posiciones
│   │   └── resultados/  → Resultados de quinielas
│   ├── globals.css
│   └── layout.tsx
├── components/
│   └── Sidebar.tsx
└── lib/
    ├── db.ts            → Conexión PostgreSQL (pg Pool)
    ├── auth.ts          → JWT + bcrypt
    └── puntos.ts        → Cálculo de puntos de quinielas
```

---

## 🚀 Pasos para correr el proyecto

### 1. Instalar dependencias

```bash
cd quinela-mundial
npm install
```

### 2. Crear la base de datos en PostgreSQL

Abre **pgAdmin** o **psql** y crea la base de datos:

```sql
CREATE DATABASE quinela_mundial;
```

Luego ejecuta el script de tablas (el que ya tienen: `DB_Proyecto_Tablas.sql`):

```bash
psql -U postgres -d quinela_mundial -f DB_Proyecto_Tablas.sql
```

O pégalo directo en pgAdmin.

### 3. Configurar variables de entorno

Edita el archivo `.env.local` con tus datos:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=quinela_mundial
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=algo-secreto-aqui
```

### 4. Correr el servidor de desarrollo

```bash
npm run dev
```

Abre el navegador en: **http://localhost:3000**

---

## 📋 Orden recomendado para cargar datos

1. **Admin → Fases**: Crear las fases del torneo  
   (Grupos, Octavos de Final, Cuartos de Final, Semifinal, Final)

2. **Admin → Equipos**: Agregar los 48 equipos participantes  
   (Puedes usar emojis de banderas o URLs de imágenes)

3. **Admin → Partidos**: Programar los partidos con fecha/hora  
   - El sistema **detecta traslapes** automáticamente  
   - Cada equipo solo puede aparecer una vez por fase

4. **Quinielas → Registrarse**: Los participantes crean su cuenta

5. **Quinielas**: Cada usuario ingresa sus predicciones  
   - Solo se pueden ingresar antes de que empiece el partido  
   - Se permite ingreso parcial en fases que ya empezaron

6. **Admin → Partidos**: Ingresar resultados cuando terminan los partidos  
   - Los puntos de quinielas se calculan **automáticamente**

---

## 🎯 Sistema de Puntos

| Situación | Puntos |
|-----------|--------|
| Atinó el resultado (quién ganó / empate) | **3 pts** |
| Atinó el marcador exacto (además del resultado) | **+3 pts** |
| Total máximo por partido | **6 pts** |

---

## 📊 Reportes disponibles

- **Calendario**: Todos los partidos con fecha, hora y resultado
- **Tabla de posiciones**: PJ, PG, PE, PP, GF, GC, DG, PTS por grupo
- **Resultados de quinielas**: Ranking de participantes por fase y general

---

## 🏗️ Producción (build)

```bash
npm run build
npm start
```

---

## 🔧 Tecnologías

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **PostgreSQL** con el módulo `pg`
- **bcryptjs** para hashear contraseñas
- **jsonwebtoken** para sesiones
- Fuentes: Bebas Neue + Barlow (Google Fonts)

---

`<UG>6A0E4B00</UG>`
