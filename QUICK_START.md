# Quick Start Guide

## 🚀 Getting Started in 4 Steps

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

Or from the root directory:
```bash
npm run install-backend
```

### Step 2: Make Sure MongoDB is Running
Ensure MongoDB is running on your local machine at `mongodb://localhost:27017/`

### Step 3: Start the Server

From the backend directory:
```bash
cd backend
npm start
```

Or from the root directory:
```bash
npm start
```

You should see:
```
🚀 Server running on http://localhost:3000
📊 Admin Panel: http://localhost:3000/admin.html
✅ Connected to MongoDB
```

### Step 4: Access the Admin Panel
Open your browser and go to:
```
http://localhost:3000/admin.html
```

## 📝 Optional: Add Sample Data

To populate the database with sample workers, customers, and jobs:

```bash
npm run seed
```

This will add:
- 4 sample workers
- 3 sample customers
- 5 sample jobs

## 🎯 What You Can Do

### Dashboard
- View real-time statistics
- Monitor total workers, customers, and jobs
- See recent activity

### Workers Management
- Click "Workers" in the sidebar
- Click "Add Worker" to create a new worker
- Edit or delete existing workers
- Track skills, availability, ratings, and more

### Customers Management
- Click "Customers" in the sidebar
- Click "Add Customer" to create a new customer
- Manage customer information and verification status

### Jobs Management
- Click "Jobs" in the sidebar
- Click "Add Job" to post a new job
- Update job status (open, assigned, in-progress, completed, cancelled)
- Set priority levels (low, medium, high, urgent)
- Assign workers to jobs

## 🔧 API Testing

You can also test the API directly:

### Get All Workers
```bash
curl http://localhost:3000/api/workers
```

### Get Dashboard Stats
```bash
curl http://localhost:3000/api/dashboard/stats
```

### Create a Worker
```bash
curl -X POST http://localhost:3000/api/workers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Worker",
    "email": "test@example.com",
    "phone": "555-0000",
    "location": "Test City",
    "skills": ["Testing"],
    "hourlyRate": 40
  }'
```

## 📁 Project Structure

```
d:\project\
├── models/              # MongoDB schemas
│   ├── Worker.js
│   ├── Customer.js
│   ├── Job.js
│   └── Admin.js
├── routes/              # API routes
│   ├── workers.js
│   ├── customers.js
│   └── jobs.js
├── public/              # Frontend files
│   ├── admin.html
│   ├── styles.css
│   └── script.js
├── server.js            # Main server file
├── seed.js             # Sample data seeder
├── package.json
└── .env                # Configuration
```

## 🎨 Features

✅ Full CRUD operations for Workers, Customers, and Jobs
✅ Real-time dashboard with statistics
✅ Responsive design
✅ Modern UI with Font Awesome icons
✅ MongoDB integration
✅ RESTful API
✅ Form validation
✅ Status and priority management
✅ Search and filter capabilities (in tables)

## 🔒 Database Schema

### Worker
- Name, email, phone, location
- Skills (array)
- Hourly rate, experience
- Availability status
- Rating (0-5)
- Completed jobs count
- Verification status

### Customer
- Name, email, phone, location
- Company name
- Posted jobs count
- Active jobs count
- Verification status

### Job
- Title, description, category
- Customer and worker references
- Location, budget, duration
- Status (open, assigned, in-progress, completed, cancelled)
- Priority (low, medium, high, urgent)
- Timestamps

## 🛠️ Troubleshooting

### Server won't start
- Make sure MongoDB is running
- Check if port 3000 is available
- Run `npm install` to ensure all dependencies are installed

### Can't connect to database
- Verify MongoDB is running: `mongod --version`
- Check the connection string in `.env` file
- Default: `mongodb://localhost:27017/job_portal`

### Admin panel not loading
- Make sure the server is running
- Check browser console for errors
- Try clearing browser cache

## 📞 Support

For issues or questions, check:
- README.md for detailed documentation
- Server logs in the terminal
- Browser console for frontend errors

## 🎉 You're All Set!

Your admin panel is now ready to manage workers, customers, and jobs for your local job portal!

