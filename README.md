# 🛠️ Make DIY Great Again

*Un "Koncept" by Alex Koncept : DIY, récupération, réinvention… pour un futur plus autonome, créatif et responsable.*

**👉 [Découvrir l'application en ligne](https://makediygreatagain.netlify.app/) 👈**

---

### ✨ Présentation

Make DIY Great Again est une application web pensée pour valoriser le Do It Yourself moderne.
L’objectif : inspirer, accompagner et encourager la création de projets techniques à partir de matériel récupéré ou inutilisé.

Créée par un passionné de tech, de montres, de bidouille et d'IA (👋 salut c’est moi, Alex !), cette plateforme veut faire renaître l’esprit maker à travers une interface simple et accessible à tous.

### 🧰 Fonctionnalités

*   **Entrez votre matériel :** Décrivez ce que vous avez sous la main (ex: "bouteilles plastiques, vieux clavier, arduino...").
*   **Recevez des idées de projets :** L'IA vous propose 3 idées de projets réalisables avec votre matériel.
*   **Obtenez un tutoriel :** Cliquez sur une idée pour recevoir une procédure simple, étape par étape.
*   **Visualisez le résultat :** Un prompt optimisé est généré pour vous permettre de créer un aperçu visuel du projet sur un site de génération d'images externe.

### 🛠️ Stack Technique et Architecture

Ce projet utilise une architecture moderne et efficace pour minimiser les coûts tout en offrant une grande réactivité.

*   **Frontend :** HTML, CSS, **JavaScript Natif (Vanilla JS)**
*   **Hébergement & Backend :** **Netlify**
    *   Le site statique est hébergé directement sur le CDN de Netlify pour une performance maximale.
    *   La logique backend est gérée par des **Netlify Functions (Serverless)** écrites en Node.js, ce qui évite d'avoir à gérer un serveur dédié.
*   **Intelligence Artificielle :**
    *   **Groq API** avec le modèle **Llama 3** pour la génération des idées de projets et des tutoriels.
*   **Code source :** Maintenu et versionné avec Git sur **GitHub**.

#### Comment ça marche ?

Le flux de données est simple et sécurisé :

`Navigateur du client` ➡️ `Appel à une Netlify Function` ➡️ `Appel sécurisé à l'API Groq (clé API cachée)` ➡️ `Retour à la Netlify Function` ➡️ `Retour au client`

### 🔮 Objectifs à venir

*   🧠 Base de données open source de projets à reproduire ou à "forker".
*   🌍 Carte interactive des Fablabs/Makerspaces proches.
*   📦 Création d’un “Kit DIY de démarrage” open source (PDF).
*   🤝 Ouverture à des contributions de la communauté.

---

### 🙌 Contribuer

Tu es passionné de DIY ? Tu as des idées pour améliorer l'application ? Tu veux participer ?
N'hésite pas à me contacter par email : **alexkonceptuniverse@gmail.com**

> 🧠 *Un projet par passion, pour les passionnés. Make DIY Great Again n’est pas une simple app. C’est une philosophie de création, une ode à la récupération, une réponse au monde du jetable.*
