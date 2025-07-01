// Fichier : netlify/functions/get-ai-ideas.js
// Version finale capable de générer des idées ET des tutoriels

const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const GROQ_API_KEY = process.env.GROQ_API_KEY; 
  if (!GROQ_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: "Clé API Groq non configurée." }) };
  }

  try {
    const body = JSON.parse(event.body);
    let prompt;
    let responseFormat = { type: "json_object" }; // Par défaut, on attend du JSON

    // CAS 1 : On demande une liste d'idées à partir de matériel
    if (body.materials) {
      prompt = `Tu es un expert du DIY et de l'upcycling. Propose 3 idées de projets créatifs avec le matériel suivant : "${body.materials}". Réponds uniquement avec un objet JSON qui contient une seule clé "projects", qui est une liste. Chaque élément de la liste doit avoir les clés "title" et "description".`;
    } 
    // CAS 2 : On demande un tutoriel pour une idée précise
    else if (body.idea_title) {
      prompt = `Tu es un tuteur DIY clair et concis. Rédige un mini-tutoriel en 3 ou 4 étapes simples pour réaliser le projet suivant : "${body.idea_title}". Réponds uniquement avec un objet JSON contenant une seule clé "tutorial", dont la valeur est le texte du tutoriel.`;
      responseFormat = { type: "json_object" }; // On attend aussi du JSON pour le tuto
    } 
    // Si la requête est invalide
    else {
      return { statusCode: 400, body: JSON.stringify({ error: "Requête invalide." }) };
    }

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
        response_format: responseFormat,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur API Groq: ${errorText}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return {
      statusCode: 200,
      body: JSON.stringify(content),
    };

  } catch (error) {
    console.error("Erreur dans get-ai-ideas:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};