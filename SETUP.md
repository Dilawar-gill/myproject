# Invoice Generator Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 3. Seed Initial Data
Run this to create admin user and default services:
```bash
curl -X POST http://localhost:3000/api/seed
```

Or visit: http://localhost:3000/api/seed in your browser

**Default Admin Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

### 4. Start Development Server
```bash
npm run dev
```

Visit: http://localhost:3000

## Application Flow

### 1. Login
- Go to `/login`
- Use admin credentials
- Redirects to Admin Panel

### 2. Admin Panel (`/admin`)
- **Companies Tab**: Add company details, logo, province
- **Services Tab**: Add/edit services and prices
- Services are pre-seeded with default HVAC services

### 3. Create Invoice (`/`)
- Select company (auto-fills company info)
- Enter client details
- Add invoice items:
  - Select from predefined services
  - Adjust quantity
  - Apply discounts
  - Total auto-calculates
- Tax calculated based on company province
- Generate PDF (bilingual for Quebec)

### 4. Invoice History (`/invoices`)
- View all invoices
- Search by invoice #, company, or client
- Download PDFs

## Key Features

### Auto Invoice Numbering
Format: `PROVINCE-YYYYMM-XXXX`
- Example: `ON-202501-0001`
- Counter resets per province per month
- Stored in database to prevent duplicates

### Tax Calculation
- ON: 13% HST
- QC: 14.975% GST+QST
- NB: 15% HST
- NS: 15% HST

### Bilingual PDF (Quebec)
- If company province is QC, PDF shows English + French
- All labels, headers, and tax names bilingual
- Other provinces: English only

### Discount Logic
- Each item can have a discount
- Total = (Unit Price - Discount) × Quantity
- Subtotal = Sum of all item totals
- Tax = Subtotal × Tax Rate
- Total = Subtotal + Tax

## API Routes

### Authentication
- `POST /api/auth/login` - Login

### Companies
- `GET /api/companies` - List all companies
- `POST /api/companies` - Create company

### Services
- `GET /api/services` - List all services
- `POST /api/services` - Create service
- `PUT /api/services/[id]` - Update service price

### Invoices
- `GET /api/invoices` - List all invoices
- `POST /api/invoices` - Create invoice (auto-generates number)
- `POST /api/invoices/pdf` - Generate PDF

### Seed
- `POST /api/seed` - Seed initial data

## Database Schema

### Models
- **User**: Admin authentication
- **Company**: Company details with logo and province
- **Client**: Client information
- **Service**: Predefined services (bilingual)
- **Invoice**: Main invoice with auto-numbering
- **InvoiceItem**: Line items with discount support
- **InvoiceCounter**: Tracks invoice numbers per province/month

## Environment Variables

Create `.env` file:
```env
DATABASE_URL="file:./prisma/db/custom.db"
JWT_SECRET="your-secret-key-change-in-production"
```

## Default Services (Pre-seeded)

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

All services include French translations for Quebec invoices.

## Troubleshooting

### Puppeteer Issues
If PDF generation fails, install Chrome dependencies:
```bash
sudo apt-get install -y chromium-browser
```

### Database Issues
Reset database:
```bash
npm run db:reset
```

Then re-seed:
```bash
curl -X POST http://localhost:3000/api/seed
```

## Production Deployment

1. Set environment variables
2. Build: `npm run build`
3. Start: `npm start`
4. Ensure Puppeteer dependencies installed on server
