// Fichier : netlify/functions/generate-image.js
// AUCUN require ici !

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
    
    // On utilise l'objet FormData natif de Node.js
    const form = new FormData();
    form.append('prompt', prompt);

    // On utilise le fetch natif de Node.js
    const response = await fetch('https://api.clipdrop.co/v1/text-to-image', {
      method: 'POST',
      headers: {
        'x-api-key': CLIPDROP_API_KEY,
        // PAS besoin de .getHeaders() avec le fetch natif, c'est automatique !
      },
      body: form,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur de l'API Clipdrop: ${response.status}`, errorText);
      throw new Error(`Clipdrop API Error: ${errorText}`);
    }

    // On doit utiliser .arrayBuffer() avec le fetch natif, puis le convertir en Buffer
    const imageArrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(imageArrayBuffer);
    
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