// Fichier : script.js
// Nouvelle version suivant la logique en 3 temps : Idées -> Tuto -> Image

document.addEventListener('DOMContentLoaded', function() {
  // Sélection des éléments de la page
  const findProjectsButton = document.querySelector('.bot-section button');
  const materiauxInput = document.getElementById('materiaux');
  const ideaListDiv = document.getElementById('ideaList');
  const tutoDetailDiv = document.getElementById('tutoDetail');
  const imageContainer = document.getElementById('imageGeneratorContainer');

  // --- ACTION 1 : Clic sur "Trouve-moi des projets !" ---
  findProjectsButton.addEventListener('click', getIdeas);

  async function getIdeas() {
    const materials = materiauxInput.value;
    if (materials.trim() === '') {
      ideaListDiv.innerHTML = '<p>Veuillez décrire le matériel dont vous disposez.</p>';
      return;
    }

    // Réinitialiser l'interface pour une nouvelle recherche
    ideaListDiv.innerHTML = '<p>Recherche d\'idées en cours...</p>';
    tutoDetailDiv.innerHTML = '';
    imageContainer.innerHTML = '';
    findProjectsButton.disabled = true;

    try {
      const response = await fetch('/.netlify/functions/get-ai-ideas', {
        method: 'POST',
        body: JSON.stringify({ materials: materials })
      });
      if (!response.ok) throw new Error('Erreur serveur lors de la recherche d\'idées.');
      
      const ideasData = await response.json();
      displayIdeas(ideasData.projects);

    } catch (error) {
      console.error(error);
      ideaListDiv.innerHTML = `<p>Désolé, une erreur est survenue : ${error.message}</p>`;
    } finally {
      findProjectsButton.disabled = false;
    }
  }

  // --- ACTION 2 : Afficher les idées et les rendre cliquables ---
  function displayIdeas(projectList) {
    ideaListDiv.innerHTML = '<h3>Cliquez sur une idée pour obtenir le tuto :</h3>';
    
    projectList.forEach(idea => {
      const ideaElement = document.createElement('div');
      ideaElement.className = 'idea-item';
      ideaElement.innerHTML = `<h4>${idea.title}</h4><p>${idea.description}</p>`;
      
      ideaElement.addEventListener('click', () => {
        // Mettre en surbrillance l'idée sélectionnée
        document.querySelectorAll('.idea-item').forEach(el => el.classList.remove('selected'));
        ideaElement.classList.add('selected');
        // Passer à l'étape suivante : obtenir le tutoriel
        getTutorialForIdea(idea.title);
      });
      
      ideaListDiv.appendChild(ideaElement);
    });
  }

  // --- ACTION 3 : Obtenir et afficher le tutoriel ET le bouton pour l'image ---
  async function getTutorialForIdea(title) {
    tutoDetailDiv.innerHTML = '<p>Génération du tutoriel en cours...</p>';
    imageContainer.innerHTML = ''; // Vider l'ancienne image

    try {
      const response = await fetch('/.netlify/functions/get-ai-ideas', {
        method: 'POST',
        body: JSON.stringify({ idea_title: title })
      });
      if (!response.ok) throw new Error('Erreur serveur lors de la génération du tutoriel.');
      
      const tutoData = await response.json();
      
      const tutorialHtml = tutoData.tutorial.map(stepObject => {
        const stepText = Object.values(stepObject)[0];
        return `<li>${stepText}</li>`;
      }).join('');

      // Afficher le tutoriel complet
      tutoDetailDiv.innerHTML = `<h4>Procédure : ${title}</h4><ol>${tutorialHtml}</ol>`;

      // NOUVEAU : On crée dynamiquement un bouton pour générer l'image
      const generateImageBtn = document.createElement('button');
      generateImageBtn.textContent = 'Générer un visuel du projet';
      // Quand on clique sur ce nouveau bouton, on appelle la fonction pour l'image
      generateImageBtn.addEventListener('click', () => {
        generateImageBtn.disabled = true;
        generateImageBtn.textContent = 'Génération en cours...';
        generateImageForIdea(title, generateImageBtn);
      });
      
      // On ajoute ce bouton sous le tutoriel
      tutoDetailDiv.appendChild(generateImageBtn);

    } catch (error) {
      console.error(error);
      tutoDetailDiv.innerHTML = `<p>Désolé, impossible de générer le tutoriel : ${error.message}</p>`;
    }
  }

  // --- ACTION 4 : Générer l'image (appelée par le nouveau bouton) ---
  async function generateImageForIdea(prompt, button) {
    imageContainer.innerHTML = '<p>Communication avec le générateur d\'images...</p>';
    try {
      const response = await fetch('/.netlify/functions/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: prompt })
      });
      if (!response.ok) throw new Error('Le serveur d\'images a renvoyé une erreur.');
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      imageContainer.innerHTML = `<img src="${data.image}" alt="Visualisation du projet : ${prompt}">`;
      button.style.display = 'none'; // Cacher le bouton une fois l'image générée

    } catch (error) {
      console.error(error);
      imageContainer.innerHTML = `<p>Désolé, impossible de générer l'image : ${error.message}</p>`;
      button.disabled = false;
      button.textContent = 'Réessayer de générer un visuel';
    }
  }
});