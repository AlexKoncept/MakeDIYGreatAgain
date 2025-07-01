// Fichier : netlify/functions/generate-image.js
// Version finale avec l'URL de l'API Clipdrop correcte.

const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const CLIPDROP_API_KEY = process.env.CLIPDROP_API_KEY;
  if (!CLIPDROP_API_KEY) return { statusCode: 500, body: JSON.stringify({ error: "CLIPDROP_API_KEY non configurée." }) };

  try {
    const { prompt } = JSON.parse(event.body);

    const form = new FormData();
    const finalPrompt = `Photo de haute qualité, style photographie de produit, d'un projet créatif DIY (fait maison) : "${prompt}". Sur fond uni.`;
    form.append('prompt', finalPrompt);

    // ======================================================================
    // CORRECTION DÉFINITIVE DE L'URL
    // ======================================================================
    const response = await fetch('https://api.clipdrop.co/v1/text-to-image', {
      method: 'POST',
      headers: { 
        'x-api-key': CLIPDROP_API_KEY, 
        ...form.getHeaders() 
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      // On log l'erreur pour le débogage mais on renvoie un message simple à l'utilisateur
      console.error(`Erreur API Clipdrop: ${response.status} - ${errorText}`);
      throw new Error(`Le service d'image a renvoyé une erreur.`);
    }

    const imageBuffer = await response.buffer();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ image: `data:image/png;base64,${imageBuffer.toString('base64')}` })
    };
  } catch (error) {
    console.error("Erreur dans la fonction generate-image:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};