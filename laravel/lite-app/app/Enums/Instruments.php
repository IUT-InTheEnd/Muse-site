<?php

namespace App\Enums;

enum Instruments: string
{
    case CHANT = 'chant';
    case PO = 'Piano / Orgues';
    case TSFC = 'Trompette / Saxophone / Flûte / Clarinette';
    case VV = 'Violon / Violoncelle';
    case GBB = 'Guitare / Basse / Banjo';
    case BD = 'Batterie / Djembé';
    case AUTO = 'Autotune';
}
