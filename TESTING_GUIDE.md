# JobConnect - Testing Guide

## 🎉 New Features Added

### 1. Real-Time Chat with Socket.IO
- Live messaging between customers and workers
- Typing indicators
- Online/offline status
- Instant message delivery

### 2. AI Assistant Chatbot
- Available on all pages
- Helps users with common questions
- Provides instant solutions
- 24/7 availability

---

## 🧪 How to Test

### Test AI Assistant (On Any Page)

1. **Open any page** (Home, Browse Workers, Browse Jobs, Chat, Payment)
2. **Look for the purple robot button** in the bottom-right corner
3. **Click the AI Assistant button**
4. **Try these questions:**
   - "How to post a job?"
   - "How to find workers?"
   - "Payment methods"
   - "Is it safe?"
   - "How to hire a worker?"
   - "Chat not working"
   - "Contact support"

5. **Use quick suggestion buttons** for common questions
6. **Type your own questions** and press Enter

**Expected Result:**
- AI responds instantly with helpful answers
- Typing indicator shows while AI is "thinking"
- Responses are formatted with bullet points and paragraphs
- Suggestions disappear after first message

---

### Test Real-Time Chat

#### Setup (Open Two Browser Windows):

**Window 1 - Customer:**
1. Go to `http://localhost:3000/browse-workers`
2. Click on any worker
3. Click "Contact Worker"
4. You'll see the chat page

**Window 2 - Worker (Simulated):**
1. Open the same chat URL in a new browser window
2. Or open developer console and simulate worker connection

#### Test Messages:
1. **Type a message in Window 1** and press Enter
2. **Message appears in both windows instantly**
3. **Type in Window 2** - appears in Window 1
4. **Watch for typing indicator** when someone is typing
5. **Close one window** - other window shows "user left"

**Expected Result:**
- Messages appear in real-time in both windows
- Typing indicator shows "typing..."
- Online/offline status updates
- Messages are color-coded (sent = green, received = white)

---

### Test Complete Hire Flow with AI Assistant

1. **Start on Home Page**
   - Click AI Assistant button
   - Ask: "How to hire a worker?"
   - AI explains the process

2. **Browse Workers**
   - Go to Browse Workers
   - AI Assistant is still available
   - Ask: "How do I know if a worker is verified?"

3. **Worker Profile**
   - Click on a worker
   - Click "Contact Worker"
   - AI Assistant available in chat
   - Ask: "What should I discuss with the worker?"

4. **Real-Time Chat**
   - Send messages to worker
   - See typing indicator
   - Get instant responses

5. **Payment Page**
   - Click "Hire Now" from chat or worker profile
   - AI Assistant available
   - Ask: "What payment methods do you accept?"
   - Fill in job details
   - Complete payment
   - Download PDF receipt

---

## 🤖 AI Assistant Knowledge Base

The AI can help with:

### General Questions
- What is JobConnect?
- How does it work?
- Is it free?

### For Customers
- How to post a job
- How to find workers
- How to hire a worker
- How to chat with worker
- Payment methods
- How to track my jobs

### For Workers
- How to find jobs
- How to apply for job
- How to get paid
- How to create profile

### Technical Issues
- Page not loading
- Cannot login
- Chat not working
- Payment failed
- Cannot upload photo

### Account Issues
- Forgot password
- Change password
- Delete account
- Update profile

### Safety & Security
- Is it safe?
- Verified workers
- Refund policy

### Support
- Contact support
- Report issue
- Business hours

---

## 📊 Expected Behavior

### AI Assistant
✅ Purple robot button visible on all pages
✅ Smooth slide-up animation when opened
✅ Typing indicator while processing
✅ Formatted responses with bullet points
✅ Quick suggestion buttons
✅ Scrollable message history
✅ Close button works
✅ Can minimize and reopen

### Real-Time Chat
✅ Instant message delivery
✅ Typing indicator appears/disappears
✅ Online/offline status updates
✅ Messages persist in chat window
✅ Timestamps on all messages
✅ Auto-scroll to latest message
✅ Enter key sends message
✅ Quick action buttons work

---

## 🐛 Troubleshooting

### AI Assistant Not Appearing
- Refresh the page (F5)
- Check browser console for errors
- Make sure server is running

### Chat Not Working
- Check if Socket.IO is connected (console logs)
- Make sure both users are in the same chat room
- Refresh both browser windows

### Server Issues
- Restart server: `npm start` in backend folder
- Check MongoDB is running
- Check port 3000 is not in use

---

## 🎯 Success Criteria

✅ AI Assistant appears on all pages
✅ AI responds to all predefined questions
✅ AI provides helpful default responses for unknown questions
✅ Real-time chat works between two browser windows
✅ Typing indicators work correctly
✅ Messages are delivered instantly
✅ Online/offline status updates
✅ Both features work together seamlessly

---

**Enjoy testing! 🚀**

