contraintes:

Vous utiliserez les systèmes de recommandation pour créer votre blind test.
Le Blind Test devra apparaître sur une page à part du site
Vous modifierez l'existant (site, API, BD) en fonction de vos besoins

----

attendus:

Demander le nombre de musiques à intégrer
Le niveau de difficulté : Facile (10s), Moyen (5s), Difficile (3s)
Bouton "Advanced generation"
• Année, Genre, Artiste, Popularité, Instrumental/Spoken, Langues
Bouton pour générer le Blind test
Bouton pour obtenir la liste des musiques du blind
test
• Possibilité d'ajouter une musique à une liste de lecture perso

----

Fonctionnement proposé

Intégrer le blind test à l'architecture existante pour les playlists.
Flexibilité "for free": pouvoir lire une playlist existante comme un blind test (très utile pour créer des blind tests manuellement)

2 parties:

## Lecture d'une playlist en mode blind test

- bouton: "voir Playlist" ou en mode `new`: enregistrer dans une playlist/ajouter à une playlist existante
- page dédiée permettant la gestion d'une playlist de blind test :
- lecture confiugrable difficulté : facile=10s,moyen=5s,difficile=3s. la durée correspond à quelle durée du track lire en partant du début (on pourra réimpleménter les ranges du proxy pour cela) une fois "Démarrer" cliquer, ou après chaque "Suivant", après silence (un bouton "Rejouer" est afficher pour rejouer l'extrait)
- les tites de musique sont pas affichés pendant la lecture. il faut cliquer sur un bouton pour "Révéler" (en grand au centre de l'écran) la carte titre+artiste+album+cover (comme sur les cartes de musiques) et cliquer à nouveau: "Suivant" pour passer à la suivante (le temps que les joueurs décident du gagnant)
- une fois la dernière musique lue, "Suivant" est remplacé par "Terminer". Au clic, retour à l'état initial avec le bouton "Démarrer"


## Génération d'une playlist bind test

Page dédiée pour Générer une playlist à partir des préférences de l'utilisateur + inputs :
- nombre de musiques
- sous un volet "génération avancée"
  - année
  - genre
  - artiste
  - popularité
  - instrumental/parlé
  - langues 
- \+ inputs de configuration de lecture (difficulté) qui seront forwardé à la page de lecture de blind test

objectif : faire une playliste mixte en piochant dans 2 ensembles flous de manière probabiliste à 50/50 :

- ensemble "connu" des musiques déjà écoutées par l'utilisateur. degré = 1 - (nombre d'écoutes / nombre d'écoutes max) => privilégier les musiques rarement écoutées
- ensemble "inconnu" de musiques jamais écoutées par l'utilisateur. degré = taux de recommendation (à quel point l'utilisateur est susceptible d'aimer)  => privilégier les musiques intéressantes à découvrir

Une fois la playlist générée, navigation vers la page de lecture de blind test en mode `new`
