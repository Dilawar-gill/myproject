# 🚀 Quick Start Guide

## First Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Setup database
npm run db:push

# 4. Seed admin user (optional)
curl http://localhost:3001/api/seed
```

## Run Development Server

```bash
npm run dev
```

Visit: **http://localhost:3001**

Default login:
- Email: `admin@example.com`
- Password: `admin123`

## Run Production Server

```bash
# Build
npm run build

# Start
npm start
```

Visit: **http://localhost:3000**

## Stop Server

```bash
npm run dev:stop
```

## Restart Server

```bash
npm run dev:restart
```

---

## 🐳 Docker (Alternative)

```bash
# Development
docker-compose up --build

# Production
docker-compose --profile production up --build
```

---

## ⚡ Quick Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 3001) |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run dev:stop` | Stop dev server |
| `npm run db:push` | Push database schema |
| `npx prisma studio` | Open database GUI |

---

## 🔧 Troubleshooting

**Port already in use?**
```bash
npm run dev:stop
npm run dev
```

**Database issues?**
```bash
npm run db:push
```

**Need fresh start?**
```bash
rm -rf .next node_modules
npm install
npx prisma generate
npm run dev
```
