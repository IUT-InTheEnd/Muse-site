import { useForm } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import { type FormEventHandler, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    GENDER_OPTIONS,
    INSTRUMENT_OPTIONS,
    JOB_OPTIONS,
    MUSIC_CONTEXT_OPTIONS,
    PLAYS_MUSIC_OPTIONS,
} from '@/lib/user-options';
import type { User } from '@/types';

type EditUserInfoDialogProps = {
    user: User;
};

/**
 * Parse une valeur qui peut être un JSON array stringifié, un array Python-style, ou une string simple
 */
function parseArrayValue(value: string | null | undefined): string[] {
    if (!value) return [];

    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return [String(parsed)];
    } catch {
        const pythonArrayMatch = value.match(/^\[(.+)]$/);
        if (pythonArrayMatch) {
            const content = pythonArrayMatch[1];
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
        return [value];
    }
}

function toBooleanSelectValue(value: string | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    return value === '1' ? '1' : '0';
}

export default function EditUserInfoDialog({ user }: EditUserInfoDialogProps) {
    const [open, setOpen] = useState(false);

    const { data, setData, patch, processing, reset, transform } = useForm({
        user_age: user.user_age?.toString() || '',
        user_gender: user.user_gender || '',
        user_job: user.user_job || '',
        user_plays_music: toBooleanSelectValue(user.user_plays_music),
        user_instruments: parseArrayValue(user.user_instruments),
        user_music_contexts: parseArrayValue(user.user_music_contexts),
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        transform((formData) => ({
            user_age: formData.user_age ? parseFloat(formData.user_age) : null,
            user_gender: formData.user_gender || null,
            user_job: formData.user_job || null,
            user_plays_music:
                formData.user_plays_music === ''
                    ? null
                    : formData.user_plays_music === '1',
            user_instruments: formData.user_instruments,
            user_music_contexts: formData.user_music_contexts,
        }));

        patch('/user/info', {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            reset();
        }
    };

    const toggleArrayItem = (
        field: 'user_instruments' | 'user_music_contexts',
        item: string,
    ) => {
        const current = data[field];
        if (current.includes(item)) {
            // remove item
            setData(
                field,
                current.filter(i => i !== item),
            );
        } else {
            // add it
            setData(field, [...current, item]);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Modifier</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Modifier vos informations</DialogTitle>
                    <DialogDescription>
                        Mettez a jour vos informations personnelles et
                        preferences musicales.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Age */}
                    <div className="grid gap-2">
                        <Label htmlFor="user_age">Age</Label>
                        <Input
                            id="user_age"
                            type="number"
                            min="0"
                            max="200"
                            value={data.user_age}
                            onChange={(e) =>
                                setData('user_age', e.target.value)
                            }
                            placeholder="Votre age"
                        />
                    </div>

                    {/* Genre */}
                    <div className="grid gap-2">
                        <Label htmlFor="user_gender">Genre</Label>
                        <Select
                            value={data.user_gender}
                            onValueChange={(value) =>
                                setData('user_gender', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selectionnez votre genre" />
                            </SelectTrigger>
                            <SelectContent>
                                {GENDER_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Profession */}
                    <div className="grid gap-2">
                        <Label htmlFor="user_job">Profession</Label>
                        <Select
                            value={data.user_job}
                            onValueChange={(value) =>
                                setData('user_job', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selectionnez votre profession" />
                            </SelectTrigger>
                            <SelectContent>
                                {JOB_OPTIONS.map((option) => (
                                    <SelectItem key={option} value={option}>
                                        {option}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Pratique musicale */}
                    <div className="grid gap-2">
                        <Label htmlFor="user_plays_music">
                            Pratique musicale
                        </Label>
                        <Select
                            value={data.user_plays_music}
                            onValueChange={(value) =>
                                setData('user_plays_music', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Jouez-vous de la musique ?" />
                            </SelectTrigger>
                            <SelectContent>
                                {PLAYS_MUSIC_OPTIONS.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Instruments */}
                    <div className="grid gap-3">
                        <Label>Instruments</Label>
                        <div className="grid gap-2">
                            {INSTRUMENT_OPTIONS.map((option) => (
                                <div
                                    key={option}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={`instrument-${option}`}
                                        checked={data.user_instruments.includes(
                                            option,
                                        )}
                                        onCheckedChange={() =>
                                            toggleArrayItem(
                                                'user_instruments',
                                                option,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor={`instrument-${option}`}
                                        className="text-sm font-normal"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contextes d'ecoute */}
                    <div className="grid gap-3">
                        <Label>Contextes d'ecoute</Label>
                        <div className="grid gap-2">
                            {MUSIC_CONTEXT_OPTIONS.map((option) => (
                                <div
                                    key={option}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={`context-${option}`}
                                        checked={data.user_music_contexts.includes(
                                            option,
                                        )}
                                        onCheckedChange={() =>
                                            toggleArrayItem(
                                                'user_music_contexts',
                                                option,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor={`context-${option}`}
                                        className="text-sm font-normal"
                                    >
                                        {option}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Annuler
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Enregistrement...' : 'Enregistrer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
