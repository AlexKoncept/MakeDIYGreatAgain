// Fichier : script.js (à la racine de votre projet)
// Version corrigée avec le bon nom de fonction : get-ai-ideas

document.addEventListener('DOMContentLoaded', function() {
  const findProjectsButton = document.querySelector('.bot-section button');
  const materiauxInput = document.getElementById('materiaux');
  const ideaListDiv = document.getElementById('ideaList');
  const imageContainer = document.getElementById('imageGeneratorContainer');

  // ---- FONCTION 1 : Gérer le clic sur le bouton principal ----
  findProjectsButton.addEventListener('click', async () => {
    const materials = materiauxInput.value;
    if (materials.trim() === '') {
      ideaListDiv.innerHTML = '<p>Veuillez décrire le matériel dont vous disposez.</p>';
      return;
    }

    // Afficher un état de chargement
    ideaListDiv.innerHTML = '<p>Recherche d\'idées en cours...</p>';
    imageContainer.innerHTML = ''; // Nettoyer l'ancienne image
    findProjectsButton.disabled = true;

    try {
      // Appel à notre 1ère fonction Netlify avec le bon nom
      const response = await fetch('/.netlify/functions/get-ai-ideas', { // <-- CORRECTION APPLIQUÉE ICI
        method: 'POST',
        body: JSON.stringify({ materials: materials })
      });

      if (!response.ok) throw new Error('Erreur lors de la génération des idées.');
      
      const ideas = await response.json();
      displayIdeas(ideas);

    } catch (error) {
      console.error(error);
      ideaListDiv.innerHTML = `<p>Désolé, une erreur est survenue : ${error.message}</p>`;
    } finally {
      findProjectsButton.disabled = false;
    }
  });

  // ---- FONCTION 2 : Afficher les idées et les rendre cliquables ----
  function displayIdeas(ideas) {
    ideaListDiv.innerHTML = '<h3>Cliquez sur une idée pour la visualiser :</h3>';
    
    ideas.forEach(idea => {
      const ideaElement = document.createElement('div');
      ideaElement.className = 'idea-item';
      ideaElement.innerHTML = `<h4>${idea.title}</h4><p>${idea.description}</p>`;
      
      ideaElement.addEventListener('click', () => {
        document.querySelectorAll('.idea-item').forEach(el => el.classList.remove('selected'));
        ideaElement.classList.add('selected');
        
        generateImageForIdea(idea.title);
      });
      
      ideaListDiv.appendChild(ideaElement);
    });
  }

  // ---- FONCTION 3 : Appeler la fonction d'image et afficher le résultat ----
  async function generateImageForIdea(prompt) {
    imageContainer.innerHTML = '<p>Génération du visuel en cours...</p>';
    
    try {
      // L'URL pour generate-image était déjà correcte
      const response = await fetch('/.netlify/functions/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: prompt })
      });
      
      if (!response.ok) throw new Error('Erreur lors de la génération de l\'image.');

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      imageContainer.innerHTML = `<img src="${data.image}" alt="Visualisation du projet : ${prompt}">`;

    } catch (error) {
      console.error(error);
      imageContainer.innerHTML = `<p>Désolé, impossible de générer l'image : ${error.message}</p>`;
    }
  }
});