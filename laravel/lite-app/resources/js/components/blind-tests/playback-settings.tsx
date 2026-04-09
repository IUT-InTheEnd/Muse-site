import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export type BlindTestDifficulty = 'facile' | 'moyen' | 'dur';

export type BlindTestPlaybackSettingsValue = {
    difficulty: BlindTestDifficulty;
};

const DIFFICULTY_OPTIONS: Array<{
    value: BlindTestDifficulty;
    label: string;
    durationSeconds: number;
}> = [
    { value: 'facile', label: 'Facile', durationSeconds: 10 },
    { value: 'moyen', label: 'Moyen', durationSeconds: 5 },
    { value: 'dur', label: 'Difficile', durationSeconds: 3 },
];

export const DEFAULT_BLIND_TEST_PLAYBACK_SETTINGS: BlindTestPlaybackSettingsValue = {
    difficulty: 'moyen',
};

export function getClipDurationSeconds(difficulty: BlindTestDifficulty): number {
    return DIFFICULTY_OPTIONS.find((option) => option.value === difficulty)?.durationSeconds ?? 5;
}

type Props = {
    value: BlindTestPlaybackSettingsValue;
    onChange: (value: BlindTestPlaybackSettingsValue) => void;
    disabled?: boolean;
};

export function BlindTestPlaybackSettings({
    value,
    onChange,
    disabled = false,
}: Props) {
    return (
        <section className="space-y-4 rounded-2xl border bg-background p-5">
            <div className="space-y-1">
                <h2 className="text-sm font-semibold">Paramètres de lecture</h2>
                <p className="text-sm text-muted-foreground">
                    Ces réglages servent de base au prochain lancement du blind test.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="blind-test-difficulty">Difficulté</Label>
                <Select
                    value={value.difficulty}
                    onValueChange={(difficulty: BlindTestDifficulty) => onChange({ ...value, difficulty })}
                    disabled={disabled}
                >
                    <SelectTrigger id="blind-test-difficulty">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {DIFFICULTY_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label} ({option.durationSeconds}s)
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </section>
    );
}
