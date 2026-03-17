import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

type ReactionType = 'like' | 'dislike' | null;

type ReactionButtonsProps = {
    resource: 'tracks' | 'albums';
    resourceId: number;
    initialReaction?: ReactionType;
    initialLikes?: number;
    initialDislikes?: number;
    className?: string;
    size?: 'sm' | 'default';
    showLabels?: boolean;
};

export function ReactionButtons({
    resource,
    resourceId,
    initialReaction = null,
    initialLikes = 0,
    initialDislikes = 0,
    className,
    size = 'sm',
    showLabels = false,
}: ReactionButtonsProps) {
    const [reaction, setReaction] = useState<ReactionType>(initialReaction);
    const [likes, setLikes] = useState(initialLikes);
    const [dislikes, setDislikes] = useState(initialDislikes);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitReaction = async (nextReaction: Exclude<ReactionType, null>) => {
        if (isSubmitting) {
            return;
        }

        const desiredReaction = reaction === nextReaction ? 'none' : nextReaction;

        setIsSubmitting(true);

        try {
            const response = await fetch(`/reactions/${resource}/${resourceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') ?? '',
                },
                body: JSON.stringify({ reaction: desiredReaction }),
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            setReaction(data.reaction ?? null);
            setLikes(data.likes ?? 0);
            setDislikes(data.dislikes ?? 0);
        } catch (error) {
            console.error('Erreur reaction:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const buttonSize = size === 'default' ? 'default' : 'sm';
    const wrapperClassName =
        size === 'default'
            ? 'rounded-full border border-border/70 bg-background/80 p-1 backdrop-blur-sm'
            : 'rounded-full border border-border/60 bg-background/65 p-0.5 backdrop-blur-sm';

    return (
        <div className={cn('flex items-center gap-1', wrapperClassName, className)}>
            <Button
                type="button"
                variant="ghost"
                size={buttonSize}
                className={cn(
                    'rounded-full px-2.5',
                    reaction === 'like' && 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20',
                )}
                onClick={() => submitReaction('like')}
                disabled={isSubmitting}
                aria-pressed={reaction === 'like'}
            >
                {isSubmitting && reaction !== 'dislike' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <ThumbsUp className="h-4 w-4" />
                )}
                <span className="font-mono text-xs">{likes}</span>
                {showLabels && <span className="text-xs">Like</span>}
            </Button>

            <Button
                type="button"
                variant="ghost"
                size={buttonSize}
                className={cn(
                    'rounded-full px-2.5',
                    reaction === 'dislike' && 'bg-rose-500/15 text-rose-600 hover:bg-rose-500/20',
                )}
                onClick={() => submitReaction('dislike')}
                disabled={isSubmitting}
                aria-pressed={reaction === 'dislike'}
            >
                {isSubmitting && reaction !== 'like' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <ThumbsDown className="h-4 w-4" />
                )}
                <span className="font-mono text-xs">{dislikes}</span>
                {showLabels && <span className="text-xs">Dislike</span>}
            </Button>
        </div>
    );
}
