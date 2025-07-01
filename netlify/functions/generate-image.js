// Fichier : netlify/functions/generate-image.js
// Version améliorée avec des logs de débogage

const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async (event) => {
  console.log('LOG 1: La fonction generate-image a été appelée.');

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const CLIPDROP_API_KEY = process.env.CLIPDROP_API_KEY;
  if (!CLIPDROP_API_KEY) {
    const errorMsg = "LOG 2: ERREUR CRITIQUE : La variable d'environnement CLIPDROP_API_KEY est manquante.";
    console.error(errorMsg);
    return { statusCode: 500, body: JSON.stringify({ error: errorMsg }) };
  }
  
  console.log('LOG 3: Clé API Clipdrop trouvée.');

  try {
    const { prompt } = JSON.parse(event.body);
    console.log('LOG 4: Prompt reçu pour l\'image :', prompt);

    const form = new FormData();
    const finalPrompt = `Photo de haute qualité d'un projet créatif DIY (fait maison) : "${prompt}". Style épuré, sur fond uni, photographie de produit.`;
    form.append('prompt', finalPrompt);
    console.log('LOG 5: Prompt final envoyé à Clipdrop :', finalPrompt);

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
      const errorMsg = `LOG 6: L'API Clipdrop a renvoyé une erreur. Statut: ${response.status}. Réponse: ${errorText}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('LOG 7: Réponse de Clipdrop reçue avec succès.');
    const imageBuffer = await response.buffer();
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: `data:image/png;base64,${imageBuffer.toString('base64')}`
      })
    };

  } catch (error) {
    const errorMsg = `LOG 8: Une erreur est survenue dans le bloc try-catch de generate-image : ${error.message}`;
    console.error(errorMsg);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMsg })
    };
  }
};