import { Head } from '@inertiajs/react';

export default function MentionsLegales() {
    return (
        <>
            <Head title="Mentions Legales" />
            <div className="flex h-full w-full flex-row justify-center pt-20 pb-20">
                <div className="w-1/2">
                    <h1>Mentions légales</h1>
                    <p>
                        Conformément aux dispositions de la loi n°2004-575 du 21
                        juin 2004 pour la confiance dans l’économie numérique
                        (LCEN), il est précisé aux utilisateurs du site Lite
                        l’identité des différents intervenants dans le cadre de
                        sa réalisation et de son suivi.
                    </p>
                    <br />
                    <h2>Éditeur du site</h2>
                    <p>
                        Éditeur du site Nom du site : Lite <br />
                        Éditeur : Muse <br />
                        Forme juridique : [SARL / SAS / SA / Auto-entreprise /
                        autre] <br />
                        Capital social : [montant] &euro; <br />
                        Siège social : [adresse complète] <br />
                        Numéro SIRET : [numéro] <br />
                        RCS : [ville] <br />
                        TVA intracommunautaire : [numéro, si applicable] <br />
                    </p>
                    <br />
                    <h2>Hébergement</h2>
                    <p>
                        Hébergeur : [Nom de l’hébergeur – ex : OVH, AWS, Gandi,
                        etc.] <br />
                        Adresse : [adresse complète] <br />
                        Téléphone : [numéro] <br />
                    </p>
                    <br />
                    <h2>Conception et développement</h2>
                    <p>
                        Site conçu et développé par <br />
                        In The End - Équipe de développement
                    </p>
                    <br />
                    <h2>Propriété intellectuelle</h2>
                    <p>
                        L’ensemble du site Lite, incluant notamment les textes,
                        graphismes, interfaces, logos, icônes, sons, logiciels
                        et bases de données, est protégé par les dispositions du
                        Code de la propriété intellectuelle. Toute reproduction,
                        représentation, modification, publication ou adaptation
                        de tout ou partie du site, quel que soit le moyen ou le
                        procédé utilisé, est interdite sans l’autorisation
                        écrite préalable de Muse.
                    </p>
                    <br />
                    <h2>Données personnelles</h2>
                    <p>
                        Lite collecte et traite des données personnelles dans le
                        respect du Règlement Général sur la Protection des
                        Données (RGPD) et de la loi « Informatique et Libertés
                        ». Les données collectées sont nécessaires :
                    </p>
                    <ul>
                        <li>
                            à la création et à la gestion des comptes
                            utilisateurs,
                        </li>
                        <li>au bon fonctionnement du service de streaming,</li>
                        <li>à l’amélioration de l’expérience utilisateur.</li>
                    </ul>
                    <p>
                        Les utilisateurs disposent d’un droit d’accès, de
                        rectification, d’effacement, de limitation et
                        d’opposition concernant leurs données personnelles.
                        Toute demande peut être adressée à : <br />
                        📧 in.the.end22300@gmail.com
                    </p>
                    <br />
                    <h2>Cookies</h2>
                    <p>
                        Le site Lite utilise des cookies et traceurs afin
                        d’assurer son bon fonctionnement, mesurer l’audience et
                        améliorer l’expérience utilisateur. L’utilisateur peut
                        configurer ou refuser les cookies via les paramètres de
                        son navigateur ou le bandeau de gestion des cookies
                        prévu à cet effet.
                    </p>
                    <br />
                    <h2>Responsabilité</h2>
                    <p>
                        Muse s’efforce de fournir des informations aussi
                        précises que possible sur le site Lite. <br />
                        Toutefois, elle ne pourra être tenue responsable des
                        omissions, inexactitudes ou carences dans la mise à
                        jour.
                    </p>
                </div>
            </div>
        </>
    );
}
