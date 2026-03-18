import { Button } from '@/components/ui/button';
import {
    type ReactionType,
    useReactionContext,
} from '@/contexts/reaction-context';
import { cn } from '@/lib/utils';
import { Loader2, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ReactionButtonsProps = {
    resource: 'tracks' | 'albums';
    resourceId: number;
    initialReaction?: ReactionType;
    initialLikes?: number;
    initialDislikes?: number;
    className?: string;
    size?: 'sm' | 'default';
    showLabels?: boolean;
    showCounts?: boolean;
    appearance?: 'default' | 'player';
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
    showCounts = true,
    appearance = 'default',
}: ReactionButtonsProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {
        getReaction,
        seedReaction,
        startRequest,
        finishRequest,
        failRequest,
    } = useReactionContext();
    const lastSeededKeyRef = useRef<string | null>(null);

    useEffect(() => {
        const nextSeedKey = `${resource}:${resourceId}`;

        if (lastSeededKeyRef.current === nextSeedKey) {
            return;
        }

        seedReaction(resource, resourceId, {
            reaction: initialReaction,
            likes: initialLikes,
            dislikes: initialDislikes,
        });
        lastSeededKeyRef.current = nextSeedKey;
    }, [
        resource,
        resourceId,
        seedReaction,
    ]);

    const currentState = getReaction(resource, resourceId) ?? {
        reaction: initialReaction,
        likes: initialLikes,
        dislikes: initialDislikes,
    };
    const reaction = currentState.reaction;
    const likes = currentState.likes;
    const dislikes = currentState.dislikes;
    const isPending = currentState.pending;

    const submitReaction = async (
        nextReaction: Exclude<ReactionType, null>,
    ) => {
        if (isSubmitting || isPending) {
            return;
        }

        const desiredReaction =
            reaction === nextReaction ? 'none' : nextReaction;
        const requestVersion = startRequest(resource, resourceId);

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
            finishRequest(resource, resourceId, requestVersion, {
                reaction: data.reaction ?? null,
                likes: data.likes ?? 0,
                dislikes: data.dislikes ?? 0,
            });
        } catch (error) {
            console.error('Erreur reaction:', error);
            failRequest(resource, resourceId, requestVersion);
        } finally {
            setIsSubmitting(false);
        }
    };

    const buttonSize = size === 'default' ? 'default' : 'sm';
    const wrapperClassName =
        appearance === 'player'
            ? 'gap-2'
            : size === 'default'
              ? 'rounded-full border border-border/70 bg-background/80 p-1 backdrop-blur-sm'
              : 'rounded-full border border-border/60 bg-background/65 p-0.5 backdrop-blur-sm';

    const buttonBaseClassName =
        appearance === 'player'
            ? 'h-10 w-10 rounded-full p-0 text-neutral-500 hover:bg-neutral-200/80 hover:text-neutral-800 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white'
            : 'rounded-full px-2.5';

    const activeLikeClassName =
        appearance === 'player'
            ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400'
            : 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20';

    const activeDislikeClassName =
        appearance === 'player'
            ? 'bg-rose-500/15 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400'
            : 'bg-rose-500/15 text-rose-600 hover:bg-rose-500/20';

    return (
        <div
            className={cn('flex items-center gap-1', wrapperClassName, className)}
            onClick={(event) => event.stopPropagation()}
            onMouseDown={(event) => event.stopPropagation()}
        >
            <Button
                type="button"
                variant="ghost"
                size={buttonSize}
                className={cn(
                    buttonBaseClassName,
                    reaction === 'like' && activeLikeClassName,
                )}
                onClick={(event) => {
                    event.stopPropagation();
                    void submitReaction('like');
                }}
                disabled={isSubmitting || isPending}
                aria-pressed={reaction === 'like'}
            >
                {isSubmitting && reaction !== 'dislike' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <ThumbsUp className="h-4 w-4" />
                )}
                {showCounts && (
                    <span className="font-mono text-xs">{likes}</span>
                )}
                {showLabels && <span className="text-xs">J'aime</span>}
            </Button>

            <Button
                type="button"
                variant="ghost"
                size={buttonSize}
                className={cn(
                    buttonBaseClassName,
                    reaction === 'dislike' && activeDislikeClassName,
                )}
                onClick={(event) => {
                    event.stopPropagation();
                    void submitReaction('dislike');
                }}
                disabled={isSubmitting || isPending}
                aria-pressed={reaction === 'dislike'}
            >
                {isSubmitting && reaction !== 'like' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <ThumbsDown className="h-4 w-4" />
                )}
                {showCounts && (
                    <span className="font-mono text-xs">{dislikes}</span>
                )}
                {showLabels && <span className="text-xs">Je n'aime pas</span>}
            </Button>
        </div>
    );
}
