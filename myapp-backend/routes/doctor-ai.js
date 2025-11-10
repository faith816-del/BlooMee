const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple Q&A rules database
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

// 🧠 Local Doctor Brain — smart fallback system
function localDoctorBrain(message) {
  const msg = message.toLowerCase();

  // Pattern-based smart logic
  if (msg.includes("cramp")) {
    return "It sounds like you're dealing with cramps 😣. Try placing a warm compress on your lower belly, drink plenty of water, and stretch lightly. If the pain feels stronger than usual or lasts more than 3 days, it’s good to talk to a doctor 👩🏾‍⚕️.";
  }

  if (msg.includes("late") && msg.includes("period")) {
    return "A late period can happen due to stress, hormonal shifts, or diet changes 🌸. If it’s over a week late, you might take a test or check with a doctor just to be sure.";
  }

  if (msg.includes("discharge")) {
    return "Healthy discharge is usually clear or white. But if it’s thick, colored, has a strong smell, or comes with itching, it might be an infection — you should see a doctor soon 👩🏾‍⚕️.";
  }

  if (msg.includes("pregnan")) {
    return "If you think you might be pregnant, wait until your missed period to take a test. If it’s positive or you have symptoms like nausea or fatigue, book a visit 💕.";
  }

  if (msg.includes("pain")) {
    return "Pain is your body’s way of signaling something. Track when and where it happens, and if it’s severe or unusual, reach out to a healthcare provider 👩🏾‍⚕️.";
  }

  if (msg.includes("mood") || msg.includes("sad") || msg.includes("angry")) {
    return "Mood swings are common during hormonal changes 💗. Try some rest, light exercise, or journaling. If you feel persistently low or anxious, reach out — you don’t have to face it alone.";
  }

  if (msg.includes("pms")) {
    return "PMS symptoms can include bloating, mood swings, or fatigue. Balanced meals, hydration, and enough sleep can really help 🌷.";
  }

  if (msg.includes("irregular") && msg.includes("period")) {
    return "Irregular periods are often linked to stress, diet, or hormones. Try tracking your cycle with a period app — if it stays irregular for 3 months, consult a doctor.";
  }

  if (msg.includes("hormone")) {
    return "Hormones fluctuate naturally, but imbalance can cause acne, mood swings, or irregular cycles. A blood test from your doctor can confirm what’s happening 🩸.";
  }

  if (msg.includes("stress")) {
    return "Stress affects both mind and body 🧘🏾‍♀️. Deep breathing, walks, or journaling can calm your system and help your cycle regulate over time.";
  }

  if (msg.includes("sleep")) {
    return "Good sleep helps regulate your hormones. Try a consistent bedtime and avoid screens 30 minutes before sleep 🌙.";
  }

  // ✨ Default fallback response (smart general advice)
  return (
    "That’s an interesting question 🌸. From what you’ve said, it might relate to hormonal or menstrual health. " +
    "Could you tell me how long you’ve noticed it or if it changes during your period? " +
    "That’ll help me guide you better 👩🏾‍⚕️."
  );
}

// 🩺 Main Route
router.post("/", async (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ reply: "Please type a message first." });
  }

  try {
    // Try OpenAI first
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Doctor AI — a warm, caring, female health assistant. You give calm, short, medically-safe advice in plain language.",
        },
        { role: "user", content: message },
      ],
    });

    const aiReply = completion.choices[0].message.content;
    res.json({ reply: aiReply });
  } catch (error) {
    console.error("⚠️ OpenAI failed — using localDoctorBrain():", error.message);
    // 1) Try Q&A rules
    const rules = matchRule(message);
    if (rules) return res.json({ reply: rules });

    // 2) Local heuristic fallback
    const fallbackReply = localDoctorBrain(message);
    return res.json({ reply: fallbackReply });
  }
});

module.exports = router;