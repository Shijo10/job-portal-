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

// Setup Socket.IO listeners
function setupSocket() {
    // Receive message
    socket.on('receive-message', (data) => {
        const type = data.sender === currentUserId ? 'sent' : 'received';
        const senderName = data.sender === currentUserId ? 'You' : data.senderName;
        addMessage(type, data.message, senderName);
    });
    
    // User joined
    socket.on('user-joined', (data) => {
        addMessage('system', `${data.userName} joined the chat`, 'System');
    });
    
    // User left
    socket.on('user-left', (data) => {
        addMessage('system', `${data.userName} left the chat`, 'System');
        document.getElementById('online-status').textContent = 'Offline';
        document.getElementById('online-status').style.color = '#9ca3af';
    });
    
    // Typing indicator
    socket.on('user-typing', (data) => {
        document.getElementById('online-status').textContent = 'typing...';
    });
    
    socket.on('user-stop-typing', () => {
        document.getElementById('online-status').textContent = 'Online';
    });
}

// Send message
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const messageText = messageInput.value.trim();
    
    if (!messageText) return;
    
    // Send via Socket.IO
    socket.emit('send-message', {
        chatRoomId,
        message: messageText,
        sender: currentUserId,
        senderName: currentUserName,
        senderType: currentUserType
    });
    
    // Clear input
    messageInput.value = '';
    socket.emit('stop-typing', { chatRoomId });
}

// Add message to chat
function addMessage(type, text, senderName = 'You') {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    
    if (type === 'system') {
        messageDiv.className = 'system-message';
        messageDiv.innerHTML = `<p>${text}</p>`;
    } else {
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
        `;
    }
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Send quick message
function sendQuickMessage(message) {
    document.getElementById('message-input').value = message;
    sendMessage();
}

