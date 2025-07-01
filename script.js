// Fichier : script.js
// Version de débogage pour voir la réponse du TUTORIEL

document.addEventListener('DOMContentLoaded', function() {
  const findProjectsButton = document.querySelector('.bot-section button');
  const materiauxInput = document.getElementById('materiaux');
  const ideaListDiv = document.getElementById('ideaList');
  const tutoDetailDiv = document.getElementById('tutoDetail');
  const imageContainer = document.getElementById('imageGeneratorContainer');

  findProjectsButton.addEventListener('click', async () => {
    const materials = materiauxInput.value;
    if (materials.trim() === '') {
      ideaListDiv.innerHTML = '<p>Veuillez décrire le matériel dont vous disposez.</p>';
      return;
    }
    ideaListDiv.innerHTML = '<p>Recherche d\'idées en cours...</p>';
    tutoDetailDiv.innerHTML = '';
    imageContainer.innerHTML = '';
    findProjectsButton.disabled = true;
    try {
      const response = await fetch('/.netlify/functions/get-ai-ideas', {
        method: 'POST',
        body: JSON.stringify({ materials: materials })
      });
      if (!response.ok) throw new Error('Erreur lors de la génération des idées.');
      const ideasData = await response.json();
      displayIdeas(ideasData.projects);
    } catch (error) {
      console.error(error);
      ideaListDiv.innerHTML = `<p>Désolé, une erreur est survenue : ${error.message}</p>`;
    } finally {
      findProjectsButton.disabled = false;
    }
  });

  function displayIdeas(projectList) {
    ideaListDiv.innerHTML = '<h3>Cliquez sur une idée pour obtenir le tuto :</h3>';
    projectList.forEach(idea => {
      const ideaElement = document.createElement('div');
      ideaElement.className = 'idea-item';
      ideaElement.innerHTML = `<h4>${idea.title}</h4><p>${idea.description}</p>`;
      ideaElement.addEventListener('click', () => {
        document.querySelectorAll('.idea-item').forEach(el => el.classList.remove('selected'));
        ideaElement.classList.add('selected');
        getTutorialForIdea(idea.title);
      });
      ideaListDiv.appendChild(ideaElement);
    });
  }

  async function getTutorialForIdea(title) {
    tutoDetailDiv.innerHTML = '<p>Génération du tutoriel en cours...</p>';
    imageContainer.innerHTML = '';
    try {
      const response = await fetch('/.netlify/functions/get-ai-ideas', {
        method: 'POST',
        body: JSON.stringify({ idea_title: title })
      });
      if (!response.ok) throw new Error('Erreur lors de la génération du tutoriel.');
      
      const tutoData = await response.json();

      // ======================================================================
      // LIGNE DE DÉBOGAGE POUR LE TUTORIEL
      console.log('Données brutes du tutoriel (tutoData) :', tutoData);
      // ======================================================================

      tutoDetailDiv.innerHTML = `<h4>Procédure : ${title}</h4><p>${tutoData.tutorial.replace(/\n/g, '<br>')}</p>`;
      generateImageForIdea(title);

    } catch (error) {
      console.error(error);
      tutoDetailDiv.innerHTML = `<p>Désolé, impossible de générer le tutoriel : ${error.message}</p>`;
    }
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