// Fichier : netlify/functions/generate-image.js
// Version améliorée avec des logs de débogage

const fetch = require('node-fetch');
const FormData = require('form-data');

exports.handler = async (event) => {
  console.log('La fonction generate-image a été appelée.'); // LOG 1

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const CLIPDROP_API_KEY = process.env.CLIPDROP_API_KEY;
  if (!CLIPDROP_API_KEY) {
    const errorMsg = "ERREUR CRITIQUE : La variable d'environnement CLIPDROP_API_KEY est manquante.";
    console.error(errorMsg); // LOG 2
    return { statusCode: 500, body: JSON.stringify({ error: errorMsg }) };
  }
  
  console.log('Clé API Clipdrop trouvée.'); // LOG 3

  try {
    const { prompt } = JSON.parse(event.body);
    console.log('Prompt reçu pour l\'image :', prompt); // LOG 4

    const form = new FormData();
    // Amélioration du prompt pour de meilleurs résultats visuels
    const finalPrompt = `Photo de haute qualité d'un projet créatif DIY (fait maison) : "${prompt}". Style épuré, sur fond uni.`;
    form.append('prompt', finalPrompt);
    console.log('Prompt final envoyé à Clipdrop :', finalPrompt); // LOG 5

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
      const errorMsg = `L'API Clipdrop a renvoyé une erreur. Statut: ${response.status}. Réponse: ${errorText}`;
      console.error(errorMsg); // LOG 6
      throw new Error(errorMsg);
    }

    console.log('Réponse de Clipdrop reçue avec succès.'); // LOG 7
    const imageBuffer = await response.buffer();
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: `data:image/png;base64,${imageBuffer.toString('base64')}`
      })
    };

  } catch (error) {
    const errorMsg = `Une erreur est survenue dans le bloc try-catch de generate-image : ${error.message}`;
    console.error(errorMsg); // LOG 8
    return {
      statusCode: 500,
      body: JSON.stringify({ error: errorMsg })
    };
  }
};