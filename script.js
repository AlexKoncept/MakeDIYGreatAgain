// Fichier : script.js
// VERSION FINALE (VRAIMENT) : Utilise la suggestion de l'utilisateur pour le prompt et corrige le bug.

document.addEventListener('DOMContentLoaded', function() {
  const findProjectsButton = document.querySelector('.bot-section button');
  const materiauxInput = document.getElementById('materiaux');
  const ideaListDiv = document.getElementById('ideaList');
  const tutoDetailDiv = document.getElementById('tutoDetail');
  
  const modalOverlay = document.getElementById('modal-overlay');
  const modalCloseBtn = document.getElementById('modal-close-btn');

  // NOUVEAU : Une variable simple pour mémoriser le dernier titre cliqué.
  let currentSelectedTitle = '';

  // --- Logique pour trouver les idées (inchangée) ---
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

  // --- Logique pour afficher les idées (inchangée) ---
  function displayIdeas(projectList) {
    ideaListDiv.innerHTML = '<h3>Cliquez sur une idée pour obtenir le tuto :</h3>';
    projectList.forEach(idea => {
      const ideaElement = document.createElement('div');
      ideaElement.className = 'idea-item';
      ideaElement.innerHTML = `<h4>${idea.title}</h4><p>${idea.description}</p>`;
      ideaElement.addEventListener('click', () => {
        document.querySelectorAll('.idea-item').forEach(el => el.classList.remove('selected'));
        ideaElement.classList.add('selected');
        // On passe le titre à la fonction suivante
        getTutorialForIdea(idea.title);
      });
      ideaListDiv.appendChild(ideaElement);
    });
  }
  
  // --- Logique pour obtenir le tutoriel ---
  async function getTutorialForIdea(title) {
    tutoDetailDiv.innerHTML = '<p>Génération du tutoriel en cours...</p>';
    // On mémorise le titre dès qu'on le reçoit.
    currentSelectedTitle = title;
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

      const visualizeBtn = document.createElement('button');
      visualizeBtn.textContent = 'Visualiser ce projet';
      visualizeBtn.className = 'external-generator-btn';
      // Le bouton n'a plus besoin de passer le titre, il appelle juste la fonction.
      visualizeBtn.onclick = showVisualizationModal; 
      tutoDetailDiv.appendChild(visualizeBtn);

    } catch (error) {
      console.error(error);
      tutoDetailDiv.innerHTML = `<p>Désolé, impossible de générer le tutoriel : ${error.message}</p>`;
    }
  }

  // --- Logique pour AFFICHER et PRÉPARER la modale ---
  function showVisualizationModal() {
    // La fonction lit la variable mémorisée, ce qui est beaucoup plus fiable.
    const title = currentSelectedTitle;

    // Sécurité au cas où le titre serait vide.
    if (!title) {
      alert("Erreur : Impossible de récupérer le titre du projet. Veuillez réessayer.");
      return;
    }

    // On utilise DIRECTEMENT le titre comme prompt, comme vous l'avez suggéré.
    const finalPrompt = title; 
    const promptBox = document.getElementById('modal-prompt-box');
    
    promptBox.innerHTML = `
      <input type="text" value="${finalPrompt}" readonly />
      <button id="copy-prompt-btn">Copier</button>
    `;
    
    document.getElementById('copy-prompt-btn').addEventListener('click', (e) => {
      navigator.clipboard.writeText(finalPrompt);
      e.target.textContent = 'Copié !';
      setTimeout(() => { e.target.textContent = 'Copier'; }, 2000);
    });

    modalOverlay.classList.remove('hidden');
  }

  // --- Logique pour FERMER la modale (inchangée) ---
  function hideModal() {
    modalOverlay.classList.add('hidden');
  }
  modalCloseBtn.addEventListener('click', hideModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      hideModal();
    }
  });
});