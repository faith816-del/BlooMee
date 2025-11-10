// test-gemini.js — paste this file into your backend folder
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const models = await genAI.listModels();
    console.log('--- Available models ---');
    console.log(models);
  } catch (err) {
    console.error('Error listing models:', err?.response?.data || err.message || err);
  }
}

listModels();