// Fichier : netlify/functions/generate-image.js
// Version de débogage pour Fireworks.ai

const fetch = require('node-fetch');

exports.handler = async (event) => {
  console.log('LOG 1: La fonction generate-image (version Fireworks) a été appelée.');

  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const FIREWORKS_API_KEY = process.env.FIREWORKS_API_KEY;
  if (!FIREWORKS_API_KEY || FIREWORKS_API_KEY === '') {
    const errorMsg = "LOG 2: ERREUR CRITIQUE : La variable d'environnement FIREWORKS_API_KEY est manquante ou vide.";
    console.error(errorMsg);
    return { statusCode: 500, body: JSON.stringify({ error: errorMsg }) };
  }
  
  console.log('LOG 3: Clé API Fireworks trouvée (commence par: ' + FIREWORKS_API_KEY.substring(0, 5) + '...).');

  try {
    const { prompt } = JSON.parse(event.body);
    console.log('LOG 4: Prompt reçu :', prompt);

    const finalPrompt = `Photo de haute qualité, style photographie de produit, d'un projet créatif DIY (fait maison) : "${prompt}". Sur fond uni, couleurs vives.`;
    const requestBody = {
      model: 'stable-diffusion-xl-1024-v1-0',
      prompt: finalPrompt,
      height: 1024,
      width: 1024,
    };
    
    console.log('LOG 5: Corps de la requête envoyé à Fireworks :', JSON.stringify(requestBody, null, 2));

    const response = await fetch(
      'https://api.fireworks.ai/inference/v1/text_to_image',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${FIREWORKS_API_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      const errorMsg = `LOG 6: L'API Fireworks a renvoyé une erreur. Statut: ${response.status}. Réponse: ${errorText}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('LOG 7: Réponse de Fireworks reçue avec succès.');
    const data = await response.json();
    const base64Image = data.artifacts[0].base64;

    return {
      statusCode: 200,
      body: JSON.stringify({ image: `data:image/png;base64,${base64Image}` })
    };
  } catch (error) {
    const errorMsg = `LOG 8: Une erreur est survenue dans le bloc try-catch : ${error.message}`;
    console.error(errorMsg);
    return { statusCode: 500, body: JSON.stringify({ error: errorMsg }) };
  }
};