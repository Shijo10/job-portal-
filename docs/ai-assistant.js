// AI Assistant functionality
document.addEventListener('DOMContentLoaded', () => {
    const assistantBtn = document.getElementById('ai-assistant-btn');
    const assistantWindow = document.getElementById('ai-assistant-window');
    const closeBtn = document.getElementById('ai-close-btn');
    const sendBtn = document.getElementById('ai-send-btn');
    const input = document.getElementById('ai-input');
    const messagesContainer = document.getElementById('ai-messages');
    const typingIndicator = document.getElementById('ai-typing');

    // Toggle chat window
    assistantBtn.addEventListener('click', () => {
        assistantWindow.classList.toggle('show');
        if (assistantWindow.classList.contains('show')) {
            input.focus();
        }
    });

    // Close chat window
    closeBtn.addEventListener('click', () => {
        assistantWindow.classList.remove('show');
    });

    // Send message on button click
    sendBtn.addEventListener('click', () => {
        sendAIMessage();
    });

    // Send message on Enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendAIMessage();
        }
    });
});

// Send message to AI
async function sendAIMessage(predefinedMessage = null) {
    const input = document.getElementById('ai-input');
    const message = predefinedMessage || input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addAIMessage(message, 'user');
    
    // Clear input
    if (!predefinedMessage) {
        input.value = '';
    }
    
    // Show typing indicator
    const typingIndicator = document.getElementById('ai-typing');
    typingIndicator.style.display = 'flex';
    
    // Hide suggestions after first message
    const suggestions = document.getElementById('ai-suggestions');
    if (suggestions) {
        suggestions.style.display = 'none';
    }
    
    try {
        // Call AI API
        const response = await fetch('/api/ai-assistant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        // Simulate typing delay
        setTimeout(() => {
            typingIndicator.style.display = 'none';
            addAIMessage(data.response, 'bot');
        }, 1000);
        
    } catch (error) {
        console.error('AI Assistant error:', error);
        typingIndicator.style.display = 'none';
        addAIMessage('Sorry, I encountered an error. Please try again or contact support at support@jobconnect.com', 'bot');
    }
}

// Add message to chat
function addAIMessage(text, type) {
    const messagesContainer = document.getElementById('ai-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `ai-message ai-${type}`;
    
    const avatar = document.createElement('div');
    avatar.className = 'ai-avatar';
    avatar.innerHTML = type === 'bot' ? '<i class="fas fa-robot"></i>' : '<i class="fas fa-user"></i>';
    
    const content = document.createElement('div');
    content.className = 'ai-message-content';
    
    // Format text with line breaks and lists
    const formattedText = text
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n•/g, '<li>')
        .replace(/\n/g, '<br>');
    
    // Check if text contains bullet points
    if (text.includes('•') || text.includes('\n-')) {
        const parts = text.split('\n\n');
        let html = '';
        
        parts.forEach(part => {
            if (part.includes('•') || part.includes('-')) {
                const lines = part.split('\n');
                const intro = lines[0];
                const items = lines.slice(1).filter(l => l.trim());
                
                html += `<p>${intro}</p><ul>`;
                items.forEach(item => {
                    const cleaned = item.replace(/^[•\-]\s*/, '');
                    if (cleaned) html += `<li>${cleaned}</li>`;
                });
                html += '</ul>';
            } else {
                html += `<p>${part}</p>`;
            }
        });
        
        content.innerHTML = html;
    } else {
        content.innerHTML = `<p>${formattedText}</p>`;
    }
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Make sendAIMessage available globally for suggestion buttons
window.sendAIMessage = sendAIMessage;

