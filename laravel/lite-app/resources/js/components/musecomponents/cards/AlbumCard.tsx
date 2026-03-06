import type { VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import type {CardVariants} from '@/components/musecomponents/cards/Card';
import {
    Card,
    CardPlayButton
} from '@/components/musecomponents/cards/Card';

type CardProps = ComponentProps<'div'> &
    VariantProps<typeof CardVariants> & {
        trackIds?: number[];
    };

export function AlbumCard({ trackIds, children, ...props }: CardProps) {
    return (
        <Card type="media" variant="album" className="relative" {...props}>
            {children}
            {trackIds && trackIds.length > 0 && (
                <CardPlayButton trackIds={trackIds} />
            )}
        </Card>
    );
}

// utilisation

{
    /*


<AlbumCard trackIds={[1, 2, 3, 4]}>
  <Link href="/albums/12">
    <CardCover src="/images/album.jpg" alt="Les étoiles vagabondes" />
    <CardContent>
      <CardTitle>Les étoiles vagabondes</CardTitle>
      <CardSubtitle>Nekfeu</CardSubtitle>
    </CardContent>
  </Link>
</AlbumCard>
*/
}
