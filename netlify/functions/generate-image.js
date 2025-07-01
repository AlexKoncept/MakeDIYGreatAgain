// Fichier : netlify/functions/generate-image.js
// NOUVELLE VERSION utilisant Fireworks.ai pour une meilleure fiabilité

const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  // On utilise la nouvelle clé API de Fireworks
  const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
  if (!FIREWORKS_API_KEY) return { statusCode: 500, body: JSON.stringify({ error: "FIREWORKS_API_KEY non configurée." }) };

  try {
    const { prompt } = JSON.parse(event.body);
    const finalPrompt = `Photo de haute qualité, style photographie de produit, d'un projet créatif DIY (fait maison) : "${prompt}". Sur fond uni, couleurs vives.`;

    const response = await fetch(
      // L'URL de l'API Fireworks pour Stable Diffusion
      'https://api.fireworks.ai/inference/v1/text_to_image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // L'authentification est plus simple
          'Authorization': `Bearer ${FIREWORKS_API_KEY}`, 
        },
        // Le corps de la requête est un simple objet JSON
        body: JSON.stringify({
          model: 'stable-diffusion-xl-1024-v1-0', // Un excellent modèle d'image
          prompt: finalPrompt,
          height: 1024,
          width: 1024,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur API Fireworks: ${response.status} - ${errorText}`);
      throw new Error(`Le service d'image Fireworks a renvoyé une erreur.`);
    }

    const data = await response.json();
    
    // Fireworks renvoie l'image directement en format base64
    const base64Image = data.artifacts[0].base64;

    return {
      statusCode: 200,
      body: JSON.stringify({ image: `data:image/png;base64,${base64Image}` })
    };
  } catch (error) {
    console.error("Erreur dans la fonction generate-image:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};