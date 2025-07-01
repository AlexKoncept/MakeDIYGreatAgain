// Fichier : script.js
// Version finale et fonctionnelle

document.addEventListener('DOMContentLoaded', function() {
  const findProjectsButton = document.querySelector('.bot-section button');
  const materiauxInput = document.getElementById('materiaux');
  const ideaListDiv = document.getElementById('ideaList');
  const imageContainer = document.getElementById('imageGeneratorContainer');

  findProjectsButton.addEventListener('click', async () => {
    const materials = materiauxInput.value;
    if (materials.trim() === '') {
      ideaListDiv.innerHTML = '<p>Veuillez décrire le matériel dont vous disposez.</p>';
      return;
    }

    ideaListDiv.innerHTML = '<p>Recherche d\'idées en cours...</p>';
    imageContainer.innerHTML = '';
    findProjectsButton.disabled = true;

    try {
      const response = await fetch('/.netlify/functions/get-ai-ideas', {
        method: 'POST',
        body: JSON.stringify({ materials: materials })
      });

      if (!response.ok) {
        throw new Error('Le serveur a renvoyé une réponse négative.');
      }
      
      const ideasData = await response.json();
      displayIdeas(ideasData);

    } catch (error) {
      console.error(error);
      ideaListDiv.innerHTML = `<p>Désolé, une erreur est survenue : ${error.message}</p>`;
    } finally {
      findProjectsButton.disabled = false;
    }
  });

  function displayIdeas(ideasData) {
    // ======================================================================
    // CORRECTION APPLIQUÉE ICI
    // On extrait la liste de la clé "projects" à l'intérieur de l'objet reçu.
    const projectList = ideasData.projects;
    // ======================================================================

    if (!Array.isArray(projectList)) {
        console.error("La liste de projets est introuvable dans la réponse :", ideasData);
        throw new Error("Le format des données reçues est incorrect.");
    }
      
    ideaListDiv.innerHTML = '<h3>Cliquez sur une idée pour la visualiser :</h3>';
    
    projectList.forEach(idea => {
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

  async function generateImageForIdea(prompt) {
    imageContainer.innerHTML = '<p>Génération du visuel en cours...</p>';
    try {
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