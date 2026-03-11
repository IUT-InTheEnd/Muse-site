import { Form, Head } from '@inertiajs/react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <AuthLayout
            title="Créer un compte"
            description="Entrez votre pseudonyme, adresse e-mail et mot de passe pour créer un compte (* obligatoires)."
        >
            <Head title="S'inscrire" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Pseudonyme*</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="JohnDoe67"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Adresse e-mail*</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">Mot de passe*</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Mot de passe sécurisé"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmez le mot de passe*
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirmez votre mot de passe"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Le mot de passe doit contenir au moins 12
                                caractères, une lettre majuscule, une lettre
                                minuscule et un chiffre.
                            </p>

                            <Button
                                type="submit"
                                className="mt-2 w-full"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                S'inscrire
                            </Button>

                            <Label
                                htmlFor="terms"
                                className="flex items-center"
                            >
                                <Checkbox
                                    id="terms"
                                    name="terms"
                                    required
                                    tabIndex={6}
                                    className="mr-2"
                                />
                                <span>
                                    J'accepte les{' '}
                                    <TextLink href="/mentionslegales" tabIndex={7}>
                                        conditions d'utilisation
                                    </TextLink>{' '}
                                    et la{' '}
                                    <TextLink href="/pilotiqueconfidentialite" tabIndex={8}>
                                        politique de confidentialité
                                    </TextLink>
                                    .
                                </span>
                            </Label>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Vous avez déjà un compte ?{' '}
                            <TextLink href={login()} tabIndex={6}>
                                Connectez-vous
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
