// Fichier : netlify/functions/generate-image.js
// AUCUN require ici !

exports.handler = async (event) => {
  // ... (le reste du code natif que je vous ai donné précédemment)
  // ...
  try {
    // ...
    const form = new FormData(); // FormData natif
    form.append('prompt', prompt);

    const response = await fetch('https://api.clipdrop.co/v1/text-to-image', { // fetch natif
      method: 'POST',
      headers: { 'x-api-key': CLIPDROP_API_KEY },
      body: form,
    });

    // ... (le reste du code avec .arrayBuffer() et Buffer.from())
    // ...
  } catch (error) {
    // ...
  }
};