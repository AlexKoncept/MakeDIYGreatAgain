// IL N'Y A PLUS AUCUNE CLÉ D'API ICI. C'EST LA VERSION 100% SÉCURISÉE ET COMPLÈTE.

// --- SÉLECTION DES ÉLÉMENTS DU DOM ---
const materialsInput = document.getElementById('materiaux');
const suggestButton = document.querySelector('.bot-section button');
const ideaListDiv = document.getElementById('ideaList');
const tutoDetailDiv = document.getElementById('tutoDetail');
const imageContainer = document.getElementById('imageGeneratorContainer');

// --- ÉVÉNEMENTS ---
suggestButton.addEventListener('click', getProjectIdeas);

// --- FONCTION UTILITAIRE POUR EXTRAIRE LE JSON ---
function extractJson(text) {
  const jsonRegex = /\[\s*\{[\s\S]*\}\s*\]|\{\s*\"[\s\S]*\}\s*/;
  const match = text.match(jsonRegex);
  return match ? match[0] : null;
}


// =========================================================================
// ÉTAPE 1 : OBTENIR LES IDÉES DE PROJETS VIA NOTRE FONCTION SERVERLESS
// =========================================================================
async function getProjectIdeas() {
  const materials = materialsInput.value;

  // Logique pour vérifier le champ
  if (!materials.trim()) {
    ideaListDiv.innerHTML = "<p>Décris d'abord le matériel que tu possèdes !</p>";
    return;
  }

  // Logique pour l'interface utilisateur (désactiver le bouton, etc.)
  suggestButton.disabled = true;
  suggestButton.innerText = "L'IA cherche des idées...";
  ideaListDiv.innerHTML = "<p>Génération des idées en cours...</p>";
  tutoDetailDiv.innerHTML = '';
  imageContainer.innerHTML = '';

  // Votre prompt pour Groq
  const prompt = `Tu es "DIYBot". Propose 3 idées de projets uniques avec le matériel : "${materials}". Réponds UNIQUEMENT avec un tableau JSON valide au format [{"titre": "Nom du projet"}].`;

  try {
    // APPEL SÉCURISÉ : On appelle notre propre fonction
    const response = await fetch('/.netlify/functions/get-ai-ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt })
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Le serveur a répondu avec une erreur: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const rawResponseText = data.choices[0]?.message?.content;
    const ideasJsonString = extractJson(rawResponseText);
    
    if (!ideasJsonString) {
      throw new Error("La réponse de l'IA ne contient pas de JSON valide.");
    }

    const ideas = JSON.parse(ideasJsonString);
    ideaListDiv.innerHTML = '';
    // Logique pour afficher les idées
    ideas.forEach(idea => {
      const button = document.createElement('button');
      button.className = 'idea-button';
      button.innerText = idea.titre;
      button.onclick = () => getProjectDetails(idea.titre, materials);
      ideaListDiv.appendChild(button);
    });
    
  } catch (error) {
    console.error("Erreur détaillée (Génération d'idées):", error);
    ideaListDiv.innerHTML = `<p>Oups, une erreur est survenue. Détails : ${error.message}</p>`;
  } finally {
    // Logique pour réactiver le bouton
    suggestButton.disabled = false;
    suggestButton.innerText = "Trouve-moi des projets !";
  }
}

// =========================================================================
// ÉTAPE 2 : OBTENIR LE TUTORIEL DÉTAILLÉ (VIA NOTRE FONCTION SERVERLESS)
// =========================================================================
async function getProjectDetails(projectTitle, materials) {
  tutoDetailDiv.innerHTML = `<p>Génération du mini-tuto pour "${projectTitle}"...</p>`;
  imageContainer.innerHTML = '';

  // Prompt pour le tutoriel
  const prompt = `Tu es "DIYBot", un expert en bricolage. Rédige un mini-tutoriel pour le projet suivant : "${projectTitle}", en utilisant le matériel de base : "${materials}". Structure ta réponse avec les titres ### Matériaux supplémentaires, ### Étapes clés, et ### Astuce du Maker.`;

  try {
    // On réutilise la même fonction serverless car elle appelle la même IA (Groq)
    const response = await fetch('/.netlify/functions/get-ai-ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt })
    });

    if (!response.ok) throw new Error('Erreur du serveur pour le tutoriel');

    const data = await response.json();
    const tuto = data.choices[0]?.message?.content;
    tutoDetailDiv.innerText = tuto;

    // Une fois le tuto affiché, on affiche le bouton pour générer l'image
    displayImageGeneratorUI(projectTitle);
    
  } catch (error) {
    console.error("Erreur (Génération du tuto):", error);
    tutoDetailDiv.innerHTML = "<p>Impossible de générer le tutoriel pour le moment. Réessaye !</p>";
  }
}


// =========================================================================
// ÉTAPE 3 : GÉNÉRER L'IMAGE VIA NOTRE FONCTION SERVERLESS
// =========================================================================
function displayImageGeneratorUI(projectTitle) {
  imageContainer.innerHTML = '';
  const imageButton = document.createElement('button');
  imageButton.className = 'image-button';
  imageButton.innerText = 'Générer une image du projet';
  imageButton.onclick = () => generateProjectImage(projectTitle, imageButton);
  imageContainer.appendChild(imageButton);
}

async function generateProjectImage(projectTitle, button) {
  // Logique pour l'interface utilisateur
  button.disabled = true;
  button.innerText = 'L\'IA dessine...';

  // Prompt pour l'image
  const imagePrompt = `photo of a creative DIY project: "${projectTitle}". Product shot on a wooden workbench, detailed, cinematic lighting, homemade aesthetic.`;

  try {
    // APPEL SÉCURISÉ : On appelle notre propre fonction
    const response = await fetch('/.netlify/functions/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: imagePrompt }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Le serveur d'image a répondu avec une erreur: ${response.status} - ${errorText}`);
    }

    const imageBlob = await response.blob();
    const imageUrl = URL.createObjectURL(imageBlob);
    
    // Logique pour afficher l'image
    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = `Image générée pour le projet : ${projectTitle}`;
    
    imageContainer.innerHTML = ''; 
    imageContainer.appendChild(imgElement);

  } catch (error) {
    console.error("Erreur (Génération d'image):", error);
    // On affiche l'erreur dans le conteneur pour le débogage
    imageContainer.innerHTML = `<p>Oups, impossible de générer l'image. Détails: ${error.message}</p>`;
    // On ne réactive pas le bouton pour ne pas spammer une requête qui échoue
  }
}
