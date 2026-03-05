import { Slot } from '@radix-ui/react-slot';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { LoaderIcon, PauseIcon, PlayIcon } from 'lucide-react';
import * as React from 'react';

import { useMusicPlayer } from '@/hooks/use-music-player';
import { fetchTrack, fetchTracks } from '@/lib/track-api';
import { cn } from '@/lib/utils';

const CardVariants = cva('flex flex-col rounded-xl overflow-hidden ', {
    variants: {
        type: {
            media: 'gap-2', // musique ou album
            playlist: 'justify-center',
            envies: 'justify-center',
            artist: 'items-center text-center gap-3',
        },
        variant: {
            musique: 'bg-music-card',
            album: 'bg-album-card',
            artist: 'bg-artist-card',
            playlist: 'bg-playlist-card',
            envies: 'bg-envies-card',
        },
    },
    defaultVariants: {
        type: 'media',
        variant: 'musique',
    },
});

function Card({
    className,
    asChild = false,
    variant,
    type,
    ...props
}: React.ComponentProps<'div'> &
    VariantProps<typeof CardVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot : 'div';

    return (
        <Comp
            data-slot="card"
            className={cn(
                CardVariants({ variant, type }),
                'group transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                className,
            )}
            {...props}
        />
    );
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-title"
            className={cn('leading-none font-semibold', className)}
            {...props}
        />
    );
}

function CardSubtitle({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-subtitle"
            className={cn('text-sm', className)}
            {...props}
        />
    );
}

function CardIcon({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-icon"
            className={cn('px-6', className)}
            {...props}
        />
    );
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
    return (
        <div
            data-slot="card-content"
            className={cn('px-6', className)}
            {...props}
        />
    );
}

function CardCover({
    className,
    rounded = false,
    ...props
}: React.ComponentProps<'img'> & { rounded?: boolean }) {
    return (
        <img
            className={cn(
                'aspect-square w-full object-cover',
                rounded && 'rounded-full',
                className,
            )}
            alt="Card Cover"
            {...props}
        />
    );
}

export type CardPlayButtonProps = {
    trackId?: number;
    trackIds?: number[];
    className?: string;
    size?: 'sm' | 'md' | 'lg';
};

function CardPlayButton({
    trackId,
    trackIds,
    className,
    size = 'md',
}: CardPlayButtonProps) {
    const { playTrack, setPlaylist, playing, isLoading } = useMusicPlayer();
    const [isLoadingTrack, setIsLoadingTrack] = React.useState(false);
    const [isActive, setIsActive] = React.useState(false);

    const isLoadingThis = (isLoading || isLoadingTrack) && isActive;
    const isPlaying = playing && isActive;

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    };

    const iconSizes = {
        sm: 16,
        md: 20,
        lg: 24,
    };

    const handlePlay = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setIsActive(true);
        setIsLoadingTrack(true);

        try {
            // Mode multiple tracks (album ou playlist)
            if (trackIds && trackIds.length > 0) {
                const allTracksData = await fetchTracks(trackIds);
                setPlaylist(allTracksData, 0);
            }
            // Mode single track
            else if (trackId) {
                const trackData = await fetchTrack(trackId);
                playTrack(trackData);
            }
        } catch (err) {
            console.error(err);
            setIsActive(false);
        } finally {
            setIsLoadingTrack(false);
        }
    };

    return (
        <button
            onClick={handlePlay}
            disabled={isLoadingThis}
            className={cn(
                'absolute right-2 bottom-2 flex items-center justify-center rounded-full',
                'bg-primary text-primary-foreground shadow-lg',
                'opacity-0 transition-all duration-200 group-hover:opacity-100',
                'hover:scale-105 active:scale-95',
                'disabled:cursor-not-allowed disabled:opacity-50',
                sizeClasses[size],
                className,
            )}
            aria-label={isPlaying ? 'Pause' : 'Play'}
        >
            {isLoadingThis ? (
                <LoaderIcon size={iconSizes[size]} className="animate-spin" />
            ) : isPlaying ? (
                <PauseIcon size={iconSizes[size]} />
            ) : (
                <PlayIcon size={iconSizes[size]} />
            )}
        </button>
    );
}

export {
    Card,
    CardContent,
    CardCover,
    CardIcon,
    CardPlayButton,
    CardSubtitle,
    CardTitle,
    CardVariants,
};
