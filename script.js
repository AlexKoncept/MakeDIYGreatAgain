// Fichier : script.js
// VERSION FINALE ET CORRIGÉE : Correction du bug du prompt et clarification de la modale.

document.addEventListener('DOMContentLoaded', function() {
  const findProjectsButton = document.querySelector('.bot-section button');
  const materiauxInput = document.getElementById('materiaux');
  const ideaListDiv = document.getElementById('ideaList');
  const tutoDetailDiv = document.getElementById('tutoDetail');
  
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
      
      // On stocke le titre directement sur l'élément pour le récupérer sans erreur
      ideaElement.dataset.title = idea.title;

      ideaElement.addEventListener('click', (e) => {
        // On récupère l'élément parent sur lequel on a cliqué
        const clickedIdea = e.currentTarget;
        const title = clickedIdea.dataset.title; // On lit le titre stocké

        document.querySelectorAll('.idea-item').forEach(el => el.classList.remove('selected'));
        clickedIdea.classList.add('selected');
        
        getTutorialForIdea(title);
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

      const visualizeBtn = document.createElement('button');
      visualizeBtn.textContent = 'Visualiser ce projet';
      visualizeBtn.className = 'external-generator-btn';
      // On passe le titre à la fonction qui affiche la modale
      visualizeBtn.onclick = () => showVisualizationModal(title);
      tutoDetailDiv.appendChild(visualizeBtn);

    } catch (error) {
      console.error(error);
      tutoDetailDiv.innerHTML = `<p>Désolé, impossible de générer le tutoriel : ${error.message}</p>`;
    }
  }

  // Logique pour AFFICHER et PRÉPARER la modale
  function showVisualizationModal(title) {
    console.log(`Préparation de la modale pour le titre : "${title}"`); // Pour vérifier dans la console (F12)

    // CORRECTION : On s'assure que le prompt utilise le bon titre
    const finalPrompt = `photo de haute qualité d'un projet DIY (fait maison) : "${title}". Style photographie de produit, sur fond uni.`;
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

  // Logique pour FERMER la modale (inchangée)
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