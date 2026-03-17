import { usePage } from '@inertiajs/react';
import {
    Briefcase,
    Calendar,
    Guitar,
    Headphones,
    Music,
    User as UserIcon,
} from 'lucide-react';
import EditUserInfoDialog from '@/components/edit-user-info-dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import type { SharedData } from '@/types';

type InfoItemProps = {
    icon: React.ReactNode;
    label: string;
    value: string | number | null | undefined;
};


function parseArrayValue(value: string | null | undefined): string[] | null {
    if (!value) return null;

    // Essayer de parser comme JSON standard
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return [String(parsed)];
    } catch {
        // Si ce n'est pas du JSON valide, essayer de parser le format Python-style ['item1', 'item2']
        const pythonArrayMatch = value.match(/^\[(.+)]$/);
        if (pythonArrayMatch) {
            const content = pythonArrayMatch[1];
            // Extraire les éléments entre guillemets simples ou doubles
            const items: string[] = [];
            const regex = /['"]([^'"]+)['"]/g;
            let match;
            while ((match = regex.exec(content)) !== null) {
                items.push(match[1]);
            }
            if (items.length > 0) {
                return items;
            }
        }

        // Sinon retourner la valeur telle quelle
        return [value];
    }
}

function formatPlaysMusic(value: string | null | undefined): string | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }

    return value === '1' ? 'Oui' : 'Non';
}

function InfoItem({ icon, label, value }: InfoItemProps) {
    if (!value) return null;

    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground">{icon}</div>
            <div className="flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

type InfoItemArrayProps = {
    icon: React.ReactNode;
    label: string;
    value: string | null | undefined;
};

function InfoItemArray({ icon, label, value }: InfoItemArrayProps) {
    const items = parseArrayValue(value);
    if (!items || items.length === 0) return null;

    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 text-muted-foreground">{icon}</div>
            <div className="flex-1">
                <p className="text-xs text-muted-foreground">{label}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                    {items.map((item, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function UserInfoCard() {
    const { auth } = usePage<SharedData>().props;
    const user = auth.user;

    const hasAnyInfo =
        user.user_age ||
        user.user_job ||
        user.user_gender ||
        user.user_plays_music ||
        user.user_instruments ||
        user.user_music_contexts;

    if (!hasAnyInfo) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-base">
                            Informations personnelles
                        </CardTitle>
                        <CardDescription>
                            Aucune information renseignee pour le moment.
                        </CardDescription>
                    </div>
                    <EditUserInfoDialog user={user} />
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle className="text-base">
                        Informations personnelles
                    </CardTitle>
                    <CardDescription>Votre profil musical</CardDescription>
                </div>
                <EditUserInfoDialog user={user} />
            </CardHeader>
            <CardContent className="space-y-4">
                <InfoItem
                    icon={<Calendar className="h-4 w-4" />}
                    label="Age"
                    value={user.user_age ? `${user.user_age} ans` : null}
                />
                <InfoItem
                    icon={<UserIcon className="h-4 w-4" />}
                    label="Genre"
                    value={user.user_gender}
                />
                <InfoItem
                    icon={<Briefcase className="h-4 w-4" />}
                    label="Profession"
                    value={user.user_job}
                />
                <InfoItem
                    icon={<Music className="h-4 w-4" />}
                    label="Pratique musicale"
                    value={formatPlaysMusic(user.user_plays_music)}
                />
                <InfoItemArray
                    icon={<Guitar className="h-4 w-4" />}
                    label="Instruments"
                    value={(user.user_instruments == "nan") ?  "Aucun" : user.user_instruments}
                />
                <InfoItemArray
                    icon={<Headphones className="h-4 w-4" />}
                    label="Contextes d'ecoute"
                    value={user.user_music_contexts}
                />
            </CardContent>
        </Card>
    );
}
