# 🤖 Lensetek AI Mentor (Virtual Lab Simulator)

An interactive e-learning companion and simulator built for the **AI-Driven Digital Marketing Certification 1.4** program. This app serves as both a Virtual Mentor and a Socratic Lab Simulator, guiding students dynamically, validating strategies, and conducting hands-on marketing lab scenarios.

## 🎓 Certification & Corporate Hub

* **Take the Course & Get Certified:** You can enroll in the full certification program and access the e-learning portal at [lensetek.online](https://lensetek.online).
* **Explore Our Innovations:** Discover advanced AI implementations, marketing automation tools, and corporate digital solutions at [lensetek.com](https://lensetek.com).

---

Powered by the official **OpenAI Agents SDK**, featuring custom deep linking, session summarizing, and concept mindmap generation.

---

## ✨ Features

- ** Socratic AI Mentor & Virtual Labs**:
  - **Digital Strategy Worksheet (`mod-4-1`)**: Objective critique of target niche, UVP, and channels.
  - **Persona Chat Simulator (`mod-8-2`)**: Interactive roleplay with target consumer "Digital Twins".
  - **Google Ads A/B Testing (`mod-8-1`)**: Metric performance analysis (CTR, Conversion) and reporting.
  - **LLM Optimization & AIO Audit (`mod-10-3` / `mod-10-5`)**: AI crawler scannability test for blog articles.
  - **Social Agent Stress-Testing (`mod-11-1` / `mod-11-5`)**: Crisis simulation to test autonomous agent instructions.
  - **Capstone Project Assessment (`capstone`)**: Rubric-based interactive validation before final submission.
- **🔗 Deep Linking & Seamless E-learning Embeds**:
  - Direct routing via URL parameter: `https://your-domain.com/?module=mod-4-1` directly opens that active module session.
  - Integrated **"Copy Link" Embed Generator** on every catalog card with dynamic micro-interactions.
- **📊 Quick Learning Analytics**:
  - **📝 Summary**: Generates a highly structured, concise markdown summary of concepts discussed during the active session.
  - **🌿 Mindmap**: Creates a beautiful hierarchical markdown concept tree showing related concepts, accessible from a floating glassmorphic modal.
- **🎨 Brand Tailored & Mobile-First**:
  - Harmonious, high-contrast dark/light aesthetics featuring official Lensetek logos.
  - Aligned quick action triggers embedded directly beneath the chat text box for excellent mobile viewport comfort.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide icons, Motion (Framer Motion)
- **Backend**: Express.js, Node.js, TypeScript (tsx compilation)
- **AI Core**: `@openai/agents` SDK, `zod`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- An OpenAI API Key

### Local Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd AI-Mentor-Digital-Marketing-1.4
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to create a `.env.local` file:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and configure your keys:
   ```env
   OPENAI_API="your-openai-api-key-here"
   OPENAI_MODEL="gpt-4o-mini"  # Or your preferred model
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## ☁️ Deployment

### 1. Unified Single Deployment (Highly Recommended)
You can deploy both the Frontend and Backend together as a **single project** on any Node.js hosting platform (such as **Render.com**, Railway, or Google Cloud Run). 

In production, the Express server automatically serves the compiled static React assets from the `dist/` folder, eliminating any CORS issues or redirect configurations!

#### Deploying on Render.com:
1. Create a new **Web Service** on Render and connect this GitHub repository.
2. Configure the following settings:
   - **Language**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Under **Environment Variables**, add:
   - `NODE_ENV`: `production` *(Ensures the Express server serves the frontend files)*
   - `OPENAI_API`: `your-openai-api-key-here`
   - `OPENAI_MODEL`: `gpt-4o-mini` *(or your preferred model)*
4. Click **Create Web Service**. Once deployed, your entire application (Chat, Labs, Summaries, and Mindmaps) will be live under a single URL!

---

### 2. Split Deployment (Optional)
If you prefer to separate the Frontend and Backend:

#### Frontend (Static Hosting - e.g., Cloudflare Pages):
- Upload the compiled `dist/` directory directly to Cloudflare Pages.
- To connect to your external backend without CORS issues, create a `_redirects` file in the root of your `dist/` (or in a `public/` folder) containing:
  ```text
  /api/*  https://your-backend-service.onrender.com/api/:splat  200
  ```

#### Backend (Node.js Server):
- Deploy this repository to Render.com with the same build settings but omit `NODE_ENV` or set it to a different value.
- Make sure to enable CORS in your backend `server.ts` if calling it directly across different origins.
