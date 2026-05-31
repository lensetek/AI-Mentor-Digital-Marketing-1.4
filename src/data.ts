export interface ModuleInfo {
  id: string;
  title: string;
  description: string;
  category: string;
  isLab?: boolean;
}

export const MODULES: ModuleInfo[] = [
  // Fundamentals of Digital Marketing
  { id: 'mod-1', title: '1. Why Online Matters', description: 'Fundamentals of Digital Marketing', category: 'Fundamentals' },
  { id: 'mod-1-1', title: '1.1. Typical Mistakes People Make When Going Online', description: 'Fundamentals of Digital Marketing', category: 'Fundamentals' },
  { id: 'mod-2', title: '2. Starting Your Online Journey', description: 'Fundamentals of Digital Marketing', category: 'Fundamentals' },
  { id: 'mod-2-1', title: '2.1. 30-Day Action Plan (for Starting Online Journey)', description: 'Fundamentals of Digital Marketing', category: 'Fundamentals' },
  { id: 'mod-4', title: '4. Plan Your Strategy', description: 'Fundamentals of Digital Marketing', category: 'Fundamentals' },
  { id: 'mod-4-1', title: '4.1. Digital Strategy Worksheet for Beginners', description: 'Niche, UVP, & Target Kanal. Kritik objektif strategi dasar.', category: 'Fundamentals', isLab: true },
  { id: 'mod-5', title: '5. Understand Search Engines', description: 'Fundamentals of Digital Marketing', category: 'Fundamentals' },
  { id: 'mod-5-1', title: '5.1. Search Keywords Examples by Niche', description: 'Fundamentals of Digital Marketing', category: 'Fundamentals' },
  { id: 'mod-6', title: '6. Get Found on Search', description: 'Fundamentals of Digital Marketing', category: 'Fundamentals' },
  { id: 'mod-6-1', title: '6.1. Mini SEO Action Plan', description: 'Fundamentals of Digital Marketing', category: 'Fundamentals' },
  { id: 'mod-7', title: '7. AI Foundations & The Marketing Ecosystem', description: 'Fundamentals of Digital Marketing', category: 'Fundamentals' },
  { id: 'mod-7-1-ai', title: '7.1: The Paradigm Shift: From Digital to AI-First Marketing', description: 'Fundamentals of Digital Marketing', category: 'Fundamentals' },
  { id: 'mod-7-2-ai', title: '7.2: The Language of Machines: LLMs & NLP in Marketing', description: 'Fundamentals of Digital Marketing', category: 'Fundamentals' },
  { id: 'mod-7-3-ai', title: '7.3: Visual Intelligence: Diffusion Models & Generative Art', description: 'Fundamentals of Digital Marketing', category: 'Fundamentals' },
  { id: 'mod-7-4-ai', title: '7.4: AI-Driven Analytics & Machine Learning (ML)', description: 'Fundamentals of Digital Marketing', category: 'Fundamentals' },

  // Landing Page
  { id: 'mod-3', title: '3. Create Your Website', description: 'Landing Page', category: 'Landing Page' },
  { id: 'mod-3-1', title: '3.1. Home Page Structure', description: 'Landing Page', category: 'Landing Page' },
  { id: 'mod-3-2', title: '3.2. Create a Beautiful Landing Page with AI', description: 'Landing Page', category: 'Landing Page' },
  { id: 'mod-3-3', title: '3.3. Build a Beautiful Landing Page Using AI', description: 'Landing Page', category: 'Landing Page' },
  { id: 'mod-8', title: '8. AI-Enhanced Market Research', description: 'Landing Page', category: 'Landing Page' },
  { id: 'mod-8-1-lp', title: '8.1. AI-Powered Competitor Intelligence', description: 'Landing Page', category: 'Landing Page' },
  { id: 'mod-8-2', title: '8.2. From Personas to "Digital Twins"', description: 'Ubah demografis menjadi profil AI. Wawancara target konsumen.', category: 'Landing Page', isLab: true },
  { id: 'mod-8-3-lp', title: '8.3. Social Listening & Narrative Intelligence', description: 'Landing Page', category: 'Landing Page' },
  { id: 'mod-8-4-lp', title: '8.4. Synthesizing Insights for Strategy', description: 'Landing Page', category: 'Landing Page' },

  // Google Ads
  { id: 'mod-7-ads', title: '7. Paid Search Ads', description: 'Google Ads', category: 'Google Ads' },
  { id: 'mod-7-1-ads', title: '7.1. Mini Google Ads Campaign Plan for Beginners', description: 'Google Ads', category: 'Google Ads' },
  { id: 'mod-7-2-ads', title: '7.2. Simple Flow: Setting Up Your First Google Ads Campaign', description: 'Google Ads', category: 'Google Ads' },
  { id: 'mod-8-ads', title: '8. Make Ads Work Better', description: 'Google Ads', category: 'Google Ads' },
  { id: 'mod-8-1', title: '8.1. Split-Test (A/B Testing) for Google Ads', description: 'Analisis performa eksperimen Google Ads.', category: 'Google Ads', isLab: true },
  { id: 'mod-8-2-ads', title: '8.2. Simple A/B Testing Ad Report Template', description: 'Google Ads', category: 'Google Ads' },
  { id: 'mod-8-3-ads', title: '8.3. Using AI to Boost Paid Search Ads Performance', description: 'Google Ads', category: 'Google Ads' },
  { id: 'mod-9', title: '9. Content Marketing & Generative AI', description: 'Google Ads', category: 'Google Ads' },
  { id: 'mod-9-1', title: '9.1. The 2026 Content Ecosystem: Personalization at Scale', description: 'Google Ads', category: 'Google Ads' },
  { id: 'mod-9-2', title: '9.2. Advanced Generative Text & Brand Voice Mastery', description: 'Google Ads', category: 'Google Ads' },
  { id: 'mod-9-3', title: '9.3. Next-Gen Visual & Video Production', description: 'Google Ads', category: 'Google Ads' },
  { id: 'mod-9-4', title: '9.4. The AI Content Factory (Automation & Distribution)', description: 'Google Ads', category: 'Google Ads' },

  // Social Media Marketing
  { id: 'mod-9-sm', title: '9. Use Social Media', description: 'Social Media Marketing', category: 'Social Media' },
  { id: 'mod-9-1-sm', title: '9.1. 30-Day Social Media Posting Plan', description: 'Social Media Marketing', category: 'Social Media' },
  { id: 'mod-9-2-sm', title: '9.2. Using AI to Create Social Media Content Faster and Better', description: 'Social Media Marketing', category: 'Social Media' },
  { id: 'mod-10', title: '10. AIO (AI Optimization) & Modern SEO', description: 'Social Media Marketing', category: 'Social Media' },
  { id: 'mod-10-1', title: '10.1. From SEO to AIO: The Paradigm Shift', description: 'Social Media Marketing', category: 'Social Media' },
  { id: 'mod-10-2', title: '10.2. Engineering for AI "Scannability"', description: 'Social Media Marketing', category: 'Social Media' },
  { id: 'mod-10-3', title: '10.3. LLM Optimization (LLMO)', description: 'Ubah SEO ke AIO. Audit draf artikel.', category: 'Social Media', isLab: true },
  { id: 'mod-10-4', title: '10.4. Integration: The Opal "Utility" SEO', description: 'Social Media Marketing', category: 'Social Media' },
  { id: 'mod-10-5', title: '10.5. Hands-on Lab: The AIO Audit', description: 'Social Media Marketing', category: 'Social Media', isLab: true },

  // Social Media Marketing Use Cases
  { id: 'mod-10-uc', title: '10. Build a Social Media Plan', description: 'Social Media Marketing Use Cases', category: 'Social Media Cases' },
  { id: 'mod-10-1-uc', title: '10.1. Social Media Strategy Examples', description: 'Social Media Marketing Use Cases', category: 'Social Media Cases' },
  { id: 'mod-10-2-uc', title: '10.2. Using AI to Build a Full Social Media Content Strategy', description: 'Social Media Marketing Use Cases', category: 'Social Media Cases' },
  { id: 'mod-11', title: '11. Social Media Automation & Engagement', description: 'Social Media Marketing Use Cases', category: 'Social Media Cases' },
  { id: 'mod-11-1', title: '11.1. The Rise of the "Gemini Social Agent"', description: 'Uji logika agen sosial media otomatis dalam situasi krisis.', category: 'Social Media Cases', isLab: true },
  { id: 'mod-11-2', title: '11.2: Hyper-Personalized Engagement at Scale', description: 'Social Media Marketing Use Cases', category: 'Social Media Cases' },
  { id: 'mod-11-3', title: '11.3. Trend-Jacking & Real-Time Content PIVOTs', description: 'Social Media Marketing Use Cases', category: 'Social Media Cases' },
  { id: 'mod-11-4', title: '11.4: Tactical Integration: The Autonomous Engagement Loop', description: 'Social Media Marketing Use Cases', category: 'Social Media Cases' },
  { id: 'mod-11-5', title: '11.5. Lab: Building & Stress-Testing Your Autonomous Agent', description: 'Social Media Marketing Use Cases', category: 'Social Media Cases', isLab: true },

  // Video and Content Marketing
  { id: 'mod-11-vid', title: '11. Video for Marketing', description: 'Video and Content Marketing', category: 'Video' },
  { id: 'mod-11-1-vid', title: '11.1. 7 Days Create and Post Video Challenge', description: 'Video and Content Marketing', category: 'Video' },
  { id: 'mod-11-2-vid', title: '11.2. 7-Day Video Content Challenge Tracking Sheet', description: 'Video and Content Marketing', category: 'Video' },
  { id: 'mod-11-3-vid', title: '11.3. Creating Engaging Videos with Meta AI', description: 'Video and Content Marketing', category: 'Video' },
  { id: 'mod-12', title: '12. Write Great Content', description: 'Video and Content Marketing', category: 'Video' },
  { id: 'mod-12-1', title: '12.1. Great Content Structure for a Simple Social', description: 'Video and Content Marketing', category: 'Video' },
  { id: 'mod-12-2', title: '12.2. Using AI to Create Great Content and Video for Marketing', description: 'Video and Content Marketing', category: 'Video' },
  { id: 'mod-12-3', title: '12.3. Creating Stunning Short Videos Using AI', description: 'Video and Content Marketing', category: 'Video' },
  { id: 'mod-12-ads', title: '12. AI Ads & Media Buying', description: 'Video and Content Marketing', category: 'Video' },
  { id: 'mod-12-1-ads', title: '12.1: Autonomous Bidding & Smart Audience Targeting', description: 'Video and Content Marketing', category: 'Video' },
  { id: 'mod-12-2-ads', title: '12.2: Generative Creative & Dynamic Asset Orchestration', description: 'Video and Content Marketing', category: 'Video' },

  // Email Marketing
  { id: 'mod-13', title: '13. Email Marketing', description: 'Email Marketing', category: 'Email' },
  { id: 'mod-13-1', title: '13.1. Simple Email Plan', description: 'Email Marketing', category: 'Email' },
  { id: 'mod-13-2', title: '13.2. Building High-Converting Email Campaigns with AI', description: 'Email Marketing', category: 'Email' },

  // Other Online Ads
  { id: 'mod-14', title: '14. Online Ads (Display Ads)', description: 'Other Online Ads', category: 'Ads' },
  { id: 'mod-14-1', title: '14.1. a Simple Display Ad', description: 'Other Online Ads', category: 'Ads' },
  { id: 'mod-15', title: '15. Smarter Display Ads', description: 'Other Online Ads', category: 'Ads' },
  { id: 'mod-15-1', title: '15.1. Smarter Display Ads Example Setup', description: 'Other Online Ads', category: 'Ads' },

  // Mobile Marketing
  { id: 'mod-16', title: '16. Be Mobile-Friendly', description: 'Mobile Marketing', category: 'Mobile' },
  { id: 'mod-16-1', title: '16.1. Quick Mobile-Friendly Checklist', description: 'Mobile Marketing', category: 'Mobile' },
  { id: 'mod-16-2', title: '16.2. Using AI to Optimize Your Mobile Presence', description: 'Mobile Marketing', category: 'Mobile' },

  // Analytics
  { id: 'mod-17', title: '17. Intro to Web Analytics', description: 'Analytics', category: 'Analytics' },
  { id: 'mod-17-1', title: '17.1. Start Using Analytics (For Beginners)', description: 'Analytics', category: 'Analytics' },
  { id: 'mod-17-2', title: '17.2. Simple Analytics Insight', description: 'Analytics', category: 'Analytics' },
  { id: 'mod-18', title: '18. Improve with Analytics', description: 'Analytics', category: 'Analytics' },
  { id: 'mod-19', title: '19. Turn Data into Action', description: 'Analytics', category: 'Analytics' },
  { id: 'mod-19-1', title: '19.1. Using AI to Master Web Analytics', description: 'Analytics', category: 'Analytics' },
  { id: 'mod-13-crm', title: '13. CRM & Personalization At Scale', description: 'Analytics', category: 'Analytics' },
  { id: 'mod-13-1-crm', title: '13.1: Predictive CRM & Autonomous Lifecycle Management', description: 'Analytics', category: 'Analytics' },
  { id: 'mod-13-2-crm', title: '13.2: The "Segment of One" (Scaling One-to-One Value)', description: 'Analytics', category: 'Analytics' },

  // Digital Marketing Best Practices
  { id: 'mod-20', title: '20. Open Your Online Store', description: 'Digital Marketing Best Practices', category: 'Best Practices' },
  { id: 'mod-21', title: '21. Boost Online Sales', description: 'Digital Marketing Best Practices', category: 'Best Practices' },
  { id: 'mod-22', title: '22. Sell to Other Countries', description: 'Digital Marketing Best Practices', category: 'Best Practices' },
  { id: 'mod-23', title: '23. Local SEO Basics', description: 'Digital Marketing Best Practices', category: 'Best Practices' },
  { id: 'mod-24', title: '24. Local Marketing Tactics', description: 'Digital Marketing Best Practices', category: 'Best Practices' },
  { id: 'mod-25', title: '25. Mobile + Local Strategy', description: 'Digital Marketing Best Practices', category: 'Best Practices' },
  { id: 'mod-26', title: '26. Building a Strong Online Brand with AI', description: 'Digital Marketing Best Practices', category: 'Best Practices' },

  // Ethics, Future Trends, & AI Agents
  { id: 'mod-14-1-ethics', title: '14.1. The Ethics of Persuasion in the Age of Agents', description: 'Ethics, Future Trends, & AI Agents', category: 'Ethics' },
  { id: 'mod-14-2-ethics', title: '14.2: Future Trends: Agentic Commerce & The Post-Search Era', description: 'Ethics, Future Trends, & AI Agents', category: 'Ethics' },

  // Capstone
  { id: 'capstone', title: 'Capstone Project', description: 'Validasi proyek akhir "The Ultimate Marketing AI Agent".', category: 'Capstone', isLab: true },
];
