const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/job_portal';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
const workersRouter = require('./routes/workers');
const customersRouter = require('./routes/customers');
const jobsRouter = require('./routes/jobs');
const bidsRouter = require('./routes/bids');
const authRouter = require('./routes/auth');

app.use('/api/workers', workersRouter);
app.use('/api/customers', customersRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/bids', bidsRouter);
app.use('/api/auth', authRouter);

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const Worker = require('./models/Worker');
    const Customer = require('./models/Customer');
    const Job = require('./models/Job');

    const [workers, customers, jobs] = await Promise.all([
      Worker.countDocuments(),
      Customer.countDocuments(),
      Job.countDocuments()
    ]);

    const [openJobs, completedJobs, availableWorkers] = await Promise.all([
      Job.countDocuments({ status: 'open' }),
      Job.countDocuments({ status: 'completed' }),
      Worker.countDocuments({ availability: 'available' })
    ]);

    res.json({
      totalWorkers: workers,
      totalCustomers: customers,
      totalJobs: jobs,
      openJobs,
      completedJobs,
      availableWorkers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// ============================================
// PUBLIC ROUTES (for workers and customers)
// ============================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/home.html'));
});

app.get('/register/worker', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/register-worker.html'));
});

app.get('/register/customer', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/register-customer.html'));
});

app.get('/browse-workers', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/browse-workers.html'));
});

app.get('/browse-jobs', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/browse-jobs.html'));
});

app.get('/worker-profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/worker-profile.html'));
});

app.get('/customer-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/customer-login.html'));
});

app.get('/worker-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/worker-login.html'));
});

app.get('/worker-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/worker-dashboard.html'));
});

app.get('/track-worker', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/track-worker.html'));
});

app.get('/post-job', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/post-job.html'));
});

app.get('/my-jobs', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/my-jobs.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/chat.html'));
});

app.get('/payment', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/payment.html'));
});

app.get('/apply-job', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/apply-job.html'));
});

app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/forgot-password.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/reset-password.html'));
});

// ============================================
// ADMIN ROUTES (protected)
// ============================================
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin-login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// Serve static files from frontend directory (after specific routes)
app.use(express.static(path.join(__dirname, '../frontend')));

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/home.html'));
});

// ============================================
// SOCKET.IO - REAL-TIME CHAT
// ============================================

// Store active users
const activeUsers = new Map();

io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // User joins chat
  socket.on('join-chat', ({ userId, userName, userType, chatRoomId }) => {
    socket.join(chatRoomId);
    activeUsers.set(socket.id, { userId, userName, userType, chatRoomId });

    // Notify others in the room
    socket.to(chatRoomId).emit('user-joined', { userName, userType });
    console.log(`✅ ${userName} (${userType}) joined room: ${chatRoomId}`);
  });

  // Send message
  socket.on('send-message', ({ chatRoomId, message, sender, senderName, senderType }) => {
    const messageData = {
      message,
      sender,
      senderName,
      senderType,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all users in the chat room
    io.to(chatRoomId).emit('receive-message', messageData);
    console.log(`💬 Message in ${chatRoomId}: ${message}`);
  });

  // Typing indicator
  socket.on('typing', ({ chatRoomId, userName }) => {
    socket.to(chatRoomId).emit('user-typing', { userName });
  });

  socket.on('stop-typing', ({ chatRoomId }) => {
    socket.to(chatRoomId).emit('user-stop-typing');
  });

  // User disconnects
  socket.on('disconnect', () => {
    const user = activeUsers.get(socket.id);
    if (user) {
      socket.to(user.chatRoomId).emit('user-left', { userName: user.userName });
      activeUsers.delete(socket.id);
      console.log(`👋 ${user.userName} disconnected`);
    }
  });
});

// ============================================
// AI ASSISTANT API
// ============================================

// AI Assistant knowledge base
const aiKnowledgeBase = {
  // General questions
  'what is jobconnect': 'JobConnect is a platform that connects customers with skilled workers for various services like plumbing, electrical work, carpentry, cleaning, and more. We help you find verified professionals in your area.',
  'how does it work': 'It\'s simple! Customers can post jobs or browse workers, while workers can browse available jobs. You can chat with workers/customers, hire them, and make secure payments through our platform.',
  'is it free': 'Browsing and posting jobs is free! We charge a small 5% platform fee only when you hire a worker and make a payment.',

  // For Customers
  'how to post a job': 'Click on "Post a Job" button, fill in the job details (title, description, category, location, budget, etc.), and submit. Workers will be able to see and apply for your job.',
  'how to find workers': 'Go to "Browse Workers" page, use filters to find workers by category, location, rating, and hourly rate. Click on a worker to view their profile and hire them.',
  'how to hire a worker': 'On a worker\'s profile page, click "Hire Now" button. Fill in the job details and payment information. After payment, you\'ll receive a PDF receipt.',
  'how to chat with worker': 'On a worker\'s profile page, click "Contact Worker" button. This opens a real-time chat where you can discuss job details.',
  'payment methods': 'We accept UPI, Credit/Debit Cards, Net Banking, and Digital Wallets. All payments are secure and encrypted.',
  'how to track my jobs': 'Go to "My Jobs" page to see all your posted jobs, their status, and manage them.',

  // For Workers
  'how to find jobs': 'Go to "Browse Jobs" page to see all available jobs. Use filters to find jobs by category, location, budget, and priority.',
  'how to apply for job': 'Click "Apply Now" on any job listing. You can then contact the customer to discuss details.',
  'how to get paid': 'When a customer hires you and makes payment, the amount is processed through our secure payment system. You\'ll receive payment after job completion.',
  'how to create profile': 'Click "Register as Worker", fill in your details including skills, experience, hourly rate, and upload your photo.',

  // Technical issues
  'page not loading': 'Try refreshing the page (F5). If the issue persists, clear your browser cache or try a different browser. Make sure you\'re connected to the internet.',
  'cannot login': 'Make sure you\'re using the correct email and password. If you forgot your password, use the "Forgot Password" option. If you\'re a new user, please register first.',
  'chat not working': 'Make sure you\'re connected to the internet. Try refreshing the page. If the issue persists, the other user might be offline.',
  'payment failed': 'Check your internet connection and payment details. Make sure you have sufficient balance. If the issue persists, try a different payment method or contact support.',
  'cannot upload photo': 'Make sure the image is in JPG, PNG, or JPEG format and less than 5MB in size. Try using a different image.',

  // Account issues
  'forgot password': 'Click on "Forgot Password" link on the login page. Enter your registered email and follow the instructions sent to your email.',
  'change password': 'Go to your profile settings and click "Change Password". Enter your current password and new password.',
  'delete account': 'Contact our support team at support@jobconnect.com to request account deletion.',
  'update profile': 'Go to your profile page and click "Edit Profile". Update your information and click "Save Changes".',

  // Safety and security
  'is it safe': 'Yes! All workers are verified, payments are secure and encrypted, and we have a rating system to ensure quality. We also offer money-back guarantee.',
  'verified workers': 'All workers go through a verification process including ID verification, skill assessment, and background checks.',
  'refund policy': 'If you\'re not satisfied with the work, you can request a refund within 7 days. Our team will review and process valid refund requests.',

  // Contact and support
  'contact support': 'You can reach our support team at support@jobconnect.com or call +91 1800-123-4567 (24/7 available).',
  'report issue': 'Click on "Report Issue" button or email us at support@jobconnect.com with details of the problem.',
  'business hours': 'Our platform is available 24/7! Customer support is available Monday to Sunday, 9 AM to 9 PM IST.'
};

const { GoogleGenAI } = require('@google/genai');

let ai;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log('✅ Google Gen AI client initialized');
  } catch (error) {
    console.warn('⚠️ Failed to initialize Google Gen AI. Falling back to static replies.', error);
  }
}

app.post('/api/ai-assistant', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const userMessage = message.toLowerCase().trim();

  // If Gemini AI is configured, try using it
  if (ai) {
    try {
      // Build systemic context from aiKnowledgeBase
      const knowledgeContext = Object.entries(aiKnowledgeBase)
        .map(([q, ans]) => `Q: ${q}\nA: ${ans}`)
        .join('\n\n');
        
      const systemInstruction = `You are the JobConnect AI Assistant. JobConnect is a platform connecting customers with skilled workers. 
Use the following knowledge base to answer user questions accurately. Keep responses concise, friendly, and formatted appropriately with bullet points if listing things. Don't make up information not provided in the knowledge base or general common sense about job portals.
Knowledge Base:\n${knowledgeContext}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: message,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.2
        }
      });
      
      return res.json({
        response: response.text,
        matchedKey: 'gemini_ai',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Gemini API Error, falling back to static response:', error.message);
    }
  }

  // Find matching response (Static Fallback)
  let response = null;
  let matchedKey = null;

  // Check for exact or partial matches
  for (const [key, value] of Object.entries(aiKnowledgeBase)) {
    if (userMessage.includes(key) || key.includes(userMessage)) {
      response = value;
      matchedKey = key;
      break;
    }
  }

  // If no match found, provide default response
  if (!response) {
    // Check for greetings
    if (userMessage.match(/^(hi|hello|hey|good morning|good afternoon|good evening)/)) {
      response = 'Hello! 👋 I\'m your JobConnect AI Assistant. I\'m here to help you with any questions about our platform. You can ask me about:\n\n• How to post jobs or find workers\n• Payment methods and pricing\n• Account and profile management\n• Technical issues\n• Safety and security\n\nWhat would you like to know?';
    }
    // Check for thanks
    else if (userMessage.match(/(thank|thanks|appreciate)/)) {
      response = 'You\'re welcome! 😊 If you have any other questions, feel free to ask. I\'m here to help!';
    }
    // Default response
    else {
      response = 'I\'m not sure about that, but I can help you with:\n\n• Posting jobs and finding workers\n• Hiring process and payments\n• Chat and communication\n• Account management\n• Technical support\n\nCould you please rephrase your question or ask about one of these topics?';
    }
  }

  res.json({
    response,
    matchedKey: matchedKey || 'fallback',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`💬 Socket.IO enabled for real-time chat`);
  console.log(`🤖 AI Assistant ready`);
  console.log(`\n📱 PUBLIC APP (Workers & Customers):`);
  console.log(`   🏠 Landing Page: http://localhost:${PORT}/`);
  console.log(`\n🔐 ADMIN ACCESS (Admins Only):`);
  console.log(`   🔑 Login: http://localhost:${PORT}/admin/login`);
  console.log(`   📊 Panel: http://localhost:${PORT}/admin`);
});

