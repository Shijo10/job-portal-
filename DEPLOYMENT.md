# Deployment instructions

1. Create a GitHub repo and push this project:

```bash
cd D:/project
git init
git add .
git commit -m "Prepare repo for deployment: add hosting configs"
git branch -M main
# create a remote on GitHub and then:
git remote add origin https://github.com/<your-user>/<your-repo>.git
git push -u origin main
```

2. Frontend (Netlify)
- Go to https://app.netlify.com and "New site from Git".
- Connect your GitHub repo, choose the `main` branch, and set `publish` directory to `frontend`.
- No build command is necessary for static HTML.

3. Backend (Render)
- Go to https://dashboard.render.com and create a new Web Service.
- Connect your GitHub repo and point the service to the `backend` folder.
- Build command: `cd backend && npm install`
- Start command: `cd backend && npm start`
- Or let Render use `render.yaml` already added to repository.

4. Environment variables
- Add any required secrets (e.g., database URLs, API keys) in the hosting service's dashboard.

5. Custom domain (optional)
- Configure DNS records from your domain registrar to point to the host (Netlify/Render provide DNS instructions).
