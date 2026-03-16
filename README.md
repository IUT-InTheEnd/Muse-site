# Muse

##  Git LFS

- Installer Git LFS
- `git lfs checkout`

## Clonage du projet

```bash
git clone https://github.com/IUT-InTheEnd/Muse-site
cd Muse-site
git submodule update --init
cd database
git switch main
git pull
```

## mise en place du projet

### database

```bash
cd <repo>/database
docker compose up -d
```

ensuite installer les packages python de la manière que vous préférez
et run le `main.py` attention ça prends du temps à se lancer donc c'est l'heure du café !!!!

### mise en place de l'environnement python

```bash
cd <repo>
python3 -m venv .venv
source .venv/bin/activate
pip install -r database/requirements.txt
pip install -r laravel/lite-app/app/Http/Controllers/RecommendationScripts/requirements.txt
```

Le venv Python utilisé par l'application pour les scripts de recommandation est `./.venv` à la racine du repo.

Les dépendances Python des recommandations ne sont pas couvertes par les dépendances Laravel / Node. Elles doivent être installées explicitement dans ce venv, sinon les endpoints `/recommendations` peuvent échouer avec des erreurs du type `ModuleNotFoundError`.

### import / préparation des données

```bash
cd <repo>/database
../.venv/bin/python3 main.py
```

Si vous devez régénérer complètement les données préparées, utilisez les options prévues par `main.py`. L'import peut prendre un certain temps.

### laravel

```bash
cd <repo>/laravel/lite-app
cp .env.example .env
composer install
php artisan optimize
npm i
npm run build
composer run dev
# attendre que le server soit lancé puis <Ctrl-c>
# (quand le server print: APP_URL: http://localhost:8000)
php artisan 
```

## A faire au premier lancement du projet/main.py

une fois ça fait il faut générer les mots de passes car bcrypt qui a été utilisé utilise pas le même standard que celui de laravel, du coup il faut faire ça à la main :

se rendre sur le lien <http://localhost:8000/genpassword[http://localhost:8000/genpassword> et attenez un petit moment.
A l'écran sera affiché le couple email/mot de passe qui est utilisé pour se connecter en tant qu'utilisateur.

## utilisation

Vous l'avez déjà run juste avant mais si vous avez fermé le serveur ou que vous voulez juste le relancer, voici la commande à utiliser (n'oubliez de lancer la database avant) :

```bash
composer run dev
```

## scripts

scripts/psql Se connecter à la base de données avec psql
