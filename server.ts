import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Agent, run, user, assistant, setDefaultOpenAIKey } from "@openai/agents";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

### [ID: capstone] - Capstone Project Assessment ("The Ultimate Marketing AI Agent")
- Mentor Focus: Directly and straight-forwardly teach the student how to create and complete their Capstone project using a Custom Gemini Gem.
- Straight teaching strategy:
  1. Guide the student step-by-step in structuring their single Google Docs or Canva submission link (The "One-Link" Rule, which MUST be public).
  2. Section 1 (The Brain): Teach them how to choose a specific niche, name their AI Agent, and obtain the publicly shared Gemini Gem URL.
  3. Section 2 (The Instructions & Logic): Directly help the student write robust, highly detailed System Instructions (logic) for their Gem. Give them concrete examples of instructions and explain how to select and upload PDF/Doc assets for their agent's Knowledge Base.
  4. Section 3 (Creative Samples): Teach them how to instruct their Gem to generate a 5-8 second Micro-Ad video prompt, and how to link their final assets generated using Google Veo 3.1 (video) and Google Lyria (audio).
  5. Section 4 (System Walkthrough): Teach them how to perform a clear 3-minute screen recording walkthrough (using Loom, YouTube, or Google Drive) demonstrating their Gem in action.
  6. Checklist & Rubric validation: Walk the student through the checklist items and grading rubric (Agent Intelligence 40%, Logic Construction 30%, Asset Execution 20%, Documentation 10%) so they are guaranteed a high score. Ensure the tone is practical, encouraging, and directly shows them "how-to".

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

// Middleware to validate request access (Origin referer check or Gate Key)
const checkAccess = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const gateKey = process.env.GATE_KEY;
  const allowedReferer = process.env.ALLOWED_REFERER || "https://lensetek.online";
  
  // If neither GATE_KEY nor ALLOWED_REFERER is configured in env, allow all access (development mode)
  if (!gateKey && !process.env.ALLOWED_REFERER) {
    return next();
  }

  // 1. Check if request comes from the allowed platform domain
  const referer = req.headers.referer || "";
  if (process.env.ALLOWED_REFERER && referer.startsWith(allowedReferer)) {
    return next();
  }

  // 2. Check if a valid gate key is provided in body, headers, or query
  const clientKey = req.body.code || req.headers["x-gate-key"] || req.query.code;
  if (gateKey && clientKey === gateKey) {
    return next();
  }

  // If both checks fail, block request
  return res.status(403).json({ 
    error: "Access Denied. This simulator is only accessible through the Lensetek Online certification course platform or with a valid access key." 
  });
};

app.post("/api/chat", checkAccess, async (req, res) => {
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

app.post("/api/analyze", checkAccess, async (req, res) => {
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
      prompt = `Here is the conversation history between the Student and the AI Mentor in the e-learning session:\n\n${conversationText}\n\nCreate a visual Concept Mindmap based on the topics discussed. You MUST output a single, valid JSON object matching the following structure, with NO markdown code block formatting (do not wrap in \`\`\`json), NO markdown wrapping, and NO explanation text. Just the raw JSON.

TypeScript Schema:
interface MindmapNode {
  name: string; // The concept or topic name (concise, keep under 4 words)
  emoji: string; // Single emoji representing the concept
  description: string; // Brief 1-sentence explanation or key takeaway
  children?: MindmapNode[]; // Sub-concepts (max 3-4 children per node)
}

Create a hierarchical concept tree with the main subject of the module as the root node.`;
    } else {
      return res.status(400).json({ error: "Invalid analysis type" });
    }

    const agentInstructions = type === "summary"
      ? "You are a digital marketing learning analysis assistant. Your task is to summarize digital marketing concepts in a highly structured, clean, and beautiful Markdown format with emojis."
      : "You are a digital marketing learning analysis assistant. Your task is to create structured, beautiful mindmap trees in raw JSON format matching the requested schema.";

    const analysisAgent = new Agent({
      name: "Lensetek Analyzer",
      instructions: agentInstructions,
      model: modelName,
    });

    const result = await run(analysisAgent, [user(prompt)]);
    
    let outputText = result.finalOutput || "";
    if (type === "mindmap") {
      // Strip markdown code block wrappers if any are present
      outputText = outputText.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
    }

    res.json({ text: outputText });
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
    app.use(express.static(distPath, {
      maxAge: '1y',
      immutable: true,
      index: false
    }));

    app.get('*', (req, res) => {
      // Return 404 for missing assets rather than index.html
      if (req.path.startsWith('/assets/') || req.path.includes('.')) {
        return res.status(404).send('Asset not found');
      }
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
