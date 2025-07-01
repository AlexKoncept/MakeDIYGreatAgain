// Fichier : script.js
// VERSION FINALE AVEC FENÊTRE MODALE

document.addEventListener('DOMContentLoaded', function() {
  // Sélection des éléments de la page
  const findProjectsButton = document.querySelector('.bot-section button');
  const materiauxInput = document.getElementById('materiaux');
  const ideaListDiv = document.getElementById('ideaList');
  const tutoDetailDiv = document.getElementById('tutoDetail');
  
  // NOUVEAU : Sélection des éléments de la modale
  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // Logique pour trouver les idées (inchangée)
  findProjectsButton.addEventListener('click', getIdeas);

  async function getIdeas() {
    const materials = materiauxInput.value;
    if (materials.trim() === '') {
      ideaListDiv.innerHTML = '<p>Veuillez décrire le matériel dont vous disposez.</p>';
      return;
    }
    ideaListDiv.innerHTML = '<p>Recherche d\'idées en cours...</p>';
    tutoDetailDiv.innerHTML = '';
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

  // Logique pour afficher les idées (inchangée)
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
  
  // Logique pour obtenir le tutoriel
  async function getTutorialForIdea(title) {
    tutoDetailDiv.innerHTML = '<p>Génération du tutoriel en cours...</p>';
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
      tutoDetailDiv.innerHTML = `<h4>Procédure : ${title}</h4><ol>${tutorialHtml}</ol>`;

      // NOUVEAU : On ajoute un bouton "Visualiser" sous le tuto
      const visualizeBtn = document.createElement('button');
      visualizeBtn.textContent = 'Visualiser ce projet';
      visualizeBtn.className = 'external-generator-btn';
      visualizeBtn.onclick = () => showVisualizationModal(title);
      tutoDetailDiv.appendChild(visualizeBtn);

    } catch (error) {
      console.error(error);
      tutoDetailDiv.innerHTML = `<p>Désolé, impossible de générer le tutoriel : ${error.message}</p>`;
    }
  }

  // NOUVEAU : Logique pour AFFICHER la modale
  function showVisualizationModal(title) {
    const finalPrompt = `(best quality, 4k, 8k, ultra highres), masterpiece, a professional photo of a DIY project: ${title}. Product shot, studio lighting, plain background.`;
    const promptBox = document.getElementById('modal-prompt-box');
    promptBox.innerHTML = `
      <input type="text" value="${finalPrompt}" readonly />
      <button id="copy-prompt-btn">Copier</button>
    `;
    
    document.getElementById('copy-prompt-btn').addEventListener('click', (e) => {
      const input = e.target.previousElementSibling;
      navigator.clipboard.writeText(input.value);
      e.target.textContent = 'Copié !';
      setTimeout(() => { e.target.textContent = 'Copier'; }, 2000);
    });

    modalOverlay.classList.remove('hidden');
  }

  // NOUVEAU : Logique pour FERMER la modale
  function hideModal() {
    modalOverlay.classList.add('hidden');
  }

  modalCloseBtn.addEventListener('click', hideModal);
  modalOverlay.addEventListener('click', (e) => {
    // On ferme la modale seulement si on clique sur le fond grisé, pas sur la boite de dialogue
    if (e.target === modalOverlay) {
      hideModal();
    }
  });
});