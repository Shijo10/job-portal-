const mongoose = require('mongoose');
const Worker = require('./models/Worker');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/job_portal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const sampleWorkers = [
  // Plumbers
  {
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    phone: "+91 98450 12001",
    skills: ["Plumbing", "Pipe Fitting", "Drain Cleaning"],
    experience: 8,
    location: "Bangalore, Karnataka",
    hourlyRate: 350,
    availability: "available",
    rating: 4.8,
    completedJobs: 156,
    verified: true
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    phone: "+91 98450 12002",
    skills: ["Plumbing", "Water Heater Installation", "Leak Repair"],
    experience: 6,
    location: "Bangalore, Karnataka",
    hourlyRate: 320,
    availability: "available",
    rating: 4.9,
    completedJobs: 132,
    verified: true
  },

  // Electricians
  {
    name: "Amit Patel",
    email: "amit.patel@example.com",
    phone: "+91 98450 12003",
    skills: ["Electrical", "Wiring", "Circuit Installation"],
    experience: 10,
    location: "Bangalore, Karnataka",
    hourlyRate: 400,
    availability: "available",
    rating: 4.9,
    completedJobs: 203,
    verified: true
  },
  {
    name: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    phone: "+91 98450 12004",
    skills: ["Electrical", "Panel Upgrades", "Lighting Installation"],
    experience: 7,
    location: "Hyderabad, Telangana",
    hourlyRate: 340,
    availability: "busy",
    rating: 4.7,
    completedJobs: 145,
    verified: true
  },

  // Carpenters
  {
    name: "Suresh Nair",
    email: "suresh.nair@example.com",
    phone: "+91 98450 12005",
    skills: ["Carpentry", "Furniture Making", "Cabinet Installation"],
    experience: 12,
    location: "Bangalore, Karnataka",
    hourlyRate: 380,
    availability: "available",
    rating: 4.9,
    completedJobs: 187,
    verified: true
  },
  {
    name: "Kavita Singh",
    email: "kavita.singh@example.com",
    phone: "+91 98450 12006",
    skills: ["Carpentry", "Deck Building", "Framing"],
    experience: 5,
    location: "Mumbai, Maharashtra",
    hourlyRate: 300,
    availability: "available",
    rating: 4.6,
    completedJobs: 98,
    verified: true
  },

  // Painters
  {
    name: "Vikram Rao",
    email: "vikram.rao@example.com",
    phone: "+91 98450 12007",
    skills: ["Painting", "Interior Design", "Wall Texturing"],
    experience: 9,
    location: "Bangalore, Karnataka",
    hourlyRate: 280,
    availability: "available",
    rating: 4.8,
    completedJobs: 176,
    verified: true
  },
  {
    name: "Anjali Gupta",
    email: "anjali.gupta@example.com",
    phone: "+91 98450 12008",
    skills: ["Painting", "Exterior Painting", "Spray Painting"],
    experience: 4,
    location: "Pune, Maharashtra",
    hourlyRate: 250,
    availability: "available",
    rating: 4.5,
    completedJobs: 87,
    verified: true
  },

  // Cleaners
  {
    name: "Lakshmi Iyer",
    email: "lakshmi.iyer@example.com",
    phone: "+91 98450 12009",
    skills: ["Cleaning", "Deep Cleaning", "Office Cleaning"],
    experience: 6,
    location: "Bangalore, Karnataka",
    hourlyRate: 220,
    availability: "available",
    rating: 4.9,
    completedJobs: 234,
    verified: true
  },
  {
    name: "Ramesh Verma",
    email: "ramesh.verma@example.com",
    phone: "+91 98450 12010",
    skills: ["Cleaning", "Carpet Cleaning", "Window Washing"],
    experience: 3,
    location: "Chennai, Tamil Nadu",
    hourlyRate: 200,
    availability: "available",
    rating: 4.7,
    completedJobs: 112,
    verified: true
  },

  // Landscapers
  {
    name: "Arjun Menon",
    email: "arjun.menon@example.com",
    phone: "+91 98450 12011",
    skills: ["Landscaping", "Garden Design", "Tree Trimming"],
    experience: 11,
    location: "Bangalore, Karnataka",
    hourlyRate: 320,
    availability: "available",
    rating: 4.8,
    completedJobs: 165,
    verified: true
  },
  {
    name: "Deepa Krishnan",
    email: "deepa.krishnan@example.com",
    phone: "+91 98450 12012",
    skills: ["Landscaping", "Lawn Care", "Irrigation Systems"],
    experience: 5,
    location: "Kochi, Kerala",
    hourlyRate: 280,
    availability: "busy",
    rating: 4.6,
    completedJobs: 93,
    verified: true
  },

  // HVAC Technicians
  {
    name: "Karthik Bhat",
    email: "karthik.bhat@example.com",
    phone: "+91 98450 12013",
    skills: ["HVAC", "Air Conditioning", "Heating Systems"],
    experience: 13,
    location: "Bangalore, Karnataka",
    hourlyRate: 440,
    availability: "available",
    rating: 4.9,
    completedJobs: 198,
    verified: true
  },
  {
    name: "Meera Joshi",
    email: "meera.joshi@example.com",
    phone: "+91 98450 12014",
    skills: ["HVAC", "Duct Cleaning", "Thermostat Installation"],
    experience: 7,
    location: "Delhi, NCR",
    hourlyRate: 360,
    availability: "available",
    rating: 4.7,
    completedJobs: 134,
    verified: true
  },

  // Roofers
  {
    name: "Manoj Desai",
    email: "manoj.desai@example.com",
    phone: "+91 98450 12015",
    skills: ["Roofing", "Roof Repair", "Shingle Installation"],
    experience: 15,
    location: "Bangalore, Karnataka",
    hourlyRate: 420,
    availability: "available",
    rating: 4.9,
    completedJobs: 211,
    verified: true
  },
  {
    name: "Pooja Agarwal",
    email: "pooja.agarwal@example.com",
    phone: "+91 98450 12016",
    skills: ["Roofing", "Gutter Installation", "Roof Inspection"],
    experience: 8,
    location: "Jaipur, Rajasthan",
    hourlyRate: 370,
    availability: "available",
    rating: 4.8,
    completedJobs: 156,
    verified: true
  },

  // Multi-skilled workers
  {
    name: "Sanjay Pillai",
    email: "sanjay.pillai@example.com",
    phone: "+91 98450 12017",
    skills: ["Plumbing", "Electrical", "General Handyman"],
    experience: 14,
    location: "Bangalore, Karnataka",
    hourlyRate: 380,
    availability: "available",
    rating: 4.9,
    completedJobs: 223,
    verified: true
  },
  {
    name: "Divya Malhotra",
    email: "divya.malhotra@example.com",
    phone: "+91 98450 12018",
    skills: ["Carpentry", "Painting", "Drywall"],
    experience: 6,
    location: "Bangalore, Karnataka",
    hourlyRate: 300,
    availability: "available",
    rating: 4.7,
    completedJobs: 118,
    verified: true
  },
  {
    name: "Ravi Shankar",
    email: "ravi.shankar@example.com",
    phone: "+91 98450 12019",
    skills: ["Landscaping", "Cleaning", "Pressure Washing"],
    experience: 4,
    location: "Mysore, Karnataka",
    hourlyRate: 260,
    availability: "available",
    rating: 4.6,
    completedJobs: 89,
    verified: true
  },
  {
    name: "Nisha Kapoor",
    email: "nisha.kapoor@example.com",
    phone: "+91 98450 12020",
    skills: ["Cleaning", "Organizing", "Moving Services"],
    experience: 5,
    location: "Bangalore, Karnataka",
    hourlyRate: 240,
    availability: "busy",
    rating: 4.8,
    completedJobs: 142,
    verified: true
  }
];

// Seed function
async function seedWorkers() {
  try {
    console.log('🌱 Starting to seed workers...');

    // Clear existing workers
    await Worker.deleteMany({});
    console.log('✅ Cleared existing workers');

    // Insert sample workers
    const result = await Worker.insertMany(sampleWorkers);
    console.log(`✅ Successfully added ${result.length} workers to the database!`);

    console.log('\n📊 Workers by category:');
    const categories = {};
    sampleWorkers.forEach(worker => {
      worker.skills.forEach(skill => {
        categories[skill] = (categories[skill] || 0) + 1;
      });
    });

    Object.entries(categories).forEach(([skill, count]) => {
      console.log(`   ${skill}: ${count} workers`);
    });

    console.log('\n🎉 Database seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedWorkers();

