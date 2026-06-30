# ResumeFlow — Production Deployment Guide

This guide outlines a clean, step-by-step procedure to initialize Git, push the codebase to GitHub, and deploy it to **Vercel** with a **Convex Cloud** backend and **Clerk** authentication. 

All TypeScript compilation errors and potential deployment blocks (e.g., Convex circular type dependencies and framer-motion easing mismatches) have been resolved. The project is fully ready for a zero-disturbance production compile.

---

## 🔒 1. Secrets & Credentials Management (Security Check)

Before initializing Git or pushing any files, verify that your local secrets are properly hidden.

1. **Verify `.gitignore`**:
   Ensure your local `.env.local` containing your private API keys is not tracked. The project includes a configured `.gitignore` containing:
   ```gitignore
   # env files (CRITICAL: never commit API keys)
   .env
   .env.local
   .env.development.local
   .env.test.local
   .env.production.local
   .env*.local.backup
   .env*.bak
   ```
2. **Review `.env.example`**:
   The `.env.example` in the project root contains placeholder credentials (`tvly-xxx`, `sk_test_xxx`, etc.) and contains NO real secrets. Feel free to update it to list new variables as placeholders, but never commit actual production keys to it.

---

## 💻 2. Git Repository Initialization & GitHub Setup

ResumeFlow is currently a local folder. Follow these steps to initialize it and push it to GitHub:

1. **Initialize Git**:
   Open a terminal in the project root `/Users/pro/Desktop/ResumeFlow` and run:
   ```bash
   git init
   ```
2. **Add Files & Make First Commit**:
   Stage all files and create an initial commit:
   ```bash
   git add .
   git commit -m "chore: initial production-ready commit"
   ```
3. **Create a GitHub Repository**:
   - Go to [GitHub](https://github.com) and sign in.
   - Click the **New** button to create a new repository.
   - Name it `ResumeFlow`, keep it **Private** (recommended since it contains proprietary business logic and key structures), and leave "Add a README" unchecked.
   - Click **Create repository**.
4. **Link and Push to GitHub**:
   Copy the commands from the GitHub repository page:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/ResumeFlow.git
   git branch -M main
   git push -u origin main
   ```

---

## ☁️ 3. Convex Production Backend Deployment

ResumeFlow uses Convex for its database, mutations, actions, and queries. The Convex backend must be deployed first.

1. **Initialize & Authenticate Convex**:
   If not logged in, execute:
   ```bash
   npx convex login
   ```
2. **Deploy Backend to Production**:
   Run the deployment command to create a production Convex project and push your schema:
   ```bash
   npx convex deploy
   ```
   Follow the prompts to configure a new Convex project. Once finished, this will deploy your database schema and serverless functions, generating:
   - **Production Convex URL** (e.g., `https://wonderful-otter-999.convex.cloud`)
   - **Convex Deploy Key** (required for Vercel builds)
3. **Add Environment Variables to Convex Dashboard**:
   Go to the **Convex Dashboard → [Your Project] → Settings → Environment Variables** and add the following keys so your backend actions (like AI resume extraction and searches) work:
   
   | Key | Description | Example / Source |
   | :--- | :--- | :--- |
   | `CLERK_JWT_ISSUER_DOMAIN` | The JWT issuer URL of your Clerk app | `https://mutual-collie-86.clerk.accounts.dev` |
   | `NVIDIA_NIM_API_KEY` | NVIDIA NIM AI endpoint key | `nvapi-xxxxxxxxxxxxxxxxxxxxxxxx` |
   | `TAVILY_API_KEY` | Tavily Web Search API key | `tvly-xxxxxxxxxxxxxxxxxxxxxxxx` |
   | `UPSTASH_REDIS_REST_URL` | Upstash Redis connection URL | `https://your-url.upstash.io` |
   | `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis authentication token | `your_upstash_rest_token` |

---

## 🔑 4. Clerk Authentication Setup for Production

1. **Obtain API Keys**:
   Sign in to your [Clerk Dashboard](https://dashboard.clerk.com). For production, click the **Production** environment switch, and navigate to **API Keys** to get your production publishable & secret keys.
2. **Configure Allowed Origins & Redirects**:
   - Add your production Vercel deployment URL (e.g., `https://resumeflow.vercel.app`) to your Clerk application settings under **Allowed Origins** and **Redirect URLs** (sign-in/sign-up page settings).
3. **Configure Clerk JWT Templates for Convex**:
   - In the Clerk Dashboard, go to **JWT Templates → New Template → Convex**.
   - Create the Convex JWT template. This ensures tokens sent by Clerk match the expected signature in Convex.

---

## ⚡ 5. Vercel Deployment (Frontend Setup)

1. **Deploy via Vercel Dashboard**:
   - Go to [Vercel](https://vercel.com) and click **Add New → Project**.
   - Import your newly pushed `ResumeFlow` GitHub repository.
2. **Add Environment Variables in Vercel**:
   Add the following environment variables under **Settings → Environment Variables**:
   
   | Key | Value Source |
   | :--- | :--- |
   | `NEXT_PUBLIC_CONVEX_URL` | The Production Convex URL generated in Step 3 |
   | `CONVEX_DEPLOY_KEY` | The Convex Deploy Key from your Convex Dashboard Settings |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Production Publishable Key |
   | `CLERK_SECRET_KEY` | Clerk Production Secret Key |
   | `CLERK_JWT_ISSUER_DOMAIN` | `https://your-instance.clerk.accounts.dev` |
   | `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
   | `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
   | `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
   | `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
   | `NVIDIA_NIM_API_KEY` | NVIDIA NIM AI API Key |
   | `TAVILY_API_KEY` | Tavily Search API Key |
   | `UPSTASH_REDIS_REST_URL` | Upstash Redis URL |
   | `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis Token |

3. **Configure the Build Commands**:
   To ensure Convex schemas are deployed and clients are generated before Next.js compiles:
   - Under **Build and Development Settings**, override the **Build Command** to:
     ```bash
     npx convex deploy --cmd "npm run build"
     ```
     *(This ensures the production database schema is applied and generated Convex files are kept up to date during Vercel builds).*

4. **Deploy**:
   Click **Deploy**. Vercel will clone, compile, and publish your project cleanly.
