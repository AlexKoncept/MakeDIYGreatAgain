// Fichier : netlify/functions/get-ai-ideas.js
// La ligne "require('node-fetch')" a été supprimée.

const GROQ_API_KEY = process.env.GROQ_API_KEY;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  const { prompt } = JSON.parse(event.body);

  try {
    // Utilise le fetch natif, pas besoin de la variable "fetch"
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], model: 'llama3-8b-8192' })
    });
    
    if (!response.ok) throw new Error(response.statusText);

    const data = await response.json();
    return { statusCode: 200, body: JSON.stringify(data) };

  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};