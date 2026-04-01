# Comprehensive Hosting Workflow

This guide details the step-by-step action plan to take your Job Portal application from your local machine to the internet. 

Your application is a monolithic stack containing:
- **Frontend**: Vanilla HTML/JS/CSS
- **Backend**: Node.js / Express
- **Database**: MongoDB
- **AI Integration**: Google Gemini API

Because your backend serves the frontend natively, the simplest and most robust approach is to deploy the entire unified application to a Node.js cloud provider, and move your local database to MongoDB Atlas.

## Recommended Hosting Providers
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available, industry standard for NoSQL)
- **Application/Server**: [Render](https://render.com/) or [Railway](https://railway.app/) (Both offer free/cheap tiers for Node.js apps, automatic GitHub deployments, and are much easier than configuring dedicated servers like AWS EC2).

---

## Action Plan Workflow

### Step 1: Prepare the Codebase (Relative API Routes)
Currently, your frontend relies on `http://localhost:5000/api`. This will break in production. 
**Good News:** I have just proactively updated your codebase to use relative paths (e.g., `/api`). This means your app will dynamically recognize its environment—calling `localhost` when you test locally, and automatically calling `your-app.onrender.com` when hosted!

### Step 2: Push Your Code to GitHub
Cloud hosting platforms continuously pull and deploy your code directly from a code repository.
1. Create a free account on [GitHub](https://github.com/).
2. Create a new, empty repository (e.g., `job-portal`).
3. Open your terminal in your local `d:\project` directory and run:
   ```bash
   git add .
   git commit -m "Initial commit for production"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/job-portal.git
   git push -u origin main
   ```

### Step 3: Set Up MongoDB Atlas (Cloud Database)
Your local database (`mongodb://localhost:27017/job-portal`) won't work on the internet.
1. Go to **MongoDB Atlas** and create a free account.
2. Create a new **Free (M0) Cluster**.
3. Under **Database Access**, create a new database user and save the password.
4. Under **Network Access**, add `0.0.0.0/0` to allow connections from anywhere (required for Render/Railway dynamic server IPs).
5. Click **Connect** on your cluster, choose **Connect your application**, and copy the connection string. It will look like this:
   `mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/job-portal?retryWrites=true&w=majority`

### Step 4: Deploy the Server (via Render.com)
1. Go to **Render.com** and sign in with your GitHub account.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository (`job-portal`).
4. **Configuration Settings**:
   - **Name**: job-portal-app
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server.js`
5. **Environment Variables**:
   Scroll down to Advanced/Environment Variables and add the exact keys from your local `.env`:
   - `PORT` = `5000`
   - `MONGODB_URI` = *(Paste your Atlas connection string from Step 2, replacing `<password>` with the actual password)*
   - `GEMINI_API_KEY` = *(Paste your Google Gemini API key)*
   - `NODE_ENV` = `production`
6. Click **Create Web Service**. 
7. Render will now clone your code, install dependencies, and launch the app automatically. Once it says "Live", your app is hosted at `https://job-portal-app.onrender.com`!

### Step 5: Seed Your Production Database
Because MongoDB Atlas is a brand-new blank slate, you will need to re-seed your mock data into the live server.
1. On Render, go to your Web Service dashboard -> **Shell** (a terminal inside your cloud server).
2. Type `cd backend && npm run seed` inside the shell and hit enter. 
3. Your hosted database is now populated remotely!
