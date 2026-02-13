import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import ProfileImageUpload from '@/components/profile-image-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import UserInfoCard from '@/components/user-info-card';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paramètres du profil',
        href: edit().url,
    },
];

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paramètres du profil" />

            <h1 className="sr-only">Paramètres du profil</h1>

            <SettingsLayout>
                <div className="flex flex-col gap-8 xl:flex-row">
                    {/* Left column - Profile form */}
                    <div className="flex-1 space-y-12">
                        {/* Profile Image Section */}
                        <div className="space-y-6">
                            <Heading
                                variant="small"
                                title="Photo de profil"
                                description="Ajoutez ou modifiez votre photo de profil"
                            />
                            <ProfileImageUpload />
                        </div>

                        <div className="space-y-6">
                            <Heading
                                variant="small"
                                title="Informations du profil"
                                description="Mettez à jour votre nom et votre adresse e-mail"
                            />

                            <Form
                                {...ProfileController.update.form()}
                                options={{
                                    preserveScroll: true,
                                }}
                                className="space-y-6"
                            >
                                {({
                                    processing,
                                    recentlySuccessful,
                                    errors,
                                }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="name">Nom</Label>

                                            <Input
                                                id="name"
                                                className="mt-1 block w-full"
                                                defaultValue={auth.user.name}
                                                name="name"
                                                required
                                                autoComplete="name"
                                                placeholder="Nom complet"
                                            />

                                            <InputError
                                                className="mt-2"
                                                message={errors.name}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">
                                                Adresse e-mail
                                            </Label>

                                            <Input
                                                id="email"
                                                type="email"
                                                className="mt-1 block w-full"
                                                defaultValue={auth.user.email}
                                                name="email"
                                                required
                                                autoComplete="username"
                                                placeholder="Adresse e-mail"
                                            />

                                            <InputError
                                                className="mt-2"
                                                message={errors.email}
                                            />
                                        </div>

                                        {mustVerifyEmail &&
                                            auth.user.email_verified_at ===
                                                null && (
                                                <div>
                                                    <p className="-mt-4 text-sm text-muted-foreground">
                                                        Votre adresse e-mail
                                                        n'est pas vérifiée.{' '}
                                                        <Link
                                                            href={send()}
                                                            as="button"
                                                            className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                        >
                                                            Cliquez ici pour
                                                            renvoyer l'e-mail de
                                                            vérification.
                                                        </Link>
                                                    </p>

                                                    {status ===
                                                        'verification-link-sent' && (
                                                        <div className="mt-2 text-sm font-medium text-green-600">
                                                            Un nouveau lien de
                                                            vérification a été
                                                            envoyé à votre
                                                            adresse e-mail.
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                        <div className="flex items-center gap-4">
                                            <Button
                                                disabled={processing}
                                                data-test="update-profile-button"
                                            >
                                                Enregistrer
                                            </Button>

                                            <Transition
                                                show={recentlySuccessful}
                                                enter="transition ease-in-out"
                                                enterFrom="opacity-0"
                                                leave="transition ease-in-out"
                                                leaveTo="opacity-0"
                                            >
                                                <p className="text-sm text-neutral-600">
                                                    Enregistré
                                                </p>
                                            </Transition>
                                        </div>
                                    </>
                                )}
                            </Form>
                        </div>

                        <DeleteUser />
                    </div>

                    {/* Right column - User info card */}
                    <div className="w-full xl:w-80">
                        <UserInfoCard />
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
