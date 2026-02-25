# Job Portal Admin Panel

A comprehensive admin panel for managing a local workers job portal with MongoDB backend and vanilla HTML/CSS/JS frontend.

## 📁 Project Structure

```
job-portal-admin/
├── backend/                # Backend API (Node.js/Express/MongoDB)
│   ├── models/            # MongoDB schemas
│   ├── routes/            # API endpoints
│   ├── server.js          # Express server
│   ├── seed.js           # Database seeder
│   ├── package.json      # Backend dependencies
│   └── .env              # Environment variables
├── frontend/              # Frontend (HTML/CSS/JS)
│   ├── admin.html        # Admin panel
│   ├── index.html        # Landing page
│   ├── styles.css        # Styling
│   └── script.js         # Frontend logic
├── package.json          # Root package.json with scripts
└── README.md            # This file
```

## Features

### 🎯 Core Functionality
- **Dashboard**: Real-time statistics and recent activity overview
- **Workers Management**: Full CRUD operations for worker profiles
- **Customers Management**: Manage customer accounts and information
- **Jobs Management**: Create, update, and track job postings

### 📊 Dashboard Statistics
- Total workers, customers, and jobs count
- Open jobs and completed jobs tracking
- Available workers monitoring
- Recent activity feed

### 👷 Workers Features
- Name, email, phone, and location
- Skills management (comma-separated)
- Hourly rate and experience tracking
- Availability status (available, busy, unavailable)
- Rating system (0-5 stars)
- Completed jobs counter
- Verification status

### 👔 Customers Features
- Contact information management
- Company details
- Posted jobs tracking
- Verification status

### 💼 Jobs Features
- Job title, description, and category
- Customer and worker assignment
- Location and budget tracking
- Status management (open, assigned, in-progress, completed, cancelled)
- Priority levels (low, medium, high, urgent)
- Duration and deadline tracking

## Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- CORS enabled
- Body Parser

**Frontend:**
- HTML5
- CSS3 (Modern responsive design)
- Vanilla JavaScript (ES6+)
- Font Awesome icons

## Installation

### Quick Start

1. **Install Backend Dependencies**
```bash
npm run install-backend
```

Or manually:
```bash
cd backend
npm install
```

2. **Configure MongoDB**
The application is configured to connect to:
```
mongodb://localhost:27017/job_portal
```

Make sure MongoDB is running on your local machine.

3. **Start the Server**

From the root directory:
```bash
npm start
```

Or from the backend directory:
```bash
cd backend
npm start
```

For development with auto-reload:
```bash
npm run dev
```

4. **Access the Admin Panel**
Open your browser and navigate to:
```
http://localhost:3000/admin.html
```

### Seed Sample Data (Optional)

```bash
npm run seed
```

This will populate your database with sample workers, customers, and jobs.

## API Endpoints

### Workers
- `GET /api/workers` - Get all workers
- `GET /api/workers/:id` - Get single worker
- `POST /api/workers` - Create worker
- `PUT /api/workers/:id` - Update worker
- `DELETE /api/workers/:id` - Delete worker
- `GET /api/workers/stats/overview` - Get worker statistics

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/stats/overview` - Get customer statistics

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/stats/overview` - Get job statistics

### Dashboard
- `GET /api/dashboard/stats` - Get overall dashboard statistics
- `GET /api/health` - Health check endpoint

## Detailed Project Structure

### Backend (`backend/`)
- **models/** - MongoDB schemas (Worker, Customer, Job, Admin)
- **routes/** - API endpoints for each resource
- **server.js** - Express server with MongoDB connection
- **seed.js** - Database seeder with sample data
- **package.json** - Backend dependencies
- **.env** - Environment configuration

### Frontend (`frontend/`)
- **admin.html** - Main admin panel interface
- **index.html** - Landing page
- **styles.css** - All styling and responsive design
- **script.js** - Frontend logic and API calls

## Environment Variables

Create a `.env` file in the root directory:

```env
MONGODB_URI=mongodb://localhost:27017/job_portal
PORT=3000
```

## Usage Guide

### Adding a Worker
1. Navigate to "Workers" section
2. Click "Add Worker" button
3. Fill in the required fields
4. Click "Save"

### Managing Jobs
1. Navigate to "Jobs" section
2. Click "Add Job" to create new job
3. Use edit/delete buttons for existing jobs
4. Update job status and priority as needed

### Dashboard Overview
- View real-time statistics
- Monitor recent activity
- Track system performance

## License

ISC

