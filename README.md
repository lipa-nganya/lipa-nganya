# Lipa Nganya - Customer & Driver Apps

This repository contains both the customer and driver mobile web applications for the Lipa Nganya matatu payment system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database

### Installation
```bash
# Install dependencies for all apps
npm run install:all
```

### Development

#### Option 1: Run All Apps Simultaneously
```bash
npm run dev:all
```

#### Option 2: Run Apps Individually

**Backend API:**
```bash
npm run dev:backend
# Runs on http://localhost:7070
```

**Customer App:**
```bash
npm run dev:customer
# Runs on http://localhost:5173
```

**Driver App:**
```bash
npm run dev:driver
# Runs on http://localhost:5175
```

## 📱 Applications

### Customer App (Port 5173)
- **URL**: http://localhost:5173
- **Theme**: Orange
- **Purpose**: Customer payment interface
- **Features**:
  - OTP-based authentication
  - M-Pesa STK Push payments
  - Payment history
  - Profile management
  - Matatu rating system

### Driver App (Port 5175)
- **URL**: http://localhost:5175
- **Theme**: Blue
- **Purpose**: Driver dashboard and management
- **Features**:
  - Matatu number authentication
  - Trip management (start/end)
  - Earnings tracking
  - Payment confirmation
  - Performance analytics
  - Issue reporting

### Backend API (Port 7070)
- **URL**: http://localhost:7070
- **Purpose**: Shared backend for both apps
- **Features**:
  - Customer authentication
  - Driver authentication
  - M-Pesa integration
  - Payment processing
  - SMS OTP via Advanta API

## 🎨 Visual Differentiation

### Customer App
- **Color Scheme**: Orange (#ff751f)
- **Branding**: "Lipa Nganya" customer interface
- **Icons**: Payment, user, phone icons
- **Layout**: Payment-focused, customer-centric

### Driver App
- **Color Scheme**: Blue (#4a90e2)
- **Branding**: "Driver Portal" with bus icons
- **Icons**: Bus, trip, earnings icons
- **Layout**: Dashboard-focused, driver-centric

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lipa_nganya
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# M-Pesa
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=your_mpesa_shortcode
MPESA_PASSKEY=your_mpesa_passkey

# SMS API
ADVANTA_API_KEY=your_advantasms_api_key
ADVANTA_PARTNER_ID=your_advantasms_partner_id
ADVANTA_SHORTCODE=LIPANGANYA
```

#### Customer App (.env)
```bash
VITE_BACKEND_URL=http://localhost:7070
```

#### Driver App (.env)
```bash
VITE_BACKEND_URL=http://localhost:7070
```

## 📋 Available Scripts

- `npm run dev:all` - Start all applications
- `npm run dev:customer` - Start customer app only
- `npm run dev:driver` - Start driver app only
- `npm run dev:backend` - Start backend API only
- `npm run install:all` - Install dependencies for all apps
- `npm run build:customer` - Build customer app for production
- `npm run build:driver` - Build driver app for production

## 🚀 Deployment

Both apps can be deployed separately:

1. **Customer App**: Deploy to customer subdomain
2. **Driver App**: Deploy to driver subdomain  
3. **Backend API**: Deploy to API subdomain

## 📞 Support

For technical support or questions, please contact the development team.
