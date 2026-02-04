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
et run le `main.py`

### laravel
```bash
cd <repo>/laravel/lite-app
composer install
php artisan optimize
npm i
npm run build
composer run dev
# attendre que le server soit lancé puis <Ctrl-c>
# (quand le server print: APP_URL: http://localhost:8000)
php artisan migrate
```

## utilisation

```bash
composer run dev
```
