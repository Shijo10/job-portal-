const mongoose = require('mongoose');
require('dotenv').config();

const Worker = require('./models/Worker');
const Customer = require('./models/Customer');
const Job = require('./models/Job');
const Bid = require('./models/Bid');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job_portal';

// Sample data
// Default password for all seed data: Password123!
const sampleWorkers = [
    {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@gmail.com',
        password: 'Password123!',
        phone: '+91 98765 43210',
        skills: ['Plumbing', 'Electrical', 'General Repair'],
        experience: 5,
        location: 'Koramangala, Bangalore',
        hourlyRate: 350,
        availability: 'available',
        rating: 4.5,
        completedJobs: 23,
        verified: true
    },
    {
        name: 'Priya Sharma',
        email: 'priya.sharma@gmail.com',
        password: 'Password123!',
        phone: '+91 98765 43211',
        skills: ['Carpentry', 'Painting', 'Interior Design'],
        experience: 8,
        location: 'Indiranagar, Bangalore',
        hourlyRate: 400,
        availability: 'available',
        rating: 4.8,
        completedJobs: 45,
        verified: true
    },
    {
        name: 'Amit Patel',
        email: 'amit.patel@gmail.com',
        password: 'Password123!',
        phone: '+91 98765 43212',
        skills: ['HVAC', 'AC Installation', 'Refrigeration'],
        experience: 10,
        location: 'Whitefield, Bangalore',
        hourlyRate: 500,
        availability: 'busy',
        rating: 4.9,
        completedJobs: 67,
        verified: true
    },
    {
        name: 'Sunita Reddy',
        email: 'sunita.reddy@gmail.com',
        password: 'Password123!',
        phone: '+91 98765 43213',
        skills: ['Landscaping', 'Gardening', 'Plant Care'],
        experience: 3,
        location: 'HSR Layout, Bangalore',
        hourlyRate: 250,
        availability: 'available',
        rating: 4.2,
        completedJobs: 15,
        verified: false
    }
];

const sampleCustomers = [
    {
        name: 'Infosys Technologies',
        email: 'contact@infosys.com',
        password: 'Password123!',
        phone: '+91 80 2852 0261',
        location: 'Electronic City, Bangalore',
        company: 'Infosys Technologies',
        postedJobs: 5,
        activeJobs: 2,
        verified: true
    },
    {
        name: 'Ananya Iyer',
        email: 'ananya.iyer@gmail.com',
        password: 'Password123!',
        phone: '+91 98765 12345',
        location: 'Jayanagar, Bangalore',
        company: '',
        postedJobs: 2,
        activeJobs: 1,
        verified: true
    },
    {
        name: 'TechHub Solutions Pvt Ltd',
        email: 'info@techhub.in',
        password: 'Password123!',
        phone: '+91 80 4112 3456',
        location: 'Marathahalli, Bangalore',
        company: 'TechHub Solutions Pvt Ltd',
        postedJobs: 8,
        activeJobs: 3,
        verified: true
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await Worker.deleteMany({});
        await Customer.deleteMany({});
        await Job.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Insert workers (save individually to trigger pre-save hooks for password hashing)
        const workers = [];
        for (const workerData of sampleWorkers) {
            const worker = new Worker(workerData);
            await worker.save();
            workers.push(worker);
        }
        console.log(`✅ Added ${workers.length} workers`);

        // Insert customers (save individually to trigger pre-save hooks for password hashing)
        const customers = [];
        for (const customerData of sampleCustomers) {
            const customer = new Customer(customerData);
            await customer.save();
            customers.push(customer);
        }
        console.log(`✅ Added ${customers.length} customers`);

        // Create sample jobs
        const sampleJobs = [
            {
                title: 'Fix Kitchen Sink Leak',
                description: 'Kitchen sink has been leaking for a week. Need urgent repair. Water is dripping constantly and causing wastage.',
                category: 'Plumbing',
                customerId: customers[0]._id,
                customerName: customers[0].name,
                location: 'Koramangala, Bangalore',
                coordinates: { lat: 12.9352, lng: 77.6245 },
                budget: 2500,
                biddingEnabled: true,
                minBudget: 1500,
                maxBudget: 2500,
                duration: '2-3 hours',
                status: 'open',
                priority: 'urgent',
                deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Paint Living Room and Bedroom',
                description: 'Need to paint living room and one bedroom. Approximately 600 sq ft. Looking for quality work with Asian Paints.',
                category: 'Painting',
                customerId: customers[1]._id,
                customerName: customers[1].name,
                location: 'Indiranagar, Bangalore',
                coordinates: { lat: 12.9716, lng: 77.6412 },
                budget: 8500,
                biddingEnabled: true,
                minBudget: 5000,
                maxBudget: 8500,
                duration: '2 days',
                status: 'open',
                priority: 'medium',
                deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'AC Installation and Service',
                description: 'Need to install 2 new split ACs (1.5 ton) and service existing 1 AC. Professional installation required.',
                category: 'HVAC',
                customerId: customers[2]._id,
                customerName: customers[2].name,
                location: 'Whitefield, Bangalore',
                coordinates: { lat: 12.9698, lng: 77.7500 },
                budget: 15000,
                biddingEnabled: true,
                minBudget: 10000,
                maxBudget: 15000,
                duration: '1 day',
                status: 'open',
                priority: 'high',
                deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Electrical Wiring for New Room',
                description: 'Adding a new room and need complete electrical wiring including switches, sockets, and fan points. Safety certified work needed.',
                category: 'Electrical',
                customerId: customers[0]._id,
                customerName: customers[0].name,
                location: 'HSR Layout, Bangalore',
                coordinates: { lat: 12.9121, lng: 77.6446 },
                budget: 12000,
                biddingEnabled: true,
                minBudget: 8000,
                maxBudget: 12000,
                duration: '3-4 days',
                status: 'open',
                priority: 'high',
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Wooden Furniture Repair',
                description: 'Need to repair wooden dining table, fix loose chair legs, and polish wardrobe. Quality carpentry work required.',
                category: 'Carpentry',
                customerId: customers[1]._id,
                customerName: customers[1].name,
                location: 'Jayanagar, Bangalore',
                coordinates: { lat: 12.9308, lng: 77.5838 },
                budget: 5500,
                biddingEnabled: true,
                minBudget: 3000,
                maxBudget: 5500,
                duration: '2 days',
                status: 'open',
                priority: 'low',
                deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Deep Cleaning for 3BHK Apartment',
                description: 'Need professional deep cleaning service for entire 3BHK apartment including kitchen, bathrooms, and balconies.',
                category: 'Cleaning',
                customerId: customers[2]._id,
                customerName: customers[2].name,
                location: 'Marathahalli, Bangalore',
                coordinates: { lat: 12.9591, lng: 77.6971 },
                budget: 4500,
                biddingEnabled: true,
                minBudget: 3000,
                maxBudget: 4500,
                duration: '1 day',
                status: 'open',
                priority: 'medium',
                deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Garden Landscaping and Maintenance',
                description: 'Looking for landscaping expert to redesign small garden area (200 sq ft) with plants, grass, and decorative stones.',
                category: 'Landscaping',
                customerId: customers[0]._id,
                customerName: customers[0].name,
                location: 'Sarjapur Road, Bangalore',
                coordinates: { lat: 12.9107, lng: 77.6872 },
                budget: 18000,
                biddingEnabled: true,
                minBudget: 12000,
                maxBudget: 18000,
                duration: '3-4 days',
                status: 'open',
                priority: 'low',
                deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Bathroom Waterproofing',
                description: 'Bathroom has seepage issues. Need complete waterproofing treatment with warranty. Experienced professional required.',
                category: 'Plumbing',
                customerId: customers[1]._id,
                customerName: customers[1].name,
                location: 'BTM Layout, Bangalore',
                coordinates: { lat: 12.9166, lng: 77.6101 },
                budget: 9500,
                biddingEnabled: true,
                minBudget: 6000,
                maxBudget: 9500,
                duration: '2 days',
                status: 'open',
                priority: 'urgent',
                deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Roof Leak Repair',
                description: 'Roof is leaking during rain. Need urgent repair before monsoon season. Terrace waterproofing may be needed.',
                category: 'Roofing',
                customerId: customers[2]._id,
                customerName: customers[2].name,
                location: 'Yelahanka, Bangalore',
                coordinates: { lat: 13.1007, lng: 77.5963 },
                budget: 22000,
                biddingEnabled: true,
                minBudget: 15000,
                maxBudget: 22000,
                duration: '4-5 days',
                status: 'open',
                priority: 'urgent',
                deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            },
            {
                title: 'Modular Kitchen Installation',
                description: 'Need expert carpenter for modular kitchen installation. Materials already purchased, only installation and finishing work needed.',
                category: 'Carpentry',
                customerId: customers[0]._id,
                customerName: customers[0].name,
                location: 'Electronic City, Bangalore',
                coordinates: { lat: 12.8399, lng: 77.6770 },
                budget: 25000,
                biddingEnabled: true,
                minBudget: 18000,
                maxBudget: 25000,
                duration: '5-6 days',
                status: 'open',
                priority: 'medium',
                deadline: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000)
            }
        ];

        const jobs = await Job.insertMany(sampleJobs);
        console.log(`✅ Added ${jobs.length} jobs`);

        // Create sample bids
        console.log('\n📝 Creating sample bids...');
        const sampleBids = [
            {
                jobId: jobs[0]._id,
                workerId: workers[0]._id,
                workerName: workers[0].name,
                workerEmail: workers[0].email,
                workerPhone: workers[0].phone,
                workerExperience: workers[0].experience,
                workerRating: workers[0].rating,
                bidAmount: 2200,
                estimatedDuration: '1 day',
                coverLetter: 'I have 5 years of experience in plumbing and can fix your kitchen sink efficiently. I have all the necessary tools and can start immediately.',
                availability: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                additionalNotes: 'I can provide a warranty for my work.',
                status: 'pending'
            },
            {
                jobId: jobs[0]._id,
                workerId: workers[1]._id,
                workerName: workers[1].name,
                workerEmail: workers[1].email,
                workerPhone: workers[1].phone,
                workerExperience: workers[1].experience,
                workerRating: workers[1].rating,
                bidAmount: 1800,
                estimatedDuration: '3-5 hours',
                coverLetter: 'I specialize in plumbing repairs and have fixed hundreds of kitchen sinks. I offer competitive pricing and quality work.',
                availability: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                additionalNotes: 'Free inspection included.',
                status: 'pending'
            },
            {
                jobId: jobs[0]._id,
                workerId: workers[2]._id,
                workerName: workers[2].name,
                workerEmail: workers[2].email,
                workerPhone: workers[2].phone,
                workerExperience: workers[2].experience,
                workerRating: workers[2].rating,
                bidAmount: 2500,
                estimatedDuration: '1 day',
                coverLetter: 'With 10 years of experience, I guarantee professional service. I use high-quality materials and provide excellent customer service.',
                availability: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                additionalNotes: 'Premium service with 1-year warranty.',
                status: 'pending'
            },
            {
                jobId: jobs[1]._id,
                workerId: workers[3]._id,
                workerName: workers[3].name,
                workerEmail: workers[3].email,
                workerPhone: workers[3].phone,
                workerExperience: workers[3].experience,
                workerRating: workers[3].rating,
                bidAmount: 4500,
                estimatedDuration: '2-3 days',
                coverLetter: 'I am an experienced electrician with expertise in home wiring. I follow all safety standards and provide clean, professional work.',
                availability: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                additionalNotes: 'Licensed and insured.',
                status: 'pending'
            },
            {
                jobId: jobs[1]._id,
                workerId: workers[0]._id,
                workerName: workers[0].name,
                workerEmail: workers[0].email,
                workerPhone: workers[0].phone,
                workerExperience: workers[0].experience,
                workerRating: workers[0].rating,
                bidAmount: 4000,
                estimatedDuration: '2-3 days',
                coverLetter: 'Certified electrician with 7 years of experience. I specialize in residential wiring and can complete your project efficiently.',
                availability: new Date(Date.now() + 172800000).toISOString().split('T')[0],
                additionalNotes: 'All materials included in the price.',
                status: 'pending'
            }
        ];

        const bids = await Bid.insertMany(sampleBids);
        console.log(`✅ Added ${bids.length} bids`);

        // Accept the first bid (Rajesh Kumar on 'Fix Kitchen Sink Leak') so Navigate is testable
        bids[0].status = 'accepted';
        await bids[0].save();

        // Assign that job to the worker
        jobs[0].workerId = workers[0]._id;
        jobs[0].workerName = workers[0].name;
        jobs[0].status = 'assigned';
        jobs[0].acceptedBidId = bids[0]._id;
        jobs[0].finalPrice = bids[0].bidAmount;
        await jobs[0].save();

        // Reject the other bids on that job
        bids[1].status = 'rejected';
        await bids[1].save();
        bids[2].status = 'rejected';
        await bids[2].save();
        console.log('✅ Accepted bid for "Fix Kitchen Sink Leak" (Rajesh Kumar) — Navigate testable!');

        // Update job totalBids count
        for (const job of jobs) {
            const bidCount = sampleBids.filter(bid => bid.jobId.equals(job._id)).length;
            if (bidCount > 0) {
                job.totalBids = bidCount;
                await job.save();
            }
        }
        console.log('✅ Updated job bid counts');

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📊 Summary:');
        console.log(`   Workers: ${workers.length}`);
        console.log(`   Customers: ${customers.length}`);
        console.log(`   Jobs: ${jobs.length}`);
        console.log(`   Bids: ${bids.length}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

seedDatabase();

