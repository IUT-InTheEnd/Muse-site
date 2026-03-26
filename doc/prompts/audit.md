Tu es un ingénieur logiciel senior chargé d'auditer un dépôt Git cloné en local.
Analyse l'intégralité de la base de code et produis un rapport structuré et détaillé permettant de comprendre précisément le travail réalisé.

Objectifs de l'analyse :

1. Vue d'ensemble

- Quel est le but du projet ?
- Quel problème résout-il ?
- À quel type d'utilisateur ou système s'adresse-t-il ?
- Quel est son niveau de maturité apparent (prototype, MVP, production, etc.) ?

2. Architecture

- Décris l'architecture globale (monolithe, microservices, hexagonale, MVC, etc.).
- Identifie les modules principaux et leurs responsabilités.
- Explique les dépendances internes et les flux entre composants.
- Décris les points d'entrée (main, API, CLI, workers, etc.).

3. Technologies et dépendances

- Langages utilisés.
- Frameworks principaux.
- Bibliothèques critiques.
- Outils de build et gestionnaires de dépendances.
- Services externes intégrés (API, base de données, cloud, etc.).

4. Flux applicatifs

- Décris les principaux flux fonctionnels (ex: création d'un utilisateur, traitement d'une requête, pipeline de données, etc.).
- Explique le cycle de vie d'une requête ou d'un traitement typique.
- Identifie les mécanismes d'authentification, d'autorisation et de gestion d'état.

5. Données

- Modèle de données (schémas, entités principales).
- Type de base de données.
- Migrations éventuelles.
- Flux de transformation ou de validation des données.

6. DevOps et pipelines

- Configuration CI/CD (GitHub Actions, GitLab CI, Jenkins, etc.).
- Scripts de build et de déploiement.
- Docker, Kubernetes ou autres outils d'orchestration.
- Variables d'environnement et configuration.

7. Qualité et maintenabilité

- Organisation du code.
- Présence de tests (unitaires, intégration, e2e).
- Couverture approximative et qualité perçue.
- Gestion des erreurs et logging.
- Points techniques fragiles ou dette technique apparente.

8. Documentation

- Présence et qualité du README.
- Documentation technique ou fonctionnelle.
- Commentaires dans le code.
- Instructions d'installation et d'exécution.

9. Synthèse finale

- Résume ce que fait réellement le projet.
- Décris le niveau de complexité global.
- Identifie les forces et les faiblesses principales.
- Évalue la qualité globale du travail réalisé.

Contraintes de sortie :

- Rédige un rapport structuré avec titres et sous-titres clairs.
- Sois précis, factuel et basé uniquement sur le contenu du dépôt.
- Cite explicitement les fichiers ou dossiers importants lorsque pertinent.
- Évite toute supposition non justifiée par le code.

But final : permettre à un nouvel ingénieur d'intégrer le projet rapidement et de comprendre en profondeur le travail déjà réalisé.

écris l'audit dans un fichier AUDIT.MD dans le dossier racine du projet.
