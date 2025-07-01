// Fichier : script.js
// VERSION FINALE : Contournement de l'API par un lien vers un site externe.

document.addEventListener('DOMContentLoaded', function() {
  // Sélection des éléments de la page
  const findProjectsButton = document.querySelector('.bot-section button');
  const materiauxInput = document.getElementById('materiaux');
  const ideaListDiv = document.getElementById('ideaList');
  const tutoDetailDiv = document.getElementById('tutoDetail');
  const imageContainer = document.getElementById('imageGeneratorContainer'); // On va réutiliser ce conteneur

  // --- ACTION 1 : Clic sur "Trouve-moi des projets !" ---
  findProjectsButton.addEventListener('click', getIdeas);

  async function getIdeas() {
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

  // --- ACTION 2 : Afficher les idées et rendre cliquables ---
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

  // --- ACTION 3 : Obtenir et afficher le tutoriel ET le nouvel espace de visualisation ---
  async function getTutorialForIdea(title) {
    tutoDetailDiv.innerHTML = '<p>Génération du tutoriel en cours...</p>';
    imageContainer.innerHTML = '';

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

      // Afficher le tutoriel
      tutoDetailDiv.innerHTML = `<h4>Procédure : ${title}</h4><ol>${tutorialHtml}</ol>`;

      // On affiche maintenant le cadre de visualisation
      displayVisualizationBox(title);

    } catch (error) {
      console.error(error);
      tutoDetailDiv.innerHTML = `<p>Désolé, impossible de générer le tutoriel : ${error.message}</p>`;
    }
  }

  // --- NOUVELLE FONCTION : Créer et afficher le cadre de visualisation ---
  function displayVisualizationBox(title) {
    const finalPrompt = `(best quality, 4k, 8k, ultra highres), masterpiece, a professional photo of a DIY project: ${title}. Product shot, studio lighting, plain background.`;
    
    // On utilise le conteneur d'image existant pour y mettre notre nouveau cadre
    imageContainer.innerHTML = `
      <div class="visualize-section">
        <h4>Visualiser le projet (étape optionnelle)</h4>
        <p>Copiez le prompt ci-dessous et collez-le dans le générateur d'images gratuit.</p>
        <div class="prompt-box">
          <input type="text" value="${finalPrompt}" readonly />
          <button id="copy-prompt-btn">Copier</button>
        </div>
        <a href="https://www.craiyon.com/" target="_blank" rel="noopener noreferrer" class="external-generator-btn">
          Aller sur Craiyon.com (générateur gratuit)
        </a>
      </div>
    `;

    // Ajouter la logique pour le bouton "Copier"
    document.getElementById('copy-prompt-btn').addEventListener('click', (e) => {
      const input = e.target.previousElementSibling;
      navigator.clipboard.writeText(input.value);
      e.target.textContent = 'Copié !';
      setTimeout(() => { e.target.textContent = 'Copier'; }, 2000);
    });
  }
});