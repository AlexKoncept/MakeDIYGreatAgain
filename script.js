// Fichier : netlify/functions/generate-image.js
const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const CLIPDROP_API_KEY = process.env.CLIPDROP_API_KEY;
  if (!CLIPDROP_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "Erreur serveur: La clé API Clipdrop n'est pas configurée." }) };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const form = new FormData();
    form.append('prompt', prompt);

    const response = await fetch('https://api.clipdrop.co/v1/text-to-image', {
      method: 'POST',
      headers: {
        'x-api-key': CLIPDROP_API_KEY,
        ...form.getHeaders() // On remet cette ligne cruciale
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur de l'API Clipdrop: ${response.status}`, errorText);
      throw new Error(`Clipdrop API Error: ${errorText}`);
    }

    const imageBuffer = await response.buffer();
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: `data:image/png;base64,${imageBuffer.toString('base64')}`
      })
    };

  } catch (error) {
    console.error("Erreur dans la fonction generate-image:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};