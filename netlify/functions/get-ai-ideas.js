const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  const GROQ_API_KEY = process.env.GROQ_API_KEY; 
  if (!GROQ_API_KEY) return { statusCode: 500, body: JSON.stringify({ error: "Clé API Groq non configurée." }) };

  try {
    const body = JSON.parse(event.body);
    let prompt;

    if (body.materials) {
      prompt = `Tu es un expert du DIY. Propose 3 idées de projets avec ce matériel : "${body.materials}". Réponds uniquement avec un objet JSON qui contient une seule clé "projects", qui est une liste. Chaque élément de la liste doit avoir les clés "title" et "description".`;
    } else if (body.idea_title) {
      prompt = `Tu es un tuteur DIY. Rédige un mini-tutoriel en 3-4 étapes pour ce projet : "${body.idea_title}". Réponds uniquement avec un objet JSON contenant une seule clé "tutorial", qui est une LISTE d'objets. Chaque objet représente une étape et a la forme { "étape X": "texte de l'étape" }.`;
    } else {
      return { statusCode: 400, body: JSON.stringify({ error: "Requête invalide." }) };
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
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