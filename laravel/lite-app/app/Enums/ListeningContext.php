<?php

namespace App\Enums;

enum ListeningContext: string
{
    case DETENTE = 'Détente';
    case TE = 'Travail / études';
    case SEA = 'Soirée entre amis';
    case SPORT = 'Sport';
    case LE = 'Lecture / écriture';
    case JV = 'Jeu vidéo';
    case TRAJET = 'Trajet';
}
