// Fichier : netlify/functions/get-ai-ideas.js
// Version améliorée avec des logs de débogage

const fetch = require('node-fetch');

exports.handler = async (event) => {
  console.log('La fonction get-ai-ideas a été appelée.'); // LOG 1

  if (event.httpMethod !== 'POST') {
    const errorMsg = 'Méthode non autorisée. Seul POST est accepté.';
    console.error(errorMsg);
    return { statusCode: 405, body: errorMsg };
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY; 
  if (!GROQ_API_KEY) {
    const errorMsg = "ERREUR CRITIQUE : La variable d'environnement GROQ_API_KEY est manquante ou vide.";
    console.error(errorMsg); // LOG 2
    return { statusCode: 500, body: JSON.stringify({ error: errorMsg }) };
  }
  
  console.log('Clé API Groq trouvée.'); // LOG 3

  try {
    const { materials } = JSON.parse(event.body);
    console.log('Matériaux reçus :', materials); // LOG 4

    const prompt = `Tu es un expert du DIY (Do It Yourself) et de l'upcycling. Propose 3 idées de projets créatifs, courts et originaux à réaliser avec le matériel suivant : "${materials}". Réponds uniquement sous forme de liste JSON valide. Chaque idée doit avoir une clé "title" et une clé "description". Exemple de format : [{"title": "Titre 1", "description": "Description 1"}, {"title": "Titre 2", "description": "Description 2"}]`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorMsg = `L'API Groq a renvoyé une erreur. Statut: ${response.status}. Réponse: ${errorText}`;
      console.error(errorMsg); // LOG 5
      throw new Error(errorMsg);
    }

    console.log('Réponse de Groq reçue avec succès.'); // LOG 6
    const data = await response.json();
    const ideas = JSON.parse(data.choices[0].message.content);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ideas),
    };

  } catch (error) {
    const errorMsg = `Une erreur est survenue dans le bloc try-catch : ${error.message}`;
    console.error(errorMsg); // LOG 7
    return { statusCode: 500, body: JSON.stringify({ error: errorMsg }) };
  }
};