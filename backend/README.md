# SettleIT Backend

Le backend porte la logique métier de SettleIT.

Il expose l'API utilisée par le frontend pour gérer les patients, les examens, les visites, les workflows de relance, les demandes de paiement et les indicateurs business.

Son rôle n'est pas de traiter des paiements.  
Un `PaymentRequest` représente une relance autour d'un reste à charge, pas une transaction bancaire.

## Rôle du backend

Le backend permet de :

- créer et consulter les patients ;
- enregistrer les examens et visites ;
- calculer le reste à charge à partir du coût de l'examen et du taux de couverture patient ;
- sauvegarder les workflows de relance ;
- stocker les noeuds et connexions du graphe ;
- suivre les relances en attente, réglées ou en échec d'envoi ;
- exposer des règles métier configurables ;
- fournir des données d'éligibilité pour les campagnes ;
- produire des indicateurs pour la page analytics.

## Technologies utilisées

- **NestJS** : framework backend utilisé pour structurer l'API en modules clairs.
- **Prisma** : ORM utilisé pour définir le modèle de données et accéder à la base avec des types TypeScript.
- **SQLite** : base de données locale simple, suffisante pour ce projet.
- **Swagger / OpenAPI** : documentation automatique de l'API, utilisée aussi pour générer le client frontend.
- **Jest** : tests unitaires et end-to-end.

Prisma a été choisi parce qu'il permet de partir du modèle de données et de garder une couche d'accès à la base propre et typée.  
Swagger permet de rendre l'API lisible rapidement et sert de contrat entre le backend et le frontend.

## Lancer le backend

Depuis le dossier `backend/` :

```bash
npm install
npm run prisma:push
npm run prisma:seed
npm run start:dev
```

Le serveur est disponible sur :

```text
http://localhost:3000
```

La documentation Swagger est disponible sur :

```text
http://localhost:3000/api
```

## Base de données

Le projet utilise SQLite en local.

La variable d'environnement attendue est :

```bash
DATABASE_URL="file:./dev.db"
```

Les principales commandes Prisma sont :

```bash
npm run prisma:push
npm run prisma:seed
npm run prisma:studio
```

- `prisma:push` synchronise la base locale avec le schéma Prisma.
- `prisma:seed` charge des données de démonstration déterministes.
- `prisma:studio` ouvre une interface visuelle pour consulter la base.

## Modèle métier

Les entités principales sont :

- `Patient`
- `Examination`
- `PatientExamination`
- `ReminderFlow`
- `FlowNode`
- `FlowEdge`
- `PaymentRequest`
- `ReminderPolicy`

Le reste à charge n'est pas stocké directement.  
Il est recalculé à la demande pour éviter de conserver une donnée qui pourrait devenir incohérente si le coût ou le taux de couverture évolue.

## Tests

```bash
npm run test
npm run test:e2e
```

Pour vérifier rapidement que le backend compile et que les tests passent :

```bash
npm run build
npm run test
```

## API

Une fois le backend lancé, l'API est documentée dans Swagger :

```text
http://localhost:3000/api
```

Le fichier OpenAPI brut est exposé ici :

```text
http://localhost:3000/api-json
```

C'est ce fichier qui sert au frontend pour générer automatiquement son client API.
