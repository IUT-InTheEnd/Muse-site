import { Head } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function Support() {
    const [canSubmit, setCanSubmit] = useState(true);
    const selectRef = useRef<HTMLElement | null>(null);
    const nameRef = useRef<HTMLInputElement | null>(null);
    const messageRef = useRef<HTMLTextAreaElement | null>(null);

    function checkSubmition() {
        const select = selectRef.current;
        const name = nameRef.current;
        const message = messageRef.current;

        let tempSub = false;
        if (select !== null && select.nextSibling.value === "placeholder") {
            tempSub = true;
        }
        if (name !== null && (name.value.length < 2 || name.value.length > 255)) {
            tempSub = true;
        }
        if (message !== null && (message.value.length < 16 || message.value.length > 511)) {
            tempSub = true;
        }

        setCanSubmit(tempSub);
    }

    return (
        <>
            <Head title="Support" />
            <div className="flex h-screen items-center justify-center">
                <div>
                    <h1>Contacter le support</h1>
                    <p>
                        En cas de problème ou pour toute autre demande contactez
                        le support via le formulaire ci-dessous ou à l’adresse
                        <b> in.the.end22300@gmail.com.</b> <br />
                        Une réponse sera envoyée sous un délais de 48h après
                        vore demande.
                    </p>
                    <form onChange={checkSubmition} className="w-full">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="form-email">
                                    Adresse mail
                                </FieldLabel>
                                <Input
                                    id="form-email"
                                    type="email"
                                    placeholder="mail@example.com"
                                    required
                                    className="bg-white text-black"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="form-name">Nom</FieldLabel>
                                <Input
                                    id="form-name"
                                    type="text"
                                    placeholder="Votre nom"
                                    ref={nameRef}
                                    required
                                    className="bg-white text-black"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="form-reason">
                                    Motif de la demande
                                </FieldLabel>
                                <Select defaultValue="placeholder">
                                    <SelectTrigger
                                        id="form-reason"
                                        ref={selectRef}
                                        className="bg-white text-black"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white text-black">
                                        <SelectItem
                                            value="placeholder"
                                            disabled
                                        >
                                            Quelle est votre raison de nous
                                            contacter
                                        </SelectItem>
                                        <SelectItem value="compte">
                                            J'ai un problème avec mon compte
                                        </SelectItem>
                                        <SelectItem value="consult">
                                            Je souhaite consulter mes données
                                            personnelles
                                        </SelectItem>
                                        <SelectItem value="suppr">
                                            Je souhaite demander la suppréssion
                                            de mes données personnelles
                                        </SelectItem>
                                        <SelectItem value="modif">
                                            Je souhaite modifier mes données
                                            personnelles
                                        </SelectItem>
                                        <SelectItem value="uk">
                                            United Kingdom
                                        </SelectItem>
                                        <SelectItem value="other">
                                            Autre
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FieldDescription></FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="form-message">
                                    Message
                                </FieldLabel>
                                <Textarea
                                    id="form-message"
                                    placeholder="Votre Message"
                                    ref={messageRef}
                                    className="h-50 bg-white text-black"
                                />
                            </Field>
                            <Field orientation="horizontal">
                                <Button
                                    type="submit"
                                    className="w-1/2 bg-[#5E00FF] text-white hover:bg-[#C9B6E9] hover:text-black"
                                    disabled={canSubmit}
                                >
                                    Submit
                                </Button>
                                <Button
                                    type="button"
                                    className="w-1/2 bg-[#757575] text-white hover:bg-[#D9D9D9] hover:text-black"
                                >
                                    Cancel
                                </Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </div>
            </div>
        </>
    );
}
