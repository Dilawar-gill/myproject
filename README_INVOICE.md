# 🧾 Invoice Generator - HVAC Services

Complete Next.js 15 + TypeScript invoice application for HVAC service companies with bilingual support.

## ✨ Features

### 🔐 Authentication
- Admin login system
- JWT-based authentication
- Protected admin routes

### 👨‍💼 Admin Panel
- **Company Management**: Add/edit company details, logo upload, province selection
- **Service Management**: Predefined HVAC services with bilingual names (EN/FR)
- **Price Control**: Edit service prices with discount support

### 📄 Invoice Creation
- Select company (auto-fills info)
- Add client details
- Select from predefined services
- Adjust quantity and apply discounts
- Auto-calculate subtotal, tax, and total
- Province-based tax calculation
- Generate professional PDFs

### 🌍 Bilingual Support
- Quebec invoices: Automatic English + French
- Other provinces: English only
- All services have French translations

### 📊 Invoice Management
- View all invoices
- Search by invoice #, company, or client
- Download PDFs anytime
- Auto-numbering: `PROVINCE-YYYYMM-XXXX`

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Seed initial data (admin user + services)
npm run dev
# Then visit: http://localhost:3000/api/seed

# Login credentials
Email: admin@example.com
Password: admin123
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Invoice creation page
│   ├── login/page.tsx        # Admin login
│   ├── admin/page.tsx        # Admin panel
│   ├── invoices/page.tsx     # Invoice history
│   └── api/
│       ├── auth/login/       # Authentication
│       ├── companies/        # Company CRUD
│       ├── services/         # Service CRUD
│       ├── invoices/         # Invoice CRUD + PDF
│       └── seed/             # Initial data seeding
├── types/
│   └── index.ts              # TypeScript types
└── lib/
    └── db.ts                 # Prisma client

prisma/
└── schema.prisma             # Database schema
```

## 🗄️ Database Models

- **User**: Admin authentication
- **Company**: Company info with logo and province
- **Client**: Client information
- **Service**: Bilingual HVAC services
- **Invoice**: Main invoice with auto-numbering
- **InvoiceItem**: Line items with discount
- **InvoiceCounter**: Per-province/month counter

## 💰 Tax Rates

- Ontario (ON): 13% HST
- Quebec (QC): 14.975% GST+QST
- New Brunswick (NB): 15% HST
- Nova Scotia (NS): 15% HST

## 🛠️ Default Services

### Core Services
- Air duct cleaning: $199
- Dryer vent cleaning: $69
- Dryer vent cleaning (2nd floor): $199
- Furnace blower & A/C cleaning: $220
- Air exchanger (HRV/ERV) cleaning: $249
- Heat pump (split unit) cleaning: $189

### Additional Services
- Power cleaning with reverse sweeper: $299
- Air filter replacement (any size): $75

## 📝 Invoice Numbering

Format: `PREFIX-YYYYMM-XXXX`

Examples:
- `ON-202501-0001` (Ontario, January 2025, 1st invoice)
- `QC-202501-0042` (Quebec, January 2025, 42nd invoice)

Counter resets per province per month, stored in database.

## 🎨 UI Components

Built with shadcn/ui:
- Button, Input, Label
- Card, Tabs
- Select, Textarea
- Toast notifications

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login`

### Companies
- `GET /api/companies`
- `POST /api/companies`

### Services
- `GET /api/services`
- `POST /api/services`
- `PUT /api/services/[id]`

### Invoices
- `GET /api/invoices`
- `POST /api/invoices` (auto-generates invoice number)
- `POST /api/invoices/pdf` (generates PDF with Puppeteer)

### Seed
- `POST /api/seed` (creates admin user + default services)

## 📄 PDF Generation

- Uses Puppeteer for server-side rendering
- Professional invoice layout
- Company logo included
- Bilingual for Quebec (EN/FR side-by-side)
- Single-page format

## 🔐 Security

- Passwords hashed with bcryptjs
- JWT tokens stored in HTTP-only cookies
- Protected admin routes
- Environment variables for secrets

## 🌐 Deployment

```bash
# Build
npm run build

# Start production
npm start
```

Ensure Puppeteer dependencies installed on server:
```bash
sudo apt-get install -y chromium-browser
```

## 📚 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui
- **Database**: SQLite + Prisma ORM
- **PDF**: Puppeteer
- **Auth**: JWT + bcryptjs

## 🎯 Usage Flow

1. **Login** → `/login` (admin@example.com / admin123)
2. **Admin Panel** → `/admin` (add companies & services)
3. **Create Invoice** → `/` (select company, add items, generate PDF)
4. **View History** → `/invoices` (search & download PDFs)

## 💡 Key Logic

### Discount Calculation
```typescript
totalPrice = (unitPrice - discount) × quantity
```

### Tax Calculation
```typescript
taxAmount = subtotal × taxRate
total = subtotal + taxAmount
```

### Bilingual PDF
```typescript
if (province === 'QC') {
  // Show English + French labels
} else {
  // English only
}
```

## 🤝 Contributing

This is a production-ready template. Customize as needed:
- Add more provinces
- Add payment tracking
- Add email delivery
- Add recurring invoices

---

Built with ❤️ for HVAC service companies
