// Fichier : script.js
// Version de débogage pour voir la réponse du serveur

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
      
      const ideas = await response.json();

      // ======================================================================
      // LIGNE DE DÉBOGAGE CRUCIALE : On affiche la variable "ideas" dans la console
      console.log('Données brutes reçues du serveur (variable "ideas") :', ideas);
      // ======================================================================

      displayIdeas(ideas);

    } catch (error) {
      console.error(error); // Affiche l'erreur technique dans la console
      ideaListDiv.innerHTML = `<p>Désolé, une erreur est survenue : ${error.message}</p>`; // Affiche un message simple à l'utilisateur
    } finally {
      findProjectsButton.disabled = false;
    }
  });

  function displayIdeas(ideas) {
    // Si la réponse est un objet qui contient une clé "ideas" ou "result", on l'extrait
    // C'est une protection courante contre les variations de l'API
    const projectList = Array.isArray(ideas) ? ideas : ideas.ideas || ideas.result;

    if (!Array.isArray(projectList)) {
        console.error("La réponse finale n'est toujours pas un tableau :", projectList);
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