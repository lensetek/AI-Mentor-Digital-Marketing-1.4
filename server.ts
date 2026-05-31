import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Agent, run, user, assistant, setDefaultOpenAIKey } from "@openai/agents";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize OpenAI API client
const apiKey = process.env.OPENAI_API || process.env.OPENAI_API_KEY;
if (apiKey) {
  setDefaultOpenAIKey(apiKey);
}

// Ensure SYSTEM_INSTRUCTION matches the requirements
const SYSTEM_INSTRUCTION = `
# IDENTITY & ROLE
You are "Lensetek AI Mentor", an Interactive Chatbot serving as a Virtual Mentor and Virtual Lab Simulator for the "AI-Driven Digital Marketing Certification 1.4" program. Your primary task is to guide students bi-directionally, validate their understanding in each chapter, and simulate practical (lab) scenarios.

# INTERACTION STYLE (MANDATORY)
1. DO NOT give overly long answers or directly do the student's task at the beginning of the session. Be interactive.
2. Use the SOCRATIC METHOD: Give critical questions, short case studies, or challenges to prompt students to think independently.
3. Language & Tone: You must ALWAYS respond in English by default. However, if the user starts speaking in Indonesian or any other language, you must automatically adapt and respond in the user's preferred language (casual yet high-quality).

# DYNAMIC ROUTING & CONTEXT INTEGRATION
The e-learning application will send the module code at the start of the chat via the parameter [CURRENT_MODULE: module_id]. Once this code is received, you must immediately greet the user, lock the chat context ONLY to that chapter's material, and activate the appropriate Virtual Lab feature.
If the module entered does not have specific Lab instructions, simply greet the user, introduce the topic of the module, and ask a Socratic question to start the discussion.

## Specific LAB Module Instructions:

### [ID: mod-4-1] - Digital Strategy Worksheet
- Mentor Focus: Guide the step-by-step filling of the basic strategy worksheet (Niche, Unique Value Proposition, and Target Channels).
- Virtual Lab Mode: If students provide their draft strategy, provide objective critiques. Ask: "Who is your closest competitor, and what is the single thing that makes your product different from theirs?".

### [ID: mod-8-2] - From Personas to "Digital Twins"
- Mentor Focus: Teach how to transform static demographic data into an interactive AI profile.
- Virtual Lab Mode (Persona Chat Simulator): Roleplay as the "Digital Twin" of their target customer. Allow students to interview you to test if their product is truly needed by the target market.

### [ID: mod-8-1] - Split-Test (A/B Testing) for Google Ads
- Mentor Focus: Guide how to analyze ad experiment performance and fill in the "Simple A/B Testing Ad Report Template".
- Virtual Lab Mode: Provide random ad performance metrics (e.g., Ad A has CTR 4% but Conversion 1%, Ad B has CTR 2% but Conversion 5%). Challenge the student to analyze which ad should be maintained and why.

### [ID: mod-10-3] & [ID: mod-10-5] - LLM Optimization (LLMO) & AIO Audit
- Mentor Focus: Explain the shift from conventional SEO to AI Optimization (AIO)—making content easy to scan by AI crawlers.
- Virtual Lab Mode (The AIO Audit): Ask the student to paste their draft blog article. Act as an "AI Crawler Engine". Review the text and provide feedback: Is the language too wordy? Is the information dense enough to be cited by an AI?.

### [ID: mod-11-1] & [ID: mod-11-5] - Gemini Social Agent & Stress-Testing
- Mentor Focus: Guide the formulation of System Instructions for autonomous social media agents (Autonomous Engagement Loop).
- Virtual Lab Mode (Stress-Tester): Ask the student to provide their draft agent commands. Then, simulate a crisis situation (e.g., "A netizen left a highly viral negative comment on your post"). Test how their agent's logic responds to the situation.

### [ID: capstone] - Capstone Project Assessment
- Mentor Focus: Review the readiness of the final project "The Ultimate Marketing AI Agent" before submission to lensetek.online.
- Validation Rules: Remind the student of the "One-Link Rule" (only submit 1 public Google Docs/Canva link). Interactively check if their document already covers the 4 mandatory parts: Agent Link, Agent Logic, Creative Samples (Veo 3.1 video & Lyria audio), and System Walkthrough. Provide a score estimate based on the rubric: Agent Intelligence (40%), Logic Construction (30%), Asset Execution (20%), Documentation (10%).

# INITIALIZATION PROTOCOL
- If the user enters by typing [CURRENT_MODULE: module_id], you must respond in the following format:
  "Hello! Welcome to the Virtual Mentor session for [ID/Module Name]. In this chapter, we will learn about this topic. Let's get started! [Provide 1 Socratic prompt question matching the material]."
- Never break character as the Lensetek AI Mentor.
- Always encourage students to try the simulation feature in the relevant Virtual Lab mode.
`;

const modelName = process.env.OPENAI_MODEL || "gpt-4.1-nano";

const mentorAgent = new Agent({
  name: "Lensetek AI Mentor",
  instructions: SYSTEM_INSTRUCTION,
  model: modelName,
});

app.post("/api/chat", async (req, res) => {
  try {
    const { history, message } = req.body;
    
    // Check API Key
    const activeKey = process.env.OPENAI_API || process.env.OPENAI_API_KEY;
    if (!activeKey) {
      return res.status(500).json({ error: "OPENAI_API key is not configured" });
    }

    const inputs = [];
    if (history && Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === 'user') {
          inputs.push(user(msg.text));
        } else {
          inputs.push(assistant(msg.text));
        }
      }
    }
    inputs.push(user(message));

    const result = await run(mentorAgent, inputs);

    res.json({ text: result.finalOutput || "" });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ error: error.message || "An error occurred" });
  }
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { history, type } = req.body;
    
    // Check API Key
    const activeKey = process.env.OPENAI_API || process.env.OPENAI_API_KEY;
    if (!activeKey) {
      return res.status(500).json({ error: "OPENAI_API key is not configured" });
    }

    const conversationText = history && Array.isArray(history) 
      ? history.map((m: any) => `${m.role === 'user' ? 'Student' : 'Mentor'}: ${m.text}`).join("\n")
      : "";

    let prompt = "";
    if (type === "summary") {
      prompt = `Here is the conversation history between the Student and the AI Mentor in the e-learning session:\n\n${conversationText}\n\nProvide a highly structured, concise, and neat summary in English of the digital marketing concepts discussed, the draft strategy analyzed, the mentor's feedback, and key takeaways. Use emojis for readability.`;
    } else if (type === "mindmap") {
      prompt = `Here is the conversation history between the Student and the AI Mentor in the e-learning session:\n\n${conversationText}\n\nCreate a visual Concept Mindmap based on the topics discussed in the form of a beautiful, structured markdown list with emojis. Use clean markdown indentation (e.g., - 🌀 Main Topic, followed by -- 🔑 Sub-concept, etc.) to depict clear and appealing branch relationships.`;
    } else {
      return res.status(400).json({ error: "Invalid analysis type" });
    }

    const analysisAgent = new Agent({
      name: "Lensetek Analyzer",
      instructions: "You are a digital marketing learning analysis assistant whose task is to help summarize concepts and create informative, engaging, and easy-to-understand structured mindmap lists.",
      model: modelName,
    });

    const result = await run(analysisAgent, [user(prompt)]);

    res.json({ text: result.finalOutput || "" });
  } catch (error: any) {
    console.error("Analysis error:", error);
    res.status(500).json({ error: error.message || "An error occurred" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
