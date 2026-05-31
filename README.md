![SettleIT](assets/banner.png)

# SettleIT

SettleIT est une web-app pensée pour les professionnels de santé qui veulent mieux piloter leurs relances de reste à charge patient.

L'idée est simple : après une visite ou un examen, un patient peut encore devoir régler une partie du montant. Plutôt que de gérer ces relances à la main, SettleIT permet de construire des workflows visuels, de suivre les relances en cours, et de garder une lecture claire des montants dus ou déjà recouvrés.

SettleIT ne traite pas les paiements.  
Il ne s'agit pas d'un système de paiement, mais d'un outil d'orchestration, de suivi et de pilotage des relances.

## Ce que permet l'application

SettleIT permet notamment de :

- gérer une base de patients ;
- enregistrer des visites ou examens ;
- calculer le reste à charge patient ;
- créer des workflows visuels de relance ;
- adapter les relances selon les données disponibles côté patient ;
- suivre les relances en attente, réglées ou en échec d'envoi ;
- visualiser les indicateurs clés : montant dû, montant recouvré, taux de règlement, efficacité par canal ;
- configurer quelques règles métier simples, comme le délai minimal entre deux relances.

L'objectif produit est de réduire l'encours total, c'est-à-dire la somme des restes à charge non réglés, tout en donnant aux équipes un processus clair, réplicable et facile à ajuster.

## Approche produit

Le coeur de SettleIT repose sur un éditeur de workflows visuels.

Un établissement peut définir sa stratégie de relance à la manière d'un outil comme n8n ou Zapier : un point de départ, des actions d'envoi, des délais, des conditions, puis des chemins de fallback.

Par exemple :

- envoyer un email quelques jours après l'examen ;
- si l'email est absent ou non exploitable, passer par SMS ;
- attendre avant une nouvelle relance ;
- terminer le workflow lorsque la situation est réglée ou qu'aucune action pertinente ne reste à faire.

Cette logique permet de gérer un problème très concret : les données patient ne sont pas toujours complètes. Certains patients n'ont pas d'email, d'autres pas de numéro de téléphone fiable. Le workflow permet donc d'anticiper ces cas au lieu de les traiter manuellement au fil de l'eau.

<details>
<summary>Voir un exemple de workflow</summary>

<img src="assets/flow_de_relance.png" alt="Workflow de relance" width="560">

</details>

<details>
<summary>Voir les schémas papier</summary>

Ces notes ont servi à poser les premières entités métier et leurs relations avant de construire le backend.

<p>
  <img src="assets/paper_capture1.png" alt="Schéma papier 1" width="320">
  <img src="assets/paper_capture2.png" alt="Schéma papier 2" width="320">
</p>

</details>

## Stack

Le projet est organisé en monorepo avec deux applications :

- un backend NestJS ;
- un frontend React + TypeScript.

Les deux parties communiquent via une API REST documentée avec Swagger.  
Le client frontend est généré depuis cette documentation afin de garder les types alignés avec le backend.

## Lancer le projet

### 1. Backend

```bash
cd backend
npm install
npm run prisma:push
npm run prisma:seed
npm run start:dev
```

Le backend tourne sur :

```text
http://localhost:3000
```

La documentation Swagger est disponible ici :

```text
http://localhost:3000/api
```

### 2. Frontend

Dans un second terminal :

```bash
cd frontend
npm install
npm run dev
```

Le frontend tourne sur :

```text
http://localhost:5173
```

Le frontend attend que le backend soit lancé sur `http://localhost:3000`.

## Générer le client API frontend

Si l'API backend change, il faut régénérer le client utilisé par le frontend :

```bash
cd frontend
npm run api:generate
```

Cette commande lit la documentation Swagger exposée par le backend et régénère les types TypeScript ainsi que les hooks React Query.

## Structure du repository

```text
SettleIT/
├── backend/
│   ├── prisma/
│   ├── src/
│   └── README.md
├── frontend/
│   ├── src/
│   └── README.md
├── assets/
└── README.md
```

## Documentation par partie

- [README Backend](backend/README.md)
- [README Frontend](frontend/README.md)

## Notes

Le projet reste volontairement concentré sur la configuration, la visualisation et le suivi des relances.

Les envois réels d'email, SMS, WhatsApp ou courrier ne sont pas branchés. Les campagnes sont simulées, ce qui permet de se concentrer sur le produit, les règles métier et l'expérience utilisateur.
