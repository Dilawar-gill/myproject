# 📄 Invoice Generator Application

A complete, production-ready invoice application built with Next.js 15, TypeScript, and modern web technologies. Create professional invoices, save them to a database, and generate PDFs instantly.

## ✨ Features

### 🎯 Core Functionality
- **📝 Invoice Creation**: Complete invoice form with company and client information
- **📊 Item Management**: Add/remove invoice items with automatic calculations
- **💰 Tax Calculations**: Automatic subtotal, tax, and total calculations
- **📄 PDF Generation**: Generate professional PDF invoices with one click
- **💾 Database Storage**: Save invoices to SQLite database with Prisma ORM
- **📋 Invoice History**: View and manage all previously created invoices
- **🔍 Search & Filter**: Search invoices by number, company, or client name

### 🎨 User Interface
- **📱 Responsive Design**: Mobile-friendly interface that works on all devices
- **🎨 Modern UI**: Clean, professional design using shadcn/ui components
- **🌙 Dark/Light Mode**: Built-in theme support (if configured)
- **⚡ Real-time Updates**: Live calculations and form validation

### 🛠️ Technical Features
- **⚡ Next.js 15**: Latest React framework with App Router
- **📘 TypeScript**: Full type safety throughout the application
- **🗄️ SQLite Database**: Lightweight, file-based database
- **🔧 Prisma ORM**: Type-safe database operations
- **📄 Puppeteer**: Server-side PDF generation
- **🐳 Docker Support**: Containerized deployment ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd invoice-generator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push database schema
   npm run db:push
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Production Build

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

1. **Build and start the application**
   ```bash
   # Development mode
   docker-compose up --build
   
   # Production mode with nginx
   docker-compose --profile production up --build
   ```

2. **Access the application**
   - Development: [http://localhost:3000](http://localhost:3000)
   - Production: [http://localhost:80](http://localhost:80)

### Using Docker Directly

1. **Build the Docker image**
   ```bash
   docker build -t invoice-generator .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 -v $(pwd)/data:/app/data invoice-generator
   ```

## 📁 Project Structure

```
invoice-generator/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Main invoice creation page
│   │   ├── invoices/          # Invoice history page
│   │   └── api/               # API routes
│   │       ├── invoices/      # Invoice CRUD operations
│   │       └── invoices/pdf/  # PDF generation
│   ├── components/
│   │   └── ui/               # shadcn/ui components
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Utilities and database connection
├── prisma/
│   └── schema.prisma         # Database schema
├── public/                   # Static assets
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose configuration
├── nginx.conf              # Nginx configuration for production
└── package.json            # Dependencies and scripts
```

## 🗄️ Database Schema

The application uses the following database models:

### Company
- Stores company information (name, address, phone, email)
- One-to-many relationship with invoices

### Client  
- Stores client information (name, address, phone, email)
- One-to-many relationship with invoices

### Invoice
- Main invoice entity with all invoice details
- Includes status tracking (DRAFT, SENT, PAID, OVERDUE, CANCELLED)
- Automatic calculation of subtotal, tax, and total amounts

### InvoiceItem
- Individual line items within invoices
- Stores description, quantity, unit price, and total price
- Belongs to one invoice

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Customization

#### Company Information
Edit the default company information in `src/app/page.tsx`:

```typescript
companyInfo: {
  name: 'Your Company Name',
  address: '123 Business St, City, State 12345',
  phone: '+1 (555) 123-4567',
  email: 'contact@yourcompany.com'
}
```

#### Tax Rate
The default tax rate is set to 8.5%. You can modify this in the form or change the default value in the state initialization.

#### PDF Styling
Customize the PDF appearance by modifying the HTML/CSS in `/src/app/api/invoices/pdf/route.ts`.

## 📖 Usage Guide

### Creating an Invoice

1. **Fill in Company Information**
   - Enter your company details (name, address, phone, email)
   - This information will be saved for future invoices

2. **Add Client Information**
   - Enter the client's details
   - New clients are automatically saved to the database

3. **Set Invoice Details**
   - Invoice number is auto-generated but can be customized
   - Set the invoice date and due date
   - Adjust the tax rate if needed

4. **Add Invoice Items**
   - Click "Add Item" to add new line items
   - Enter description, quantity, and unit price
   - Totals are calculated automatically
   - Use the trash icon to remove items

5. **Add Notes (Optional)**
   - Include any additional information or payment instructions

6. **Save or Generate PDF**
   - Click "Save Invoice" to save to the database
   - Click "Generate PDF" to download a PDF copy

### Managing Invoices

1. **View Invoice History**
   - Click "Invoice History" in the navigation
   - See all saved invoices in a table format

2. **Search Invoices**
   - Use the search bar to find invoices by number, company, or client

3. **Generate PDFs**
   - Click the download icon next to any invoice to generate a PDF

4. **View Statistics**
   - Dashboard shows total invoices, paid amounts, pending amounts, and overdue amounts

## 🔧 API Endpoints

### Invoice Management
- `POST /api/invoices` - Create a new invoice
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/[id]` - Get a specific invoice
- `PUT /api/invoices/[id]` - Update an invoice
- `DELETE /api/invoices/[id]` - Delete an invoice

### PDF Generation
- `POST /api/invoices/pdf` - Generate PDF for an invoice

## 🚀 Deployment

### Linux Mint Specific Instructions

1. **Install Node.js**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Install Docker (optional)**
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

3. **Set up the application**
   ```bash
   # Clone the repository
   git clone <repository-url>
   cd invoice-generator
   
   # Install dependencies
   npm install
   
   # Set up database
   npx prisma generate
   npm run db:push
   
   # Start the application
   npm run dev
   ```

### Production Deployment

1. **Environment Setup**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export DATABASE_URL="file:./production.db"
   ```

2. **Build and Deploy**
   ```bash
   # Build the application
   npm run build
   
   # Start the production server
   npm start
   ```

3. **Using Docker**
   ```bash
   # Production deployment with Docker Compose
   docker-compose --profile production up -d
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the code comments for additional context

## 🚀 Future Enhancements

The application is designed to be extensible. Potential future features include:
- User authentication and authorization
- Email invoice delivery
- Payment gateway integration
- Recurring invoices
- Multi-currency support
- Advanced reporting and analytics
- Client portal
- QuickBooks integration

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies. 🚀