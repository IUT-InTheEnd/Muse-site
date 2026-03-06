import { Head, Link, usePage } from '@inertiajs/react';
import { Separator } from '@radix-ui/react-separator';
import type { SharedData } from '@/types';

export default function Installation() {

    return (
        <>
            <Head title="Documentation – Installation" />

            <div className="flex flex-col items-center lg:justify-center py-10">
                <main className="flex flex-col w-full max-w-xl sm:max-w-xl lg:max-w-2xl xl:max-w-4xl items-start justify-center gap-10 px-6 py-10 ">

                    <h1 className="text-3xl font-bold mb-6"> Utilisation </h1>
                    <div className='flex flex-col gap-2 w-full'>
                        <h2>Sommaire</h2>
                        <Separator
                            orientation="horizontal"
                            className="h-px w-full bg-gray-300"
                        />
                        <div className="flex flex-col gap-4 items-start w-full">
                            <Link href="#compte" className="link-doc">
                                <p>1. Création du compte ou connexion à un déjà existant</p>
                            </Link>

                            <Link href="#configuration" className="link-doc">
                                <p>2. Configuration</p>
                            </Link>

                            <Link href="#navigation" className="link-doc">
                                <p>3. Navigation</p>
                            </Link>
                        </div>
                    </div>

                    <article id='compte' className='gap-2'>
                        <h3>Création du compte ou connexion à un déjà existant</h3>
                        <br />
                        <p>Quand vous arrivez sur la page d'accueil du site, on vous demande de vous créer un compte ou de vous connecter.</p>
                        <br />
                        <p>Si vous n'avez pas de compte, vous pouvez en créer un en cliquant sur le bouton "Créer un compte".</p>
                        <p>Si vous voulez vous connecter à un compte existant, tapez dans l'url à la suite de la racine 'genpassword'. Attendez que des comptes se créer avec un mot de passe généré.</p>
                    </article>

                    <article id='configuration' className='gap-2'>
                        <h3>Configuration</h3>
                        <br />
                        <p>Pour configurer votre compte et l'apparence du site, aller sur votre profil accessible en haut à droite du menu de navigation tout en haut, puis cliquez sur paramètres.</p>
                        <br />
                        <p>Vous pouvez modifier vos informations personnelles et votre photo de profil depuis la page profil, vous pouvez également supprimer votre compte depuis cette page.</p>
                        <p>Dans le menu à droite, vous pouvez accéder à l'onglet "Sécurité", votre mot de passe vous sera demandé et vous pourrez modifier votre mot de passe, accéder à votre clé API et gérer l'authentification à deux facteurs.</p>
                        <p>Toujours dans le même menu, vous pouvez accéder à l'onglet "Confidentialité", dans lequel vous pouvez rendre votre profil public.</p>
                        <p>Enfin, vous pouvez accéder à l'onglet "Apparence", où vous pouvez gérer le thème du site.</p>
                    </article>

                    <article id='navigation' className='gap-2'>
                        <h3>Navigation</h3>
                        <br />
                        <p>Le menu de navigation en haut de la page vous permet d'accéder rapidement aux différentes sections de l'application.</p>
                        <p>Vous pouvez effectuer des recherches, vous rendre à l'accueil, accéder à vos favoris et vos playlists, ainsi qu'accéder à votre profil.</p>
                        <br />
                        <p>Le menu de navigation tout en bas, quant à lui vous permet d'accéder à des liens utiles et à des informations supplémentaires telles que le contact, les mentions légales et la documentation.</p>
                        <p>La page API vous permet d'accéder à la documentation complète et testable de l'API du site.</p>
                        <br />
                        <p>Un bouton comprenant une note de musique se trouve en bas à droite quand vous êtes sur les pages principales du site. Celui-ci vous permet d'afficher un bandeau permettant de gérer la lecture des musiques.</p>
                        <p>La lecture des musiques marche suivant une liste d'attente, qui sera alimentée par la recommandation.</p>
                        <br />
                        <p>Sur la page de playlist, vous pouvez créer de nouvelles playlists, les lire, les modifier ainsi que les supprimer.</p>
                        <br />
                        <p>En effectuant une recherche vous vous retrouverez sur la page de résultats de recherche, où vous pourrez explorer les contenus correspondants à votre requête avec la possibilité d'ajouter des filtres.</p>
                    </article>
                </main>
            </div>
        </>
    );
}
