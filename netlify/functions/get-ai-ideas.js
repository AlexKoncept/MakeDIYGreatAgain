// Fichier : netlify/functions/get-ai-ideas.js
// Version avec une instruction stricte pour la langue française

const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const GROQ_API_KEY = process.env.GROQ_API_KEY; 
  if (!GROQ_API_KEY) return { statusCode: 500, body: JSON.stringify({ error: "Clé API Groq non configurée." }) };

  try {
    const body = JSON.parse(event.body);
    let prompt;

    // CAS 1: Obtenir des idées de projets
    if (body.materials) {
      // Instruction ajoutée : La réponse doit être entièrement en français.
      prompt = `Tu es un ingénieur Maker et un expert en upcycling. Ton public est débutant. Propose 3 idées de projets pratiques, réalistes et réalisables avec le matériel suivant : "${body.materials}". La réponse doit être entièrement en français. Ignore les idées farfelues ou impossibles. Chaque idée doit être concise. Réponds uniquement avec un objet JSON qui contient une seule clé "projects", qui est une liste. Chaque élément de la liste doit avoir les clés "title" et "description".`;
    } 
    // CAS 2: Obtenir un tutoriel
    else if (body.idea_title) {
      // Instruction ajoutée : Rédige le tutoriel en français.
      prompt = `Tu es un tuteur DIY qui s'adresse à des débutants. Rédige un tutoriel simple, concret et réalisable en 4 étapes maximum pour le projet suivant : "${body.idea_title}". Rédige le tutoriel en français. Le tutoriel doit se concentrer sur des actions physiques claires (ex: "Couper le bois", "Percer un trou"). N'invente pas d'étapes abstraites. Réponds uniquement avec un objet JSON contenant une seule clé "tutorial", qui est une LISTE d'objets. Chaque objet représente une étape et a la forme { "étape X": "texte de l'étape" }.`;
    } 
    else {
      return { statusCode: 400, body: JSON.stringify({ error: "Requête invalide." }) };
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Groq: ${errorText}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return { statusCode: 200, body: JSON.stringify(content) };
  } catch (error) {
    console.error("Erreur dans get-ai-ideas:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};