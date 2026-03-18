import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { ShieldBan, ShieldCheck } from 'lucide-react';
import { useRef, useState } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { show } from '@/routes/security';
import { disable, enable } from '@/routes/two-factor';
import type { BreadcrumbItem } from '@/types';

type Props = {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
    userid?: number;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Paramètres de sécurité',
        href: show().url,
    },
];

export default function Security({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Paramètres de sécurité" />

            <h1 className="sr-only">Paramètres de sécurité</h1>

            <SettingsLayout>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    {/* Password Section */}
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title="Modifier le mot de passe"
                            description="Assurez-vous que votre compte utilise un mot de passe long et aléatoire pour rester sécurisé"
                        />

                        <Form
                            {...SecurityController.updatePassword.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            resetOnError={[
                                'password',
                                'password_confirmation',
                                'current_password',
                            ]}
                            resetOnSuccess
                            onError={(errors) => {
                                if (errors.password) {
                                    passwordInput.current?.focus();
                                }

                                if (errors.current_password) {
                                    currentPasswordInput.current?.focus();
                                }
                            }}
                            className="space-y-6"
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="current_password">
                                            Mot de passe actuel
                                        </Label>

                                        <Input
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            type="password"
                                            className="mt-1 block w-full"
                                            autoComplete="current-password"
                                            placeholder="Mot de passe actuel"
                                        />

                                        <InputError
                                            message={errors.current_password}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password">
                                            Nouveau mot de passe
                                        </Label>

                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            type="password"
                                            className="mt-1 block w-full"
                                            autoComplete="new-password"
                                            placeholder="Nouveau mot de passe"
                                        />

                                        <InputError message={errors.password} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="password_confirmation">
                                            Confirmer le mot de passe
                                        </Label>

                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type="password"
                                            className="mt-1 block w-full"
                                            autoComplete="new-password"
                                            placeholder="Confirmer le mot de passe"
                                        />

                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <Button
                                            disabled={processing}
                                            data-test="update-password-button"
                                            className="cursor-pointer"
                                        >
                                            Enregistrer le mot de passe
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

                    {/* Two-Factor Authentication Section */}
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title="Authentification à deux facteurs"
                            description="Gérez vos paramètres d'authentification à deux facteurs"
                        />

                        {twoFactorEnabled ? (
                            <div className="flex flex-col items-start justify-start space-y-4">
                                <Badge variant="default">Activée</Badge>
                                <p className="text-muted-foreground">
                                    Avec l'authentification à deux facteurs
                                    activée, vous serez invité à saisir un code
                                    sécurisé lors de la connexion, que vous
                                    pouvez obtenir depuis l'application TOTP sur
                                    votre téléphone.
                                </p>

                                <TwoFactorRecoveryCodes
                                    recoveryCodesList={recoveryCodesList}
                                    fetchRecoveryCodes={fetchRecoveryCodes}
                                    errors={errors}
                                />

                                <div className="relative inline">
                                    <Form {...disable.form()}>
                                        {({ processing }) => (
                                            <Button
                                                variant="destructive"
                                                type="submit"
                                                disabled={processing}
                                                className="cursor-pointer"
                                            >
                                                <ShieldBan /> Désactiver la 2FA
                                            </Button>
                                        )}
                                    </Form>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-start justify-start space-y-4">
                                <Badge variant="destructive">Désactivée</Badge>
                                <p className="text-muted-foreground">
                                    Lorsque vous activez l'authentification à
                                    deux facteurs, vous serez invité à saisir un
                                    code sécurisé lors de la connexion. Ce code
                                    peut être obtenu depuis une application TOTP
                                    sur votre téléphone.
                                </p>

                                <div>
                                    {hasSetupData ? (
                                        <Button
                                            onClick={() =>
                                                setShowSetupModal(true)
                                            }
                                            className="cursor-pointer"
                                        >
                                            <ShieldCheck />
                                            Continuer la configuration
                                        </Button>
                                    ) : (
                                        <Form
                                            {...enable.form()}
                                            onSuccess={() =>
                                                setShowSetupModal(true)
                                            }
                                        >
                                            {({ processing }) => (
                                                <Button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="cursor-pointer"
                                                >
                                                    <ShieldCheck />
                                                    Activer la 2FA
                                                </Button>
                                            )}
                                        </Form>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <TwoFactorSetupModal
                    isOpen={showSetupModal}
                    onClose={() => setShowSetupModal(false)}
                    requiresConfirmation={requiresConfirmation}
                    twoFactorEnabled={twoFactorEnabled}
                    qrCodeSvg={qrCodeSvg}
                    manualSetupKey={manualSetupKey}
                    clearSetupData={clearSetupData}
                    fetchSetupData={fetchSetupData}
                    errors={errors}
                />

                <div className="space-y-6">
                    <Heading
                        variant="small"
                        title="Clé API"
                        description="Gérez votre clé API pour accéder à nos services de manière sécurisée."
                    />

                    <p className="w-1/2 text-muted-foreground">
                        Votre clé API vous permettent d'accéder à nos services
                        de manière sécurisée.
                        <br />
                        Vous pouvez créer ou régénérer votre clé API à tout
                        moment.
                        <br />
                        <span className="text-red-400">
                            Et n'est affichée qu'une seule fois lors de sa création pour des raisons de sécurité.
                        </span>{' '}
                        <br />
                        La documentation de l'API est disponible à l'adresse
                        suivante :{' '}
                        <a
                            href={'/docs/api'}
                            className="text-purple-500 underline"
                        >
                            /docs/api
                        </a>
                        .
                    </p>

                    <Input
                        readOnly
                        placeholder="Votre clé API apparaîtra ici après régénération"
                        className="mt-1 block w-150"
                    />

                    <Button
                        onClick={() => {
                            fetch('/settings/api-token', {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            })
                                .then((response) => response.json())
                                .then((data) => {
                                    const input = document.querySelector(
                                        'input[placeholder="Votre clé API apparaîtra ici après régénération"]',
                                    ) as HTMLInputElement;
                                    if (input) {
                                        input.value = data.token;
                                    }
                                })
                                .catch((error) => {
                                    // Handle error
                                    console.error(
                                        'Error regenerating API key:',
                                        error,
                                    );
                                });
                        }}
                        className="cursor-pointer"
                    >
                        Régénérer la clé API
                    </Button>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
