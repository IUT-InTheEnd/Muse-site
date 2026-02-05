import {Head} from '@inertiajs/react';
import {Button} from '@/components/ui/button';
import {Field, FieldGroup, FieldLabel, FieldDescription} from '@/components/ui/field';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectTrigger, SelectValue, SelectItem} from '@/components/ui/select';
import {Textarea} from '@/components/ui/textarea';

export default function Support() {
    return (
        <>
            <Head title="Support" />
            <div className="h-screen flex justify-center items-center">
            <div>
                <h1>Contacter le support</h1>
                <p>
                    En cas de problème ou pour toute autre demande contactez le
                    support via le formulaire ci-dessous ou à l’adresse
                    <b> in.the.end22300@gmail.com.</b> <br />
                    Une réponse sera envoyée sous un délais de 48h après vore
                    demande.
                </p>
                <form className="w-full">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="form-email">Adresse mail</FieldLabel>
                            <Input
                                id="form-email"
                                type="email"
                                placeholder="mail@example.com"
                                required
                                className="bg-white text-black"
                            />
                            <FieldDescription>
                                We&apos;ll never share your email with anyone.
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="form-name">Nom</FieldLabel>
                            <Input
                                id="form-name"
                                type="text"
                                placeholder="Votre nom"
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
                                    className="bg-white text-black"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white text-black">
                                    <SelectItem value="placeholder" disabled>
                                        Quelle est votre raison de nous contacter
                                    </SelectItem>
                                    <SelectItem value="uk">
                                        United Kingdom
                                    </SelectItem>
                                    <SelectItem value="other">
                                        Autre
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="form-message">
                                Message
                            </FieldLabel>
                            <Textarea
                                id="form-message"
                                placeholder="Votre Message"
                                className="bg-white text-black h-50"
                            />
                        </Field>
                        <Field orientation="horizontal">
                            <Button
                                type="submit"
                                className="bg-[#5E00FF] text-white w-1/2"
                            >
                                Submit
                            </Button>
                            <Button
                                type="button"
                                className="bg-[#757575] text-white w-1/2"
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
