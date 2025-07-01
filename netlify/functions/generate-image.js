// Fichier : netlify/functions/generate-image.js
// VERSION FINALE utilisant l'API gratuite et fiable de Hugging Face

const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  // On utilise la clé API Hugging Face
  const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
  if (!HUGGINGFACE_API_KEY) return { statusCode: 500, body: JSON.stringify({ error: "HUGGINGFACE_API_KEY non configurée." }) };

  try {
    const { prompt } = JSON.parse(event.body);
    // Un prompt efficace pour Stable Diffusion
    const finalPrompt = `(best quality, 4k, 8k, ultra highres), masterpiece, a professional photo of a DIY project: ${prompt}. Product shot, studio lighting, plain background.`;
    
    // Appel à l'API d'inférence de Hugging Face avec un modèle Stable Diffusion éprouvé
    const response = await fetch(
      'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // L'authentification est un simple Bearer token
          'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`, 
        },
        // Le corps de la requête est encore plus simple : juste une clé "inputs"
        body: JSON.stringify({
          inputs: finalPrompt,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur API Hugging Face: ${response.status} - ${errorText}`);
      // Si le modèle est en train de charger, on renvoie un message clair
      if (response.status === 503) {
        throw new Error("Le modèle d'image est en cours de chargement, veuillez patienter 30 secondes et réessayer.");
      }
      throw new Error(`Le service d'image Hugging Face a renvoyé une erreur.`);
    }

    // Hugging Face renvoie directement l'image binaire, pas du JSON
    const imageBuffer = await response.buffer();
    
    return {
      statusCode: 200,
      // On convertit le buffer en base64 pour l'afficher dans le navigateur
      body: JSON.stringify({ image: `data:image/jpeg;base64,${imageBuffer.toString('base64')}` })
    };
  } catch (error) {
    console.error("Erreur dans la fonction generate-image:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};