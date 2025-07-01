// Fichier : script.js
// Version finale qui gère la structure de tutoriel en liste

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
      // CORRECTION FINALE APPLIQUÉE ICI
      // ======================================================================
      // 1. On vérifie que tutoData.tutorial est bien une liste.
      if (!Array.isArray(tutoData.tutorial)) {
        throw new Error("Le format du tutoriel reçu n'est pas une liste.");
      }

      // 2. On transforme la liste d'objets en une liste HTML (<ol><li>...</li></ol>)
      const tutorialHtml = tutoData.tutorial.map(stepObject => {
        // Pour chaque objet { "étape X": "texte" }, on extrait le texte.
        const stepText = Object.values(stepObject)[0];
        return `<li>${stepText}</li>`; // On l'entoure d'une balise <li>
      }).join(''); // On assemble toutes les balises <li> en une seule chaîne

      // 3. On affiche le titre et la liste numérotée (<ol>)
      tutoDetailDiv.innerHTML = `<h4>Procédure : ${title}</h4><ol>${tutorialHtml}</ol>`;
      
      // On lance la génération de l'image, car le tuto est maintenant affiché.
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