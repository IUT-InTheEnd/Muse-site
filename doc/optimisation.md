# Optimisation - points relevés lors de l'oral

## Bugs

- quand playlist privée : afficher lock icon
- certains images de cartes sont manquantes ou invalides
- problèmes proxy/performances dégradées
- widget lecture musique instable => tester en isolation dans storybook?

## Amélioration

- utiliser CSS variables pour le theming et des couleurs consistantes? (and theme property dark/light)
- prétélécharger une fraction des images/sons (fichiers) pour les musiques et afficher celle là en priorité dans la page d'accueil

## À tester

- suite de tests, smoke/p95
- checkbox restez connecté => cookie?
- ID serial naturels => problèmes de sécurité / infos confiendielles via url enumération => profils?
- lighthouse en prod
- intégrer l'API via surface externe ou interne

## features

- Permettre l'authentification OAuth (login with google)
- Mettre des images d'arrière plan sur les cartes de sélection de genre dans le formulaire d'inscription
- Revoir les couleurs dans le questionnaire (violet sur noir...) : vérifier contrast ratio AAA
- drag and drop => changer l'ordre dans la playlist
- afficher quand une clé d'API existe déjà pour l'utilisateur
- mettre en avant les recommendations actuellement ce n'est pas très clair, peut être via une page dédiée "mon feed musical?"
- interface administrateur
