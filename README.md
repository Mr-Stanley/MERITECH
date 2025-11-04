# MERITECH BUILDING TECHNOLOGIES - Building Materials Shop

A full-stack Next.js 14 application for managing and displaying a digital menu of building materials and interior decoration products. Customers can scan a QR code to view products organized by category, while admins can manage products and categories through a dashboard.

## Features

- 🏗️ **Public Menu Page** - Browse products by category with a mobile-first design
- 🔐 **Admin Authentication** - Secure login and registration with bcrypt password hashing
- 📊 **Admin Dashboard** - Full CRUD operations for categories and products
- 🖼️ **Image Upload** - Upload product images to Filebase (S3-compatible storage)
- 📱 **QR Code Generation** - Generate QR codes linking to the public menu
- 📱 **Mobile-First Design** - Responsive design that works on all devices
- 🎨 **Modern UI** - Clean, intuitive interface with TailwindCSS

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Vercel Postgres** - Database (raw SQL queries)
- **Filebase** - S3-compatible object storage for images
- **bcryptjs** - Password hashing
- **qrcode** - QR code generation

## Prerequisites

- Node.js 18+ and npm/yarn
- Vercel Postgres database
- Filebase account with S3-compatible credentials and bucket

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd digital-menu-website
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:

```env
# Vercel Postgres
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url
POSTGRES_USER=your_postgres_user
POSTGRES_HOST=your_postgres_host
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database

# Filebase (S3-compatible storage)
FILEBASE_ENDPOINT=https://s3.filebase.com
FILEBASE_REGION=us-east-1
FILEBASE_ACCESS_KEY_ID=your_filebase_access_key
FILEBASE_SECRET_ACCESS_KEY=your_filebase_secret_key
FILEBASE_BUCKET_NAME=your_bucket_name
```

4. Set up the database:
Run the following SQL commands in your Vercel Postgres database:

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  image_url VARCHAR(2000),
  category_id INT NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
digital-menu-website/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── me/route.ts
│   │   ├── categories/route.ts
│   │   ├── products/route.ts
│   │   └── upload/route.ts
│   ├── admin/
│   │   └── page.tsx
│   ├── menu/
│   │   └── page.tsx
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── CategoryTabs.tsx
│   ├── ProductCard.tsx
│   └── EmptyState.tsx
├── lib/
│   ├── db.ts
│   ├── filebase.ts
│   └── auth.ts
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new admin user
- `POST /api/auth/login` - Login admin user
- `POST /api/auth/logout` - Logout admin user
- `GET /api/auth/me` - Get current user

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a category (requires auth)
- `PUT /api/categories` - Update a category (requires auth)
- `DELETE /api/categories?id={id}` - Delete a category (requires auth)

### Products
- `GET /api/products` - Get all products
- `GET /api/products?categoryId={id}` - Get products by category
- `GET /api/products?status={status}` - Get products by status
- `POST /api/products` - Create a product (requires auth)
- `PUT /api/products` - Update a product (requires auth)
- `DELETE /api/products?id={id}` - Delete a product (requires auth)

### Upload
- `POST /api/upload` - Upload an image to Filebase (requires auth)

## Usage

### Admin Dashboard

1. Navigate to `/admin`
2. Register a new account or login with existing credentials
3. Manage categories and products:
   - Add/Edit/Delete categories
   - Add/Edit/Delete products
   - Upload product images
   - View and download QR code for the menu

### Public Menu

1. Navigate to `/menu` or scan the QR code from the admin dashboard
2. Browse products by category
3. View product details, images, and prices

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The application will automatically use Vercel Postgres if configured in your Vercel project.

## License

MIT

