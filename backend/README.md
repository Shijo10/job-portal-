# Job Portal Backend

Backend API for the local workers job portal application.

## Structure

```
backend/
├── models/              # MongoDB schemas
│   ├── Worker.js       # Worker model
│   ├── Customer.js     # Customer model
│   ├── Job.js         # Job model
│   └── Admin.js       # Admin model
├── routes/             # API routes
│   ├── workers.js     # Worker endpoints
│   ├── customers.js   # Customer endpoints
│   └── jobs.js        # Job endpoints
├── server.js          # Express server
├── seed.js           # Database seeder
├── package.json      # Dependencies
└── .env             # Environment variables
```

## Installation

```bash
cd backend
npm install
```

## Running the Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev

# Seed database with sample data
npm run seed
```

## Environment Variables

Create a `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/job_portal
PORT=3000
```

## API Endpoints

### Workers
- `GET /api/workers` - Get all workers
- `GET /api/workers/:id` - Get single worker
- `POST /api/workers` - Create worker
- `PUT /api/workers/:id` - Update worker
- `DELETE /api/workers/:id` - Delete worker

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/health` - Health check

## Database Models

### Worker
- name, email, phone, location
- skills (array)
- hourlyRate, experience
- availability (available/busy/unavailable)
- rating (0-5)
- completedJobs, verified

### Customer
- name, email, phone, location
- company
- postedJobs, activeJobs
- verified

### Job
- title, description, category
- customerId, customerName
- workerId, workerName
- location, budget, duration
- status (open/assigned/in-progress/completed/cancelled)
- priority (low/medium/high/urgent)

