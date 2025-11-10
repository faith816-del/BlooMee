const express = require("express");
const router = express.Router();

// Simple Q&A rules database (case-insensitive, partial match)
const RULES = [
  { q: ["what causes periods", "cause of periods", "why do we have periods", "what is a period"], a: "Periods are caused by hormonal changes in the menstrual cycle. Each month, estrogen and progesterone prepare the uterus. If pregnancy doesn’t happen, hormone levels drop and the uterine lining sheds as your period." },
  { q: ["how long does a period last", "period length", "how many days period"], a: "A typical period lasts 3–7 days. Some cycles are lighter or heavier and may be shorter or longer — tracking helps you spot your personal pattern." },
  { q: ["what is pms", "pms symptoms", "premenstrual"], a: "PMS (premenstrual syndrome) can include mood changes, bloating, breast tenderness, and fatigue around your period. Sleep, hydration, balanced meals, and light exercise can help." },
  { q: ["late period", "missed period", "why is my period late"], a: "A late period can be due to stress, hormone shifts, travel, illness, or pregnancy. If it’s over a week late, consider a test and talk to a provider if you’re concerned." },
  { q: ["cramps", "period pain", "menstrual pain"], a: "Menstrual cramps happen when the uterus contracts to shed its lining. Heat, hydration, gentle stretching, and rest can help. If pain is severe or unusual, consult a provider." },
  { q: ["irregular period", "cycle irregular", "unpredictable period"], a: "Irregular cycles can follow stress, weight changes, medications, or hormonal conditions. Track for a few months; if it continues, a provider can help evaluate." },
  { q: ["brown discharge", "discharge color", "vaginal discharge"], a: "Discharge can vary. Clear/white is often normal; brown may be old blood. If it’s thick, green/yellow, has a strong odor, or causes itching, get checked for infection." },
  { q: ["ovulation", "fertile window", "when can i get pregnant"], a: "Ovulation usually occurs about 12–16 days before your next period. Your fertile window is the few days leading up to and including ovulation." },
  { q: ["pcos", "polycystic ovary syndrome"], a: "PCOS is a hormonal condition that can cause irregular periods, acne, or hair changes. Lifestyle support and medical care can help manage symptoms." },
  { q: ["endometriosis", "endo"], a: "Endometriosis is when tissue similar to the uterine lining grows outside the uterus, often causing painful periods. A provider can discuss diagnosis and options." },
];

function matchRule(message) {
  const text = (message || "").toLowerCase();
  for (const rule of RULES) {
    for (const key of rule.q) {
      if (text.includes(key.toLowerCase())) return rule.a;
    }
  }
  return null;
}

// Local rule-based responder (no external APIs) with heuristics as secondary
function localBuddy(message) {
  const msg = (message || "").toLowerCase();
  if (!msg) return "Hi! I’m your BlooMee Buddy 🌸. Ask me anything about periods, mood, cramps, or self‑care.";

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hey love 💕 How can I support you today?";
  }
  if (msg.includes("cramp") || msg.includes("pain")) {
    return "Cramps can be rough 😣. Try a warm compress, hydration, light stretching, and rest. If pain is severe or lasts over 3 days, consider seeing a doctor.";
  }
  if (msg.includes("late") && msg.includes("period")) {
    return "A late period can be due to stress, hormones, or routine changes. If it’s a week late, consider a test and check in with a provider if worried.";
  }
  if (msg.includes("pms")) {
    return "PMS may bring mood swings, bloating, or fatigue. Balanced meals, water, and sleep help 🌷. If symptoms are disruptive, a provider can suggest options.";
  }
  if (msg.includes("mood") || msg.includes("sad") || msg.includes("anx")) {
    return "Mood shifts are common during hormonal changes 💗. Gentle movement, journaling, or talking to someone you trust can help. I’m here if you want to share more.";
  }
  if (msg.includes("discharge")) {
    return "Clear or white discharge can be normal. If it’s thick, colored, has odor, or causes itching, please get checked for possible infection 👩🏾‍⚕️.";
  }
  if (msg.includes("pregnan")) {
    return "If you might be pregnant, test after a missed period for best accuracy. If positive or you have symptoms like nausea/fatigue, consider a clinic visit 💕.";
  }
  if (msg.includes("irregular") && msg.includes("period")) {
    return "Irregular cycles can follow stress, diet changes, or hormonal shifts. Track for a few months; if it continues, a provider can help evaluate.";
  }
  if (msg.includes("stress") || msg.includes("sleep")) {
    return "Stress and sleep affect your cycle 🧘🏾‍♀️. Aim for a calming routine, gentle exercise, and screen-free wind‑down time before bed.";
  }
  return "That’s a thoughtful question 🌸. Could you share when this started and any changes around your cycle? I’ll tailor guidance for you.";
}

router.post("/", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ reply: "Please type a message first." });
    }
    // Optionally try OpenAI if available; fallback otherwise
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      try {
        const { OpenAI } = require("openai");
        const openai = new OpenAI({ apiKey });
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are BlooMee Buddy — warm, concise, helpful on women’s health." },
            { role: "user", content: message },
          ],
        });
        const aiReply = completion.choices?.[0]?.message?.content;
        if (aiReply) return res.json({ reply: aiReply });
      } catch (e) {
        // ignore and continue to local rules/heuristics
      }
    }

    const rulesAnswer = matchRule(message);
    if (rulesAnswer) return res.json({ reply: rulesAnswer });

    const heuristic = localBuddy(message);
    if (heuristic) return res.json({ reply: heuristic });

    return res.json({ reply: "I’m not sure about that, but I’m learning new things every day!" });
  } catch (error) {
    console.error("AI Buddy error:", error);
    return res.status(500).json({ reply: "I’m not sure about that, but I’m learning new things every day!" });
  }
});

module.exports = router;