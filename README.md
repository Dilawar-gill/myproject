🚀 Buzz Plus Solutions – Invoice Generator App (Pro Version)

A fast, modern, production-ready invoice generator built with Next.js 15, TypeScript, Prisma, SQLite, and Puppeteer PDF.

✨ Features

✅ Create professional invoices

✅ Add unlimited items

✅ Auto subtotal, tax, total

✅ Save invoices to database

✅ Generate PDF instantly

✅ Invoice history + search

✅ Fully responsive UI

✅ Admin panel ready

✅ Docker support

⚙️ Quick Install (Copy–Paste)
git clone <repo-url>
cd invoice-generator
npm install
npx prisma generate
npm run db:push
npm run dev


Visit:
👉 http://localhost:3000

🛠️ Production Build
npm run build
npm start

🐳 Docker (Copy–Paste)
Development
docker-compose up --build

Production (Nginx)
docker-compose --profile production up --build

🧱 Project Structure (Clean)
src/
  app/
    page.tsx          # Create Invoice
    invoices/         # Invoice History
    api/
      invoices/       # CRUD
      invoices/pdf/   # PDF Generator
  components/ui/      # shadcn/ui
  lib/                # Utils
prisma/
  schema.prisma
public/
Dockerfile
docker-compose.yml
package.json

🗄️ Database Models

Company → Business info

Client → Customer info

Invoice → Main invoice data

InvoiceItem → Line items

🔧 Environment Variables

Create .env:

DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

🧑‍💻 Usage (Super Simple)
👉 Create Invoice

Fill company info

Fill client info

Add items

Tax auto-calculated

Save or download PDF

👉 Manage Invoices

View invoice history

Search invoices

Download PDFs anytime

📡 API Endpoints
POST   /api/invoices
GET    /api/invoices
GET    /api/invoices/[id]
PUT    /api/invoices/[id]
DELETE /api/invoices/[id]
POST   /api/invoices/pdf

🧰 Linux Mint Setup (Copy–Paste)
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs docker.io docker-compose

git clone <repo-url>
cd invoice-generator
npm install
npx prisma generate
npm run db:push
npm run dev

🚀 Future Upgrades

User login system

Online payments

Email invoice sender

Recurring invoices

Multi-currency

Analytics dashboard

🔥 Short, Clean, Professional — READY TO USE

If you want, I can also create:

✅ Full admin panel prompt
✅ Full login page prompt (based on your brand kit)
✅ Full branding pack added to this README
✅ Full Docker + Linux deployment guide
