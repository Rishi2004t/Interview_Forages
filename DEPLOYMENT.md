# Deploying InterviewForge Backend to Render

This guide outlines the steps to deploy the InterviewForge Node.js backend to [Render](https://render.com) for free.

## Prerequisites
1. A GitHub account.
2. A Render account (linked to GitHub).
3. Your Groq API Key.

---

## Deployment Steps

### Option 1: Using Render Blueprint (Recommended)
Because we have a `render.yaml` file in the root of the repository, Render can configure the entire service automatically.

1. Push your code to a GitHub repository.
2. Log into the Render Dashboard.
3. Click **New +** and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will detect the `render.yaml` file. Click **Apply**.
6. When prompted for Environment Variables, enter your `GROQ_API_KEY`.
7. Click **Save** and watch the build logs.

### Option 2: Manual Web Service Setup
If you prefer not to use the Blueprint:

1. Push your code to a GitHub repository.
2. Log into the Render Dashboard.
3. Click **New +** and select **Web Service**.
4. Connect your GitHub repository.
5. Configure the service:
   - **Name:** `interviewforge-api`
   - **Language:** `Node`
   - **Branch:** `main` (or your default branch)
   - **Root Directory:** `backend`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
6. Click **Advanced** and set Environment Variables:
   - `GROQ_API_KEY` = `<your_api_key_here>`
   - `NODE_ENV` = `production`
7. Under Advanced, set the **Health Check Path** to `/health`.
8. Click **Create Web Service**.

---

## Verifying Deployment

Once Render says the deployment is live, click the provided `.onrender.com` URL.

You should see a `404 Route not found` or a successful API response if you specifically check the health endpoint:
\`\`\`
https://<your-service-name>.onrender.com/health
\`\`\`

You should see a response like this:
\`\`\`json
{
  "success": true,
  "data": {
    "status": "ok",
    "service": "InterviewForge API",
    "version": "0.0.1",
    "uptime": 120,
    "timestamp": "2026-06-09T10:00:00.000Z"
  },
  "timestamp": "2026-06-09T10:00:00.000Z"
}
\`\`\`

---

## Updating the VS Code Extension

Once your backend is deployed, you must update the VS Code extension to point to your new live server instead of localhost.

1. Open `src/services/backendClient.ts` in the extension source code.
2. Change the `BASE_URL`:
   \`\`\`typescript
   const BASE_URL = 'https://<your-service-name>.onrender.com';
   \`\`\`
3. Recompile the extension (`npm run compile`).
4. Package or run the extension — it is now fully cloud-powered!
