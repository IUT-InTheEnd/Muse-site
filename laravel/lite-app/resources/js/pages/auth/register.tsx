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
import { useState, useEffect, ChangeEvent } from 'react';

export default function Register() {
    // Verification champs (vide ou remplis)
    const [nameValue, setNameValue] = useState('');
    const [emailValue, setEmailValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [passwordConfirmValue, setPasswordConfirmValue] = useState('');
    const [termsChecked, setTermsChecked] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    // Pour afficher ou non le mdp
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    // Verification mdp
    const longueurMin = passwordValue.length >= 12;
    const majuscule = /[A-Z]/.test(passwordValue);
    const minuscule = /[a-z]/.test(passwordValue);
    const chiffre = /[0-9]/.test(passwordValue);
    const motsDePasseCorrespondent = passwordValue !== '' && passwordValue === passwordConfirmValue;

    // Désactivation ou non du bouton d'envoi du formulaire
    useEffect(() => {
        const filled =
            nameValue.trim() !== '' &&
            emailValue.trim() !== '' &&
            passwordValue !== '' &&
            passwordConfirmValue !== '' &&
            longueurMin &&
            majuscule &&
            minuscule &&
            chiffre &&
            motsDePasseCorrespondent &&
            termsChecked;
        setIsFormValid(filled);
    }, [nameValue, emailValue, passwordValue, passwordConfirmValue, termsChecked]);

    return (
        <AuthLayout title="Créer un compte" description="Entrez votre pseudonyme, adresse e-mail et mot de passe pour créer un compte (* obligatoires).">
            <Head title="S'inscrire" />
            <Form {...store.form()} resetOnSuccess={['password', 'password_confirmation']} disableWhileProcessing className="flex flex-col gap-6">
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Pseudonyme*</Label>
                                <Input id="name" type="text"  required autoFocus tabIndex={1} autoComplete="name" name="name" placeholder="JohnDoe67" value={nameValue} onChange={(e: ChangeEvent<HTMLInputElement>) => setNameValue(e.target.value)}/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Adresse e-mail*</Label>
                                <Input id="email" type="email" required tabIndex={2} autoComplete="email" name="email" placeholder="email@example.com" value={emailValue} onChange={(e) => setEmailValue(e.target.value)}/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password">Mot de passe*</Label>
                                <div className="space-y-1">
                                    <div className={`flex items-center text-xs ${longueurMin ? 'text-green-500' : 'text-muted-foreground'}`}>
                                        <span className="w-4 inline-block mr-2">{longueurMin ? '✓' : '•'}</span>
                                        12 caractères
                                    </div>
                                    <div className={`flex items-center text-xs ${majuscule ? 'text-green-500' : 'text-muted-foreground'}`}>
                                        <span className="w-4 inline-block mr-2">{majuscule ? '✓' : '•'}</span>
                                        1 lettre majuscule
                                    </div>
                                    <div className={`flex items-center text-xs ${minuscule ? 'text-green-500' : 'text-muted-foreground'}`}>
                                        <span className="w-4 inline-block mr-2">{minuscule ? '✓' : '•'}</span>
                                        1 lettre minuscule
                                    </div>
                                    <div className={`flex items-center text-xs ${chiffre ? 'text-green-500' : 'text-muted-foreground'}`}>
                                        <span className="w-4 inline-block mr-2">{chiffre ? '✓' : '•'}</span>
                                        1 chiffre
                                    </div>
                                    <div className={`flex items-center text-xs ${motsDePasseCorrespondent ? 'text-green-500' : 'text-muted-foreground'}`}>
                                        <span className="w-4 inline-block mr-2">{motsDePasseCorrespondent ? '✓' : '•'}</span>
                                        Les mots de passe correspondent
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input id="password" type={showPassword ? 'text' : 'password'} required tabIndex={3} autoComplete="new-password" name="password" placeholder="Mot de passe sécurisé" value={passwordValue} onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordValue(e.target.value)}/>
                                    <button type="button" aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'} className="ml-2 inline-flex items-center p-2 rounded hover:bg-gray-700" onClick={() => setShowPassword((s) => !s)} >
                                        {showPassword ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3-11-7 1.06-2.08 2.77-3.86 4.78-5.03M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z" />
                                                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                                            </svg>
                                        )}
                                    </button>
                                    <InputError message={errors.password} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmez le mot de passe*
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input id="password_confirmation" type={showPasswordConfirm ? 'text' : 'password'} required tabIndex={4} autoComplete="new-password" name="password_confirmation" placeholder="Confirmez votre mot de passe" value={passwordConfirmValue} onChange={(e) => setPasswordConfirmValue(e.target.value)} />
                                    <button type="button" aria-label={showPasswordConfirm ? 'Cacher la confirmation' : 'Afficher la confirmation'} className="ml-2 inline-flex items-center p-2 rounded hover:bg-gray-700" onClick={() => setShowPasswordConfirm((s) => !s)} >
                                        {showPasswordConfirm ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3-11-7 1.06-2.08 2.77-3.86 4.78-5.03M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z" />
                                                <circle cx="12" cy="12" r="3" strokeWidth="2" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Le mot de passe doit contenir au moins 12
                                caractères, une lettre majuscule, une lettre
                                minuscule et un chiffre.
                            </p>

                            <Button
                                type="submit"
                                className="mt-2 w-full cursor-pointer"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                S'inscrire
                            </Button>
                            <Label htmlFor="terms" className="flex items-center" >
                                <Checkbox id="terms" name="terms" required tabIndex={6} className="mr-2" checked={termsChecked} onCheckedChange={(val: boolean | "indeterminate") => setTermsChecked(!!val)}/>
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
