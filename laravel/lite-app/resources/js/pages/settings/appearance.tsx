import AppearanceTabs from '@/components/appearance-tabs';
import { Head } from '@/components/head';
import Heading from '@/components/heading';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editAppearance } from '@/routes/appearance';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: "Paramètres d'apparence",
        href: editAppearance().url,
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head
                title="Paramètres d'apparence"
                description="Choisissez le thème clair, sombre ou système utilisé par Lite sur ce navigateur."
            />

            <h1 className="sr-only">Paramètres d'apparence</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Paramètres d'apparence"
                        description="Choisissez le thème clair, sombre ou système pour ce navigateur. Ce réglage est enregistré localement."
                    />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
