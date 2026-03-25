import { Form, Head } from '@inertiajs/react';
import type { ChangeEvent } from 'react';
import { useState, useEffect } from 'react';
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
import { Eye, EyeClosed } from 'lucide-react';
import { LONGUEUR_MDP, MAJUSCULE, MINUSCULE, NOMBRE, SYMBOLE } from '@/lib/constante_generale';


function getCaractereRandom(characters: string) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return characters[values[0] % characters.length];
}

function shuffleCharacters(characters: string[]) {
    const shuffled = [...characters];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const values = new Uint32Array(1);
        crypto.getRandomValues(values);
        const randomIndex = values[0] % (i + 1);

        [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
    }

    return shuffled;
}

function genererMDP(length = LONGUEUR_MDP) {
    const allCharacters = MAJUSCULE + MINUSCULE + NOMBRE + SYMBOLE;

    const password = [
        getCaractereRandom(MAJUSCULE),
        getCaractereRandom(MINUSCULE),
        getCaractereRandom(NOMBRE),
        getCaractereRandom(SYMBOLE),
    ];

    while (password.length < length) {
        password.push(getCaractereRandom(allCharacters));
    }

    return shuffleCharacters(password).join('');
}

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

    const handleGeneratePassword = () => {
        const mdpGenerer = genererMDP();

        setPasswordValue(mdpGenerer);
        setPasswordConfirmValue(mdpGenerer);
        setShowPassword(true);
        setShowPasswordConfirm(true);
    };

    // Verification mdp
    const longueurMin = passwordValue.length >= 12;
    const majuscule = /[A-Z]/.test(passwordValue);
    const minuscule = /[a-z]/.test(passwordValue);
    const chiffre = /[0-9]/.test(passwordValue);
    const symbole = /[!@#$%^&*()_+€£µ§?/\|{}[\]]/.test(passwordValue);
    const motsDePasseCorrespondent = passwordValue !== '' && passwordValue === passwordConfirmValue;
    const emailFormat = emailValue.trim() === '' || emailValue.includes('@');

    // Désactivation ou non du bouton d'envoi du formulaire
    useEffect(() => {
        const filled =
            nameValue.trim() !== '' &&
            emailValue.trim() !== '' &&
            emailFormat &&
            passwordValue !== '' &&
            passwordConfirmValue !== '' &&
            longueurMin &&
            majuscule &&
            minuscule &&
            chiffre &&
            symbole &&
            motsDePasseCorrespondent &&
            termsChecked;
        setIsFormValid(filled);
    }, [nameValue, emailValue, passwordValue, passwordConfirmValue, termsChecked, emailFormat]);

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
                            <InputError message={errors.name} />
                            <div className="grid gap-2">
                                <Label htmlFor="email">Adresse e-mail*</Label>
                                <Input id="email" type="email" required tabIndex={2} autoComplete="email" name="email" placeholder="email@example.com" value={emailValue} onChange={(e) => setEmailValue(e.target.value)}/>
                                {!emailFormat && (
                                    <InputError message="L’adresse e-mail doit contenir un @." />
                                )}
                            </div>
                            {emailFormat && <InputError message={errors.email} />}
                            <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-2">
                                    <Label htmlFor="password">Mot de passe*</Label>
                                    <Button type="button" size="sm" tabIndex={3} onClick={handleGeneratePassword}>
                                        Générer un mot de passe
                                    </Button>
                                </div>
                                <div className="space-y-1">
                                    <div className={`flex items-center text-xs ${longueurMin ? 'text-green-500' : 'text-red-500'}`}>
                                        <span className="w-4 inline-block mr-2">{longueurMin ? '✓' : '•'}</span>
                                        12 caractères
                                    </div>
                                    <div className={`flex items-center text-xs ${majuscule ? 'text-green-500' : 'text-red-500'}`}>
                                        <span className="w-4 inline-block mr-2">{majuscule ? '✓' : '•'}</span>
                                        1 lettre majuscule
                                    </div>
                                    <div className={`flex items-center text-xs ${minuscule ? 'text-green-500' : 'text-red-500'}`}>
                                        <span className="w-4 inline-block mr-2">{minuscule ? '✓' : '•'}</span>
                                        1 lettre minuscule
                                    </div>
                                    <div className={`flex items-center text-xs ${chiffre ? 'text-green-500' : 'text-red-500'}`}>
                                        <span className="w-4 inline-block mr-2">{chiffre ? '✓' : '•'}</span>
                                        1 chiffre
                                    </div>
                                    <div className={`flex items-center text-xs ${symbole ? 'text-green-500' : 'text-red-500'}`}>
                                        <span className="w-4 inline-block mr-2">{symbole ? '✓' : '•'}</span>
                                        1 symbole
                                    </div>
                                    <div className={`flex items-center text-xs ${motsDePasseCorrespondent ? 'text-green-500' : 'text-red-500'}`}>
                                        <span className="w-4 inline-block mr-2">{motsDePasseCorrespondent ? '✓' : '•'}</span>
                                        Les mots de passe correspondent
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Input id="password" type={showPassword ? 'text' : 'password'} required tabIndex={4} autoComplete="new-password" name="password" placeholder="Mot de passe sécurisé" value={passwordValue} onChange={(e: ChangeEvent<HTMLInputElement>) => setPasswordValue(e.target.value)}/>
                                    <button type="button" aria-label={showPassword ? 'Cacher le mot de passe' : 'Afficher le mot de passe'} className="ml-2 inline-flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer" onClick={() => setShowPassword((s) => !s)} >
                                        {showPassword ? (
                                            <Eye />
                                        ) : (
                                           <EyeClosed />
                                        )}
                                    </button>
                                </div>
                                <InputError message={errors.password} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    Confirmez le mot de passe*
                                </Label>
                                <div className="flex items-center gap-2">
                                    <Input id="password_confirmation" type={showPasswordConfirm ? 'text' : 'password'} required tabIndex={5} autoComplete="new-password" name="password_confirmation" placeholder="Confirmez votre mot de passe" value={passwordConfirmValue} onChange={(e) => setPasswordConfirmValue(e.target.value)} />
                                    <button type="button" aria-label={showPasswordConfirm ? 'Cacher la confirmation' : 'Afficher la confirmation'} className="ml-2 inline-flex items-center p-2 rounded hover:bg-gray-700 cursor-pointer" onClick={() => setShowPasswordConfirm((s) => !s)} >
                                        {showPasswordConfirm ? (
                                            <Eye />
                                        ) : (
                                            <EyeClosed />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-muted-foreground">
                                Le mot de passe doit contenir au moins 12
                                caractères, une lettre majuscule, une lettre
                                minuscule, un chiffre et un symbole.
                            </p>
                            <Label htmlFor="terms" className="flex items-center" >
                                <Checkbox id="terms" name="terms" required tabIndex={7} className="mr-2 border-muted/150 cursor-pointer" checked={termsChecked} onCheckedChange={(val: boolean | "indeterminate") => setTermsChecked(!!val)}/>
                                <span>
                                    J'accepte les{' '}
                                    <TextLink href="/mentionslegales" tabIndex={8}>
                                        conditions d'utilisation
                                    </TextLink>{' '}
                                    et la{' '}
                                    <TextLink href="/politiquedeconfidentialite" tabIndex={9}>
                                        politique de confidentialité
                                    </TextLink>
                                    .
                                </span>
                            </Label>
                            <Button
                                type="submit"
                                className="mt-2 w-full cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                tabIndex={6}
                                data-test="register-user-button"
                                disabled={processing || !isFormValid}
                            >
                                {processing && <Spinner />}
                                S'inscrire
                            </Button>
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                            Vous avez déjà un compte ?{' '}
                            <TextLink href={login()} tabIndex={10}>
                                Connectez-vous
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
