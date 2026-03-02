import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit as editPrivacy } from '@/routes/privacy';
import type { BreadcrumbItem } from '@/types';
import { Form, Head, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paramètres de confidentialité',
        href: editPrivacy().url,
    },
];

type PrivacyPageProps = {
    public_profile_visibility: boolean;
};

export default function Privacy() {
    const { public_profile_visibility } = usePage<PrivacyPageProps>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paramètres de confidentialité" />

            <h1 className="sr-only">Paramètres de confidentialité</h1>

            <SettingsLayout>
                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Paramètres de confidentialité"
                        description="Gérez vos préférences de confidentialité et de visibilité"
                    />
                    <Form
                        method="patch"
                        action={editPrivacy().url}
                        className="space-y-6"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <input
                                    type="hidden"
                                    name="public_profile_visibility"
                                    value="0"
                                />
                                <input
                                    id="public_profile_visibility"
                                    name="public_profile_visibility"
                                    type="checkbox"
                                    value="1"
                                    defaultChecked={public_profile_visibility}
                                    className="h-4 w-4 rounded border-gray-300 text-purple-500 focus:ring-purple-400"
                                />
                                <label
                                    htmlFor="public_profile_visibility"
                                    className="text-sm font-medium text-white"
                                >
                                    Rendre mon profil public
                                </label>
                            </div>
                            <p className="text-sm text-white">
                                Si activé, votre profil sera visible par tous
                                les utilisateurs. Sinon, il ne sera visible que
                                par vous.
                            </p>

                            <Button type="submit">
                                Enregistrer les modifications
                            </Button>
                        </div>
                    </Form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
