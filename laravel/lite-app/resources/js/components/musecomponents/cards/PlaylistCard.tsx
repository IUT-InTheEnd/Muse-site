import {
    Card,
    CardPlayButton,
    CardVariants,
} from '@/components/musecomponents/cards/Card';
import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

type CardProps = ComponentProps<'div'> &
    VariantProps<typeof CardVariants> & {
        trackIds?: number[];
    };

export function PlaylistCard({ trackIds, children, ...props }: CardProps) {
    return (
        <Card
            type="playlist"
            variant="playlist"
            className="relative"
            {...props}
        >
            {children}
            {trackIds && trackIds.length > 0 && (
                <CardPlayButton trackIds={trackIds} />
            )}
        </Card>
    );
}

// utilisation :

{
    /* 
<PlaylistCard trackIds={[1, 2, 3]}>
  <Link href="/playlists/1">
    <CardCover src="/playlist.jpg" />
    <CardContent>
      <CardTitle>Road trip</CardTitle>
    </CardContent>
  </Link>
</PlaylistCard> 
*/
}
