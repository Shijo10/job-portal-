// Get worker info from URL
const urlParams = new URLSearchParams(window.location.search);
const workerId = urlParams.get('workerId');
const workerName = urlParams.get('workerName');

if (!workerId || !workerName) {
    window.location.href = '/browse-workers';
}

// Get current user info
const currentUserId = sessionStorage.getItem('customerId') || 'guest-' + Date.now();
const currentUserName = sessionStorage.getItem('customerName') || 'Customer';
const currentUserType = 'customer';

// Create unique chat room ID
const chatRoomId = [currentUserId, workerId].sort().join('-');

// Initialize Socket.IO
const socket = io();
let typingTimeout;

// Display worker info
document.addEventListener('DOMContentLoaded', () => {
    const initials = workerName.split(' ').map(n => n[0]).join('').toUpperCase();
    document.getElementById('worker-avatar').textContent = initials;
    document.getElementById('worker-name').textContent = workerName;
    document.getElementById('worker-name-msg').textContent = workerName;

    // Setup event listeners
    setupEventListeners();

    // Setup Socket.IO
    setupSocket();

    // Join chat room
    socket.emit('join-chat', {
        userId: currentUserId,
        userName: currentUserName,
        userType: currentUserType,
        chatRoomId
    });

    // Add welcome message
    addMessage('system', `Connected to chat with ${workerName}. Start your conversation!`, 'System');
});

// Setup event listeners
function setupEventListeners() {
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');

    // Send message on button click
    sendBtn.addEventListener('click', sendMessage);

    // Send message on Enter key
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Typing indicator
    messageInput.addEventListener('input', () => {
        socket.emit('typing', { chatRoomId, userName: currentUserName });

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('stop-typing', { chatRoomId });
        }, 1000);
    });
}

// Send message
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();
    
    if (!messageText) return;
    
    // Add message to chat
    addMessage(messageText, 'sent');
    
    // Clear input
    messageInput.value = '';
    
    // Simulate worker response after 2 seconds
    setTimeout(() => {
        const responses = [
            "Thank you for your message! I'll get back to you shortly.",
            "I'm available for the job. Let's discuss the details.",
            "Sure, I can help you with that. When would you like me to start?",
            "I have experience with similar projects. I'd be happy to work with you.",
            "Let me check my schedule and get back to you."
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        addMessage(randomResponse, 'received');
    }, 2000);
}

// Add message to chat
function addMessage(text, type) {
    const chatMessages = document.getElementById('chat-messages');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <div class="message-content">
            <div class="message-text">${text}</div>
            <div class="message-time">${timeString}</div>
        </div>
    `;
    
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send quick message
function sendQuickMessage(message) {
    document.getElementById('message-input').value = message;
    sendMessage();
}

// Load chat history (simulated)
function loadChatHistory() {
    // Simulate some previous messages
    const history = [
        { text: "Hello! I saw your profile and I'm interested in your services.", type: 'sent', time: '10:30 AM' },
        { text: "Hi! Thank you for reaching out. I'd be happy to help. What kind of work do you need?", type: 'received', time: '10:32 AM' }
    ];
    
    // Uncomment to show history
    // history.forEach(msg => {
    //     addMessage(msg.text, msg.type);
    // });
}

