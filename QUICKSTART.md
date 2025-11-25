# 🚀 QUICK START GUIDE

## Step 1: Start Server
```bash
npm run dev
```

## Step 2: Seed Database
Visit: **http://localhost:3000/api/seed**

You should see:
```json
{
  "message": "Database seeded successfully",
  "credentials": {
    "email": "admin@example.com",
    "password": "admin123"
  }
}
```

## Step 3: Login
Visit: **http://localhost:3000/login**

**Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

## Step 4: Setup Your Company
1. Go to **Admin Panel**
2. Add your company details
3. Upload logo (optional)
4. Add/edit services

## Step 5: Create Invoices
1. Go to **Create Invoice**
2. Select company
3. Add client details
4. Select services
5. Apply discounts
6. Generate PDF

---

## 🎨 Branding Applied
- ✅ Blue color scheme
- ✅ Custom logo in sidebar
- ✅ Branded login page
- ✅ Professional UI

## 🌍 Bilingual Support
- Quebec invoices: Automatic EN/FR
- Other provinces: English only

## 💰 Tax Rates
- ON: 13% HST
- QC: 14.975% GST+QST
- NB: 15% HST
- NS: 15% HST

## 📋 Invoice Numbering
Format: `PROVINCE-YYYYMM-XXXX`
- Example: `ON-202501-0001`

---

## ⚠️ Troubleshooting

### Login 401 Error
1. Visit http://localhost:3000/api/seed
2. Check terminal for success message
3. Try login again

### Database Issues
```bash
npm run db:reset
npm run dev
```
Then visit seed endpoint again.

### Port Already in Use
```bash
npm run dev:stop
npm run dev
```

---

## 📁 Key Files
- `/src/app/page.tsx` - Create Invoice
- `/src/app/admin/page.tsx` - Admin Panel
- `/src/app/invoices/page.tsx` - Invoice History
- `/src/app/login/page.tsx` - Login
- `/src/components/Sidebar.tsx` - Navigation
- `/src/app/api/seed/route.ts` - Database Seeding
- `/src/app/api/auth/login/route.ts` - Authentication

---

**Ready to use! 🎉**
