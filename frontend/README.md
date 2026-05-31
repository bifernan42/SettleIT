# SettleIT Frontend

Le frontend est l'interface produit de SettleIT.

Il permet à un utilisateur de gérer ses patients, de suivre les visites, de construire des workflows de relance, de simuler une campagne et de consulter les indicateurs clés autour du reste à charge.

L'objectif de l'interface est de rester claire et directement exploitable par un gestionnaire d'établissement de santé, sans l'obliger à manipuler la complexité technique du workflow.

## Rôle du frontend

Le frontend permet de :

- consulter une vue d'ensemble depuis l'accueil ;
- gérer les patients ;
- enregistrer les visites ;
- visualiser les relances ;
- créer et modifier des workflows visuels ;
- configurer des règles métier simples ;
- lancer une campagne simulée ;
- suivre les indicateurs business dans une page analytics.

## Technologies utilisées

- **React + TypeScript** : base de l'interface, avec des composants typés.
- **Vite** : outil de développement rapide pour lancer et builder le frontend.
- **React Router** : navigation entre les pages de l'application.
- **TanStack React Query** : gestion des appels API, du cache et des états de chargement.
- **orval** : génération automatique du client API depuis Swagger.
- **React Flow** : éditeur visuel de workflows sous forme de graphe.
- **Recharts** : graphiques utilisés dans la page analytics.
- **Tailwind CSS** : styles de l'interface.
- **lucide-react** : icônes simples et lisibles.
- **sonner** : notifications légères dans l'interface.

React Flow a été choisi parce qu'il apporte déjà les bases solides d'un éditeur de graphe : noeuds, connexions, déplacement sur canvas, mini-map et contrôles.  
orval permet de ne pas maintenir à la main les types et fonctions d'appel API : le frontend suit automatiquement le contrat exposé par le backend.

## Lancer le frontend

Depuis le dossier `frontend/` :

```bash
npm install
npm run dev
```

L'application est disponible sur :

```text
http://localhost:5173
```

Le backend doit tourner en parallèle sur :

```text
http://localhost:3000
```

## Générer le client API

Quand l'API backend change, le client frontend doit être régénéré :

```bash
npm run api:generate
```

Cette commande lit le Swagger du backend et met à jour les types, enums et hooks React Query dans `src/api/generated/`.

Les fichiers générés ne doivent pas être modifiés à la main.

## Pages principales

- **Accueil** : synthèse des montants, relances et workflow actif.
- **Workflows** : liste des workflows et aperçu visuel.
- **Éditeur de workflow** : construction du graphe de relance.
- **Visites** : suivi des examens enregistrés.
- **Patients** : gestion de la base patient.
- **Relances** : suivi des demandes en attente, réglées ou en échec.
- **Campagne** : sélection de patients éligibles et simulation de lancement.
- **Analytics** : indicateurs de recouvrement et efficacité des canaux.
- **Réglages** : règles métier et gestion des examens.

## Build

```bash
npm run build
```

Pour prévisualiser le build de production :

```bash
npm run preview
```
